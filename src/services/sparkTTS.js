/**
 * Spark TTS - WebSocket streaming speech synthesis.
 *
 * Connects to the Ateker Spark TTS service via WebSocket (not subject to CORS) and
 * plays back the audio as PCM chunks stream in. This gives low-latency time-to-first-
 * audio (TTFA) since playback starts before the full utterance is synthesised.
 *
 * Response protocol:
 *   JSON { type: "start", segment_id } → then binary PCM frames (Int16LE, 16 kHz mono)
 *   JSON { type: "end", segment_id }   → stream finished
 *   JSON { type: "error", message }    → synthesis failed
 *   JSON { type: "ping" }              → respond with { type: "pong" }
 */

const SPARK_TTS_WS_URL =
  process.env.REACT_APP_TTS_WS_URL || 'ws://tts.atekervoices.com/v1/audio/speech/stream/ws';

// Map our language codes to Spark TTS voice identifiers.
// The service supports local Ugandan voices natively.
const VOICE_MAP = {
  en: 'eng_female_1',
  sw: 'swa_female_1', // fallback if swa not available, will try eng
  lg: 'lug_female_4',
  ac: 'ach_female_2',
  at: 'teo_female_1',
  nyn: 'nyn_female_10',
  xog: 'lug_female_4', // Lusoga closest to Luganda voice
};

const MALE_VOICE_MAP = {
  en: 'eng_male_1',
  lg: 'lug_male_1',
};

const DEFAULT_TEMPERATURE = 0.7;
const SAMPLE_RATE = 16000;

/**
 * Resolve a Spark voice ID from a language code and optional gender preference.
 */
export const resolveVoice = (language, gender = 'female') => {
  const normalized = (language || 'en').toLowerCase().slice(0, 3);
  const map = gender === 'male' ? MALE_VOICE_MAP : VOICE_MAP;
  return map[normalized] || map[Object.keys(map).find((k) => normalized.startsWith(k))] || 'eng_female_1';
};

/**
 * Stream-synthesize text and play it through Web Audio API.
 *
 * @param {string} text - The text to speak.
 * @param {object} options
 * @param {string} options.language - Language code (en, lg, ac, at, nyn, xog, sw).
 * @param {string} [options.voice] - Explicit voice ID (overrides language mapping).
 * @param {number} [options.temperature] - Sampling temperature (0.1–1.0).
 * @param {string} [options.gender] - 'female' or 'male' for voice selection.
 * @param {Function} [options.onStart] - Called when first audio chunk arrives.
 * @param {Function} [options.onEnd] - Called when playback finishes.
 * @param {Function} [options.onError] - Called on synthesis/network error.
 * @returns {{ abort: Function, promise: Promise }} - abort() stops playback; promise resolves when done.
 */
