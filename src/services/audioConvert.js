/**
 * Audio format conversion for the STT pipeline.
 *
 * The Ateker STT server (whisper.cpp based) only decodes WAV/MP3/FLAC/M4A — it
 * rejects the WebM/Opus blob that the browser's MediaRecorder produces with
 * "Audio decode failed: failed to create decoder for audio track".
 *
 * Browsers can, however, decode their own WebM/Opus recordings (that's how local
 * playback works), so we decode the blob with the Web Audio API, resample to
 * 16 kHz mono, and re-encode as a 16-bit PCM WAV before upload.
 */

const TARGET_SAMPLE_RATE = 16000;

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i += 1) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Encode a rendered AudioBuffer as a 16-bit PCM WAV Blob.
 * Expects a mono buffer (already downmixed during resampling).
 */
function encodeWav(audioBuffer) {
  const samples = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const dataLength = samples.length * 2; // 16-bit = 2 bytes per sample
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format: PCM
  view.setUint16(22, 1, true); // channels: mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Convert any browser-recorded audio blob (WebM/Opus, Ogg, etc.) to a mono
 * 16 kHz WAV blob the STT server can decode. Returns the original blob
 * unchanged if it's already WAV or if conversion fails for any reason.
 */
export async function toSttReadyWav(blob) {
  if (!blob || blob.size === 0) return blob;

  const type = (blob.type || '').toLowerCase();
  if (type.startsWith('audio/wav') || type.startsWith('audio/x-wav') || type.endsWith('.wav')) {
    return blob;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return blob;

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const decodeCtx = new AudioContextCtor();
    const decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
    if (decodeCtx.close) await decodeCtx.close();

    // Resample + downmix to mono at the target rate via an offline render graph.
    const frameCount = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE));
    const OfflineCtor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offline = new OfflineCtor(1, frameCount, TARGET_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start(0);
    const rendered = await offline.startRendering();

    return encodeWav(rendered);
  } catch {
    // Decoding failed (rare codec / empty track): fall back to the original blob
    // so the caller still attempts the upload rather than losing the recording.
    return blob;
  }
}
