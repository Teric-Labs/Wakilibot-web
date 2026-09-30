/**
 * Real-time ASR (Automatic Speech Recognition) via Ateker WebSocket streaming.
 *
 * Architecture (dual socket):
 *   - Control socket: ws://stt-control.atekervoices.com/control
 *       Manages engine parameters (language, silence timeout, VAD sensitivity).
 *   - Data socket: ws://stt-data.atekervoices.com
 *       Streams raw PCM audio frames and receives transcription events.
 *
 * Audio format sent: Int16LE mono PCM at the AudioContext sample rate (target 16 kHz).
 * Packet structure: [4-byte metadata length LE] + [metadata JSON] + [PCM bytes]
 *
 * Events received on data socket:
 *   { type: "recording_start" | event: "speech_started" }   → VAD detected speech
 *   { type: "realtime", text, is_final: false }              → interim transcript
 *   { type: "recording_stop" | event: "speech_stopped" }     → silence timeout
 *   { type: "fullSentence", text, is_final: true }           → committed utterance
 */

const CONTROL_WS_URL =
  process.env.REACT_APP_ASR_CONTROL_URL || 'ws://stt-control.atekervoices.com/control';

const DATA_WS_URL =
  process.env.REACT_APP_ASR_DATA_URL || 'ws://stt-data.atekervoices.com';

// Language code mapping from our app codes to ASR engine codes
const ASR_LANGUAGE_MAP = {
  en: 'eng',
  eng: 'eng',
  sw: 'swa',
  swa: 'swa',
  lg: 'lug',
  lug: 'lug',
  ac: 'ach',
  ach: 'ach',
  at: 'teo',
  teo: 'teo',
  nyn: 'nyn',
  xog: 'xog',
  kin: 'kin',
  lgg: 'lgg',
  myx: 'myx',
  ttj: 'ttj',
};

const DEFAULT_SILENCE_TIMEOUT = 0.5; // seconds
const DEFAULT_VAD_SENSITIVITY = 0.4;
const BUFFER_SIZE = 4096; // ~92ms at 16kHz — chunk size for ScriptProcessorNode

/**
 * Convert a Float32 audio buffer to Int16LE PCM bytes.
 */