export const speakStreaming = (text, options = {}) => {
  const {
    language = 'en',
    voice: explicitVoice,
    temperature = DEFAULT_TEMPERATURE,
    gender = 'female',
    onStart,
    onEnd,
    onError,
  } = options;

  if (!text || !text.trim()) {
    if (onError) onError(new Error('No text to synthesize'));
    return { abort: () => {}, promise: Promise.resolve() };
  }

  const voice = explicitVoice || resolveVoice(language, gender);
  let websocket = null;
  let audioContext = null;
  let isReceivingAudio = false;
  let nextStartTime = 0;
  let leftoverBytes = new Uint8Array(0);
  let resolved = false;
  let abortFn = () => {};

  const promise = new Promise((resolve, reject) => {
    const finish = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      if (onEnd) onEnd();
      resolve();
    };

    const fail = (err) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      if (onError) onError(err);
      reject(err);
    };

    const cleanup = () => {
      if (websocket && websocket.readyState <= WebSocket.OPEN) {
        try { websocket.close(); } catch (_) { /* already closed */ }
      }
      websocket = null;
      // Don't close AudioContext immediately - let scheduled buffers finish playing
      if (audioContext) {
        const ctx = audioContext;
        const remaining = Math.max(0, nextStartTime - ctx.currentTime) * 1000 + 100;
        setTimeout(() => { try { ctx.close(); } catch (_) { /* already closed */ } }, remaining);
        audioContext = null;
      }
    };

    abortFn = () => {
      isReceivingAudio = false;
      finish();
    };

    // Initialize AudioContext
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) {
        fail(new Error('Web Audio API not supported'));
        return;
      }
      audioContext = new AudioCtor();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {
      fail(new Error(`Audio context failed: ${e.message}`));
      return;
    }

    // Connect WebSocket
    try {
      websocket = new WebSocket(SPARK_TTS_WS_URL);
      websocket.binaryType = 'arraybuffer';
    } catch (e) {
      fail(new Error(`WebSocket connection failed: ${e.message}`));
      return;
    }

    const connectionTimeout = setTimeout(() => {
      if (websocket && websocket.readyState === WebSocket.CONNECTING) {
        fail(new Error('TTS WebSocket connection timeout'));
      }
    }, 15000);

    websocket.onopen = () => {
      clearTimeout(connectionTimeout);
      const segmentId = `seg_${Date.now()}`;
      const payload = JSON.stringify({
        input: text.trim().slice(0, 5000),
        voice,
        temperature,
        segment_id: segmentId,
      });
      try {
        websocket.send(payload);
      } catch (e) {
        fail(new Error(`Failed to send TTS request: ${e.message}`));
      }
    };

    websocket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        // JSON control message
        try {
          const message = JSON.parse(event.data);
          handleControlMessage(message);
        } catch (e) {
          // Ignore unparseable strings
        }
      } else if (event.data instanceof ArrayBuffer) {
        handleAudioChunk(event.data);
      } else if (event.data instanceof Blob) {
        event.data.arrayBuffer().then((buffer) => handleAudioChunk(buffer));
      }
    };

    websocket.onerror = () => {
      if (!isReceivingAudio) {
        clearTimeout(connectionTimeout);
        fail(new Error('TTS WebSocket connection error'));
      }
    };

    websocket.onclose = (event) => {
      clearTimeout(connectionTimeout);
      if (!isReceivingAudio && !resolved) {
        if (event.code !== 1000) {
          fail(new Error(`TTS connection closed unexpectedly: ${event.reason || event.code}`));
        } else {
          finish();
        }
      }
    };

    function handleControlMessage(message) {
      switch (message.type) {
        case 'ping':
          try { websocket.send(JSON.stringify({ type: 'pong' })); } catch (_) { /* ignore */ }
          break;
        case 'start':
          isReceivingAudio = true;
          leftoverBytes = new Uint8Array(0);
          nextStartTime = audioContext.currentTime + 0.03; // 30ms jitter buffer
          if (onStart) onStart();
          break;
        case 'end':
          // Schedule finish after remaining audio plays out
          isReceivingAudio = false;
          const remainingMs = Math.max(0, (nextStartTime - audioContext.currentTime) * 1000) + 50;
          setTimeout(finish, remainingMs);
          break;
        case 'error':
          isReceivingAudio = false;
          fail(new Error(message.message || 'TTS server error'));
          break;
        default:
          break;
      }
    }

    function handleAudioChunk(data) {
      if (!isReceivingAudio || !audioContext) return;

      const incoming = new Uint8Array(data);
      // Combine leftover from previous chunk to maintain 16-bit alignment
      const combined = new Uint8Array(leftoverBytes.length + incoming.length);
      combined.set(leftoverBytes, 0);
      combined.set(incoming, leftoverBytes.length);

      const validLength = combined.length - (combined.length % 2);
      leftoverBytes = combined.slice(validLength);

      if (validLength === 0) return;

      const int16Array = new Int16Array(combined.buffer, combined.byteOffset, validLength / 2);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      // Micro-fade (2ms) at chunk boundaries to eliminate pops
      const fadeSamples = Math.min(Math.floor(SAMPLE_RATE * 0.002), Math.floor(float32Array.length / 2));
      for (let i = 0; i < fadeSamples; i++) {
        float32Array[i] *= i / fadeSamples;
        float32Array[float32Array.length - 1 - i] *= (fadeSamples - i) / fadeSamples;
      }

      schedulePlayback(float32Array);
    }

    function schedulePlayback(float32Array) {
      if (!audioContext || audioContext.state === 'closed') return;

      const buffer = audioContext.createBuffer(1, float32Array.length, SAMPLE_RATE);
      buffer.getChannelData(0).set(float32Array);

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);

      const currentTime = audioContext.currentTime;
      if (nextStartTime < currentTime) {
        nextStartTime = currentTime + 0.03;
      }

      source.start(nextStartTime);
      nextStartTime += buffer.duration;
    }
  });

  return { abort: () => abortFn(), promise };
};

/**
 * Synthesize text and return a Blob URL (non-streaming, for fallback).
 * Uses the HTTP endpoint via the agent proxy.
 */
export const synthesizeToFile = async (text, language = 'en', agentUrl) => {
  const API_BASE = agentUrl || process.env.REACT_APP_AGENT_URL || 'https://wakilibot-agent-0wm0.onrender.com';
  const voice = resolveVoice(language);
  const formData = new FormData();
  formData.append('text', text.slice(0, 5000));
  formData.append('language', language);
  formData.append('voice', voice);

  const response = await fetch(`${API_BASE}/tts`, { method: 'POST', body: formData });
  if (!response.ok) {
    throw new Error(`TTS proxy failed: ${response.status}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

const sparkTTS = { speakStreaming, synthesizeToFile, resolveVoice };
export default sparkTTS;