function floatTo16BitPCM(floatSamples) {
  const buffer = new ArrayBuffer(floatSamples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < floatSamples.length; i++) {
    let s = Math.max(-1, Math.min(1, floatSamples[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

/**
 * Build a binary packet: [4-byte metadata length LE][metadata JSON][PCM bytes]
 */
function buildAudioPacket(pcmBytes, sampleRate, language) {
  const metadata = JSON.stringify({ sampleRate, language });
  const metaBytes = new TextEncoder().encode(metadata);
  const metaLen = metaBytes.length;

  const packet = new Uint8Array(4 + metaLen + pcmBytes.length);
  packet[0] = metaLen & 0xff;
  packet[1] = (metaLen >> 8) & 0xff;
  packet[2] = (metaLen >> 16) & 0xff;
  packet[3] = (metaLen >> 24) & 0xff;
  packet.set(metaBytes, 4);
  packet.set(pcmBytes, 4 + metaLen);

  return packet.buffer;
}

/**
 * Start a real-time ASR session.
 *
 * @param {object} options
 * @param {string} options.language - Language code (en, lg, ac, at, nyn, xog, sw, etc.)
 * @param {Function} options.onInterim - Called with { text } for streaming interim results
 * @param {Function} options.onFinal - Called with { text } when an utterance is committed
 * @param {Function} options.onSpeechStart - Called when VAD detects speech beginning
 * @param {Function} options.onSpeechStop - Called when VAD detects end of speech
 * @param {Function} options.onError - Called with (error) on failures
 * @param {Function} [options.onReady] - Called when both sockets are open and mic is streaming
 * @param {number} [options.silenceTimeout] - Post-speech silence before finalising (seconds)
 * @param {number} [options.vadSensitivity] - VAD detection threshold (0.1-0.9)
 * @returns {{ stop: Function, abort: Function }} - Session handle
 */
export const startRealtimeASR = async (options = {}) => {
  const {
    language = 'eng',
    onInterim,
    onFinal,
    onSpeechStart,
    onSpeechStop,
    onError,
    onReady,
    silenceTimeout = DEFAULT_SILENCE_TIMEOUT,
    vadSensitivity = DEFAULT_VAD_SENSITIVITY,
  } = options;

  const asrLanguage = ASR_LANGUAGE_MAP[language?.toLowerCase()] || 'eng';

  let controlSocket = null;
  let dataSocket = null;
  let audioContext = null;
  let mediaStream = null;
  let audioProcessor = null;
  let audioInput = null;
  let isRecording = false;
  let destroyed = false;

  const cleanup = () => {
    isRecording = false;
    if (audioProcessor) {
      try { audioProcessor.disconnect(); } catch (_) { /* noop */ }
      audioProcessor = null;
    }
    if (audioInput) {
      try { audioInput.disconnect(); } catch (_) { /* noop */ }
      audioInput = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
    if (controlSocket && controlSocket.readyState <= WebSocket.OPEN) {
      try { controlSocket.close(); } catch (_) { /* noop */ }
    }
    if (dataSocket && dataSocket.readyState <= WebSocket.OPEN) {
      try { dataSocket.close(); } catch (_) { /* noop */ }
    }
    controlSocket = null;
    dataSocket = null;
  };

  const fail = (err) => {
    if (destroyed) return;
    cleanup();
    if (onError) onError(err instanceof Error ? err : new Error(String(err)));
  };

  // 1. Get microphone access
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
      },
    });
  } catch (micErr) {
    fail(new Error(`Microphone access denied: ${micErr.message}`));
    return { stop: () => {}, abort: () => {} };
  }

  if (destroyed) {
    mediaStream?.getTracks().forEach((t) => t.stop());
    return { stop: () => {}, abort: () => {} };
  }

  // 2. Set up Web Audio (16kHz target, fall back to hardware rate)
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    fail(new Error('Web Audio API not available'));
    return { stop: () => {}, abort: () => {} };
  }

  try {
    audioContext = new AudioCtor({ sampleRate: 16000 });
  } catch (_) {
    audioContext = new AudioCtor();
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume().catch(() => {});
  }

  const actualSampleRate = audioContext.sampleRate;
  audioInput = audioContext.createMediaStreamSource(mediaStream);

  // 3. Open both WebSockets
  let controlReady = false;
  let dataReady = false;

  const checkReady = () => {
    if (controlReady && dataReady && !destroyed) {
      // Both connected: start streaming
      startStreaming();
      if (onReady) onReady();
    }
  };

  try {
    controlSocket = new WebSocket(CONTROL_WS_URL);
  } catch (e) {
    fail(new Error(`Control socket connect failed: ${e.message}`));
    return { stop: cleanup, abort: cleanup };
  }

  try {
    dataSocket = new WebSocket(DATA_WS_URL);
  } catch (e) {
    fail(new Error(`Data socket connect failed: ${e.message}`));
    return { stop: cleanup, abort: cleanup };
  }

  // Control socket handlers
  controlSocket.onopen = () => {
    controlReady = true;
    // Set language and parameters
    controlSocket.send(JSON.stringify({ command: 'set_parameter', parameter: 'language', value: asrLanguage }));
    controlSocket.send(JSON.stringify({ command: 'set_parameter', parameter: 'post_speech_silence_duration', value: silenceTimeout }));
    controlSocket.send(JSON.stringify({ command: 'set_parameter', parameter: 'silero_sensitivity', value: vadSensitivity }));
    checkReady();
  };

  controlSocket.onerror = () => {
    if (!controlReady) fail(new Error('Control socket connection failed'));
  };

  controlSocket.onclose = () => {
    if (controlReady && !destroyed && isRecording) {
      // Unexpected close during active session
      fail(new Error('Control socket closed unexpectedly'));
    }
  };

  controlSocket.onmessage = (event) => {
    // Parse control responses (e.g., current parameter values) — not critical for flow
    try {
      JSON.parse(event.data);
    } catch (_) { /* ignore unparseable */ }
  };

  // Data socket handlers
  dataSocket.onopen = () => {
    dataReady = true;
    // Also set language on data socket
    dataSocket.send(JSON.stringify({ command: 'set_language', language: asrLanguage }));
    checkReady();
  };

  dataSocket.onerror = () => {
    if (!dataReady) fail(new Error('Data socket connection failed'));
  };

  dataSocket.onclose = () => {
    if (dataReady && !destroyed && isRecording) {
      fail(new Error('Data socket closed during recording'));
    }
  };

  dataSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleTranscriptionEvent(data);
    } catch (_) {
      // Non-JSON messages (could be binary confirmation) — ignore
    }
  };

  function handleTranscriptionEvent(data) {
    if (destroyed) return;

    // Speech started (VAD detected beginning)
    if (data.type === 'recording_start' || data.event === 'speech_started') {
      if (onSpeechStart) onSpeechStart();
      return;
    }

    // Interim streaming result
    if (data.type === 'realtime' || (data.text && data.is_final === false)) {
      if (onInterim) onInterim({ text: data.text || '' });
      return;
    }

    // Speech stopped (silence timeout)
    if (data.type === 'recording_stop' || data.event === 'speech_stopped') {
      if (onSpeechStop) onSpeechStop();
      return;
    }

    // Final committed utterance
    if (
      data.type === 'fullSentence' ||
      data.is_final === true ||
      data.speech_final === true
    ) {
      if (onFinal) onFinal({ text: data.text || '' });
      return;
    }
  }

  // 4. Start streaming audio via ScriptProcessorNode
  function startStreaming() {
    if (destroyed) return;

    isRecording = true;
    audioProcessor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

    audioProcessor.onaudioprocess = (e) => {
      if (!isRecording || !dataSocket || dataSocket.readyState !== WebSocket.OPEN) return;
      const inputBuffer = e.inputBuffer.getChannelData(0);
      const pcmBytes = floatTo16BitPCM(inputBuffer);
      const packet = buildAudioPacket(pcmBytes, actualSampleRate, asrLanguage);
      try {
        dataSocket.send(packet);
      } catch (_) {
        // Socket closed mid-send; the onclose handler will clean up
      }
    };

    audioInput.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);
  }

  // Connection timeout
  const connectTimeout = setTimeout(() => {
    if (!controlReady || !dataReady) {
      fail(new Error('ASR WebSocket connection timeout'));
    }
  }, 15000);

  const originalCleanup = cleanup;
  const stop = () => {
    destroyed = true;
    clearTimeout(connectTimeout);
    originalCleanup();
  };

  const abort = () => {
    // Tell the ASR engine to discard current utterance
    if (controlSocket && controlSocket.readyState === WebSocket.OPEN) {
      controlSocket.send(JSON.stringify({ command: 'call_method', method: 'abort' }));
    }
    stop();
  };

  return { stop, abort };
};

/**
 * Translate a language code to the ASR engine format.
 */
export const toAsrLanguageCode = (language) => {
  return ASR_LANGUAGE_MAP[(language || 'en').toLowerCase()] || 'eng';
};

const realtimeASR = { startRealtimeASR, toAsrLanguageCode };
export default realtimeASR;
