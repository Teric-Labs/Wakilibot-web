import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Box, InputBase, Typography, IconButton } from '@mui/material';
import { StopIcon, SendIcon, CloseIcon, EditTranscriptIcon, TrashIcon, PlayReplyIcon, PauseIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';
import api from '../services/api';
import { tokens, radii } from '../styles/theme';

const MAX_RECORDING_SECONDS = 60;
const WAVE_BAR_COUNT = 24;

const formatElapsed = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

/**
 * WhatsApp-style voice recorder using HTTP transcription (not WebSocket).
 *
 * Flow: tap mic → recording panel with waveform + timer → tap stop →
 * upload audio blob to agent's /transcribe endpoint → review with playback.
 *
 * No live captions: like WhatsApp, the transcript appears after recording stops.
 * Audio is captured via MediaRecorder and sent as a single webm blob over HTTP POST.
 */
const VoiceRecorder = forwardRef(({ onSendTranscript, onPhaseChange, activeIntent = null, disabled = false }, ref) => {
  const { getCurrentLanguage } = useLanguage();
  const [phase, setPhase] = useState('idle'); // idle | recording | review
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [notice, setNotice] = useState(null);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // Audio capture + playback
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Refs
  const timerRef = useRef(null);
  const barsRef = useRef([]);
  const meterFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);
  const transcriptionPromiseRef = useRef(null);
  const playbackAudioRef = useRef(null);
  const playbackRafRef = useRef(null);
  const elapsedRef = useRef(0);

  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);

  // ─── Teardown ─────────────────────────────────────────────────────────────────
  const stopPlayback = useCallback(() => {
    if (playbackRafRef.current) { cancelAnimationFrame(playbackRafRef.current); playbackRafRef.current = null; }
    if (playbackAudioRef.current) { playbackAudioRef.current.pause(); playbackAudioRef.current = null; }
    setIsPlayingBack(false);
    setPlaybackProgress(0);
  }, []);

  const teardown = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (meterFrameRef.current) { cancelAnimationFrame(meterFrameRef.current); meterFrameRef.current = null; }
    if (sourceRef.current) { try { sourceRef.current.disconnect(); } catch (_) { /* noop */ } sourceRef.current = null; }
    if (analyserRef.current) { try { analyserRef.current.disconnect(); } catch (_) { /* noop */ } analyserRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) { /* noop */ }
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => () => { teardown(); stopPlayback(); }, [teardown, stopPlayback]);

  // ─── Waveform visualizer (uses same stream as MediaRecorder) ─────────────────
  const runVisualizer = useCallback((stream) => {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    try {
      const ctx = new AudioCtor();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const step = Math.floor(buf.length / WAVE_BAR_COUNT);
        let maxVal = 0;
        barsRef.current.forEach((bar, i) => {
          if (!bar) return;
          const value = buf[i * step] || 0;
          if (value > maxVal) maxVal = value;
          const scale = Math.max(0.08, Math.min(1, value / 160));
          bar.style.transform = `scaleY(${scale.toFixed(3)})`;
          bar.style.opacity = value > 25 ? '1' : '0.35';
        });
        // Update speechDetected based on overall level
        setSpeechDetected(maxVal > 40);
        meterFrameRef.current = requestAnimationFrame(tick);
      };
      meterFrameRef.current = requestAnimationFrame(tick);
    } catch (_) { /* cosmetic */ }
  }, []);

  // ─── Start recording ─────────────────────────────────────────────────────────
  const beginRecording = useCallback(async () => {
    if (disabled) return;
    setNotice(null);
    setTranscript('');
    setElapsed(0);
    setSpeechDetected(false);
    setAudioUrl(null);
    setAudioDuration(0);
    audioChunksRef.current = [];
    audioBlobRef.current = null;
    stopPlayback();
    setPhase('recording');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      // Start MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
            ? 'audio/ogg;codecs=opus'
            : '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioDuration(elapsedRef.current);
        // Kick off transcription in the background — do not block the review UI on it
        if (blob.size > 0) {
          runTranscriptionRef.current?.(blob);
        }
      };
      mr.start(250);
      mediaRecorderRef.current = mr;

      // Start timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            setTimeout(() => finishRecordingRef.current?.(), 0);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);

      // Start waveform visualizer
      runVisualizer(stream);
    } catch (err) {
      teardown();
      setPhase('idle');
      setNotice('Microphone access denied. Allow it in browser settings or type your message.');
    }
  }, [disabled, teardown, runVisualizer, stopPlayback]);

  useImperativeHandle(ref, () => ({ startRecording: beginRecording }), [beginRecording]);

  // ─── Transcribe via HTTP (runs in background, does not block the UI) ─────────
  const runTranscriptionRef = useRef(null);
  const runTranscription = (blob) => {
    if (!blob || blob.size === 0) {
      setTranscript('');
      return null;
    }
    setTranscriptLoading(true);
    const language = getCurrentLanguage?.() || 'en';
    const promise = api
      .transcribeAudio(blob, language)
      .then((text) => {
        const trimmed = (text || '').trim();
        if (trimmed) setTranscript(trimmed);
        setTranscriptLoading(false);
        return trimmed;
      })
      .catch((err) => {
        setTranscriptLoading(false);
        setNotice(err?.message || 'Transcription failed — send as audio only.');
        return '';
      });
    transcriptionPromiseRef.current = promise;
    return promise;
  };
  runTranscriptionRef.current = runTranscription;

  // ─── Stop recording → show review immediately ────────────────────────────
  const finishRecordingRef = useRef(null);
  const finishRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (meterFrameRef.current) { cancelAnimationFrame(meterFrameRef.current); meterFrameRef.current = null; }
    barsRef.current.forEach((bar) => { if (bar) { bar.style.transform = 'scaleY(0.08)'; bar.style.opacity = '0.3'; } });

    // Stop MediaRecorder → triggers onstop → builds blob + kicks off async transcription
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    // Release microphone
    if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }

    if (elapsedRef.current < 1) {
      setPhase('idle');
      setNotice('Too short. Hold the mic and speak for at least a second.');
    } else {
      // WhatsApp-style: review appears immediately, transcript fills in when ready
      setPhase('review');
    }
  };
  finishRecordingRef.current = finishRecording;

  // ─── Discard ──────────────────────────────────────────────────────────────────
  const discard = () => {
    teardown();
    stopPlayback();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    transcriptionPromiseRef.current = null;
    setPhase('idle');
    setTranscript('');
    setNotice(null);
    setSpeechDetected(false);
    setElapsed(0);
    setAudioUrl(null);
    setAudioDuration(0);
    setTranscriptLoading(false);
    audioBlobRef.current = null;
  };

  // ─── Send ─────────────────────────────────────────────────────────────────────
  const send = () => {
    const text = transcript.trim();
    // Pass the transcript promise up: ChatInterface will add the audio bubble right
    // away and await the transcript in the background before sending to the agent.
    const pendingPromise = text ? Promise.resolve(text) : transcriptionPromiseRef.current;

    stopPlayback();
    teardown();
    setPhase('idle');
    setTranscript('');
    setElapsed(0);
    const url = audioUrl;
    const dur = audioDuration;
    setAudioUrl(null);
    setAudioDuration(0);
    setTranscriptLoading(false);
    transcriptionPromiseRef.current = null;

    onSendTranscript?.(text, activeIntent, {
      audioUrl: url,
      audioDuration: dur,
      transcriptPromise: pendingPromise,
    });
  };

  // ─── Toggle playback in review ────────────────────────────────────────────────
  const togglePlayback = () => {
    if (!audioUrl) return;
    if (isPlayingBack) { stopPlayback(); return; }

    const audio = new Audio(audioUrl);
    playbackAudioRef.current = audio;
    audio.onended = () => { setIsPlayingBack(false); setPlaybackProgress(0); playbackAudioRef.current = null; };
    audio.onerror = () => { setIsPlayingBack(false); setPlaybackProgress(0); };
    audio.onplay = () => {
      setIsPlayingBack(true);
      const track = () => {
        if (!playbackAudioRef.current) return;
        const { currentTime, duration } = playbackAudioRef.current;
        if (duration && isFinite(duration)) setPlaybackProgress(currentTime / duration);
        if (!audio.paused) playbackRafRef.current = requestAnimationFrame(track);
      };
      playbackRafRef.current = requestAnimationFrame(track);
    };
    audio.play().catch(() => setIsPlayingBack(false));
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  // ─── IDLE ─────────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return notice ? (
      <Box sx={{ py: 0.75, px: 1.5 }}>
        <Typography sx={{ fontSize: '0.78rem', color: tokens.danger, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CloseIcon size={14} style={{ opacity: 0.7 }} />
          {notice}
        </Typography>
      </Box>
    ) : null;
  }

  // ─── TRANSCRIBING (loading state after stop) ──────────────────────────────────
  if (phase === 'transcribing') {
    // Legacy: never reached — review is shown immediately after stop.
    return null;
  }


  // ─── REVIEW: audio playback + edit transcript then send ──────────────────────
  if (phase === 'review') {
    return (
      <Box
        sx={{
          width: '100%',
          p: 2,
          borderRadius: radii.card,
          border: `1px solid ${tokens.line}`,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(11,31,58,0.08)',
          animation: 'vrSlideUp 0.22s cubic-bezier(0.4,0,0.2,1)',
          '@keyframes vrSlideUp': {
            '0%': { opacity: 0, transform: 'translateY(12px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* Audio playback bar */}
        {audioUrl && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75, px: 0.5 }}>
            <Box
              onClick={togglePlayback}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlayback(); } }}
              aria-label={isPlayingBack ? 'Pause playback' : 'Play recording'}
              sx={{
                width: 40, height: 40, borderRadius: radii.circle, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: tokens.navy, color: '#FFFFFF', cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(11,31,58,0.25)',
                transition: 'all .12s ease',
                '&:hover': { transform: 'scale(1.06)', boxShadow: '0 4px 14px rgba(11,31,58,0.3)' },
                '&:active': { transform: 'scale(0.94)' },
              }}
            >
              {isPlayingBack
                ? <PauseIcon size={16} style={{ color: '#FFFFFF' }} />
                : <PlayReplyIcon size={16} style={{ color: '#FFFFFF', marginLeft: 2 }} />
              }
            </Box>

            <Box sx={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(11,31,58,0.08)', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${(playbackProgress * 100).toFixed(1)}%`, backgroundColor: tokens.gold, borderRadius: 3, transition: isPlayingBack ? 'none' : 'width .1s' }} />
            </Box>

            <Typography sx={{ fontSize: '0.75rem', color: tokens.muted, fontWeight: 600, minWidth: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {formatElapsed(audioDuration)}
            </Typography>
          </Box>
        )}

        {/* Transcript section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <EditTranscriptIcon size={16} style={{ color: tokens.gold }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: tokens.muted }}>
            What we heard
          </Typography>
          {transcriptLoading && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, ml: 0.5 }}>
              <Box
                sx={{
                  width: 4, height: 4, borderRadius: radii.circle, backgroundColor: tokens.gold,
                  animation: 'vrDots 1.2s ease-in-out infinite',
                  '@keyframes vrDots': {
                    '0%, 60%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                    '30%': { opacity: 1, transform: 'scale(1)' },
                  },
                }}
              />
              <Typography sx={{ fontSize: '0.68rem', color: tokens.muted, fontWeight: 500 }}>
                listening to it back
              </Typography>
            </Box>
          )}
        </Box>

        <InputBase
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          multiline
          maxRows={5}
          autoFocus
          fullWidth
          placeholder={transcriptLoading ? 'Reading your recording…' : 'Edit before sending…'}
          sx={{
            fontSize: '0.95rem',
            color: tokens.ink,
            lineHeight: 1.6,
            px: 1.5,
            py: 1.25,
            borderRadius: radii.card,
            border: `1px solid ${tokens.line}`,
            backgroundColor: tokens.paper,
            width: '100%',
            opacity: transcriptLoading ? 0.7 : 1,
            transition: 'opacity .2s ease',
            '&:focus-within': { borderColor: tokens.gold, boxShadow: '0 0 0 2px rgba(184,134,11,0.12)' },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          {/* Discard */}
          <Box
            onClick={discard}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') discard(); }}
            aria-label="Discard recording"
            sx={{
              width: 40, height: 40, borderRadius: radii.circle,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(155,44,44,0.2)', cursor: 'pointer',
              transition: 'all .12s ease',
              '&:hover': { backgroundColor: 'rgba(155,44,44,0.06)', borderColor: tokens.danger },
            }}
          >
            <TrashIcon size={18} style={{ color: tokens.danger }} />
          </Box>

          {/* Duration */}
          <Typography sx={{ fontSize: '0.72rem', color: tokens.muted, fontWeight: 500 }}>
            {formatElapsed(audioDuration || elapsed)}
          </Typography>

          {/* Send — always enabled (WhatsApp style). Awaits transcript silently. */}
          <Box
            onClick={send}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            aria-label="Send voice message"
            sx={{
              width: 44, height: 44, borderRadius: radii.circle, ml: 'auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: tokens.navy,
              cursor: 'pointer',
              transition: 'all .15s ease',
              boxShadow: '0 4px 14px rgba(11,31,58,0.28)',
              '&:hover': { transform: 'scale(1.06)' },
            }}
          >
            <SendIcon size={20} style={{ color: '#FFFFFF' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── RECORDING: compact inline composer bar, WhatsApp style ──────────────────
  // Replaces the text field in-place: trash · pulsing timer · live waveform · stop,
  // all on one slim pill that matches the composer's shape and padding.
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: '8px 8px 8px 10px',
        minHeight: 56,
        boxSizing: 'border-box',
        borderRadius: radii.card,
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(184,134,11,0.38)',
        boxShadow: '0 1px 2px rgba(11,31,58,0.04), 0 12px 32px -18px rgba(11,31,58,0.35)',
        animation: 'vrBarIn 0.16s cubic-bezier(0.4,0,0.2,1)',
        '@keyframes vrBarIn': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Cancel */}
      <IconButton
        onClick={discard}
        size="small"
        aria-label="Cancel recording"
        sx={{
          color: tokens.muted, width: 38, height: 38, flexShrink: 0,
          border: '1px solid rgba(11,31,58,0.12)',
          '&:hover': { color: tokens.danger, borderColor: tokens.danger, backgroundColor: 'rgba(155,44,44,0.06)' },
        }}
      >
        <TrashIcon size={18} />
      </IconButton>

      {/* Recording dot + timer */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexShrink: 0, pl: 0.5 }}>
        <Box
          sx={{
            width: 9, height: 9, borderRadius: radii.circle, backgroundColor: '#EF4444',
            animation: 'vrRecPulse 1.4s ease-in-out infinite',
            '@keyframes vrRecPulse': {
              '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)', transform: 'scale(1)' },
              '50%': { boxShadow: '0 0 0 6px rgba(239,68,68,0)', transform: 'scale(0.85)' },
            },
          }}
        />
        <Typography
          sx={{
            fontSize: '0.95rem', fontWeight: 700, color: tokens.navy,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '0.01em', lineHeight: 1,
          }}
        >
          {formatElapsed(elapsed)}
        </Typography>
      </Box>

      {/* Live waveform filling the text-field area */}
      <Box
        ref={(node) => {
          if (node) {
            barsRef.current = Array.from(node.querySelectorAll('[data-wave-bar]'));
          }
        }}
        sx={{ flex: 1, minWidth: 0, height: 30, display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden', px: 1 }}
        aria-hidden="true"
      >
        {Array.from({ length: WAVE_BAR_COUNT }).map((_, i) => (
          <Box
            key={i}
            data-wave-bar=""
            sx={{
              flex: '1 1 0',
              minWidth: 2,
              maxWidth: 5,
              height: '100%',
              borderRadius: '2px',
              backgroundColor: speechDetected ? tokens.gold : 'rgba(11,31,58,0.16)',
              transform: 'scaleY(0.12)',
              opacity: 0.4,
              transition: 'transform 55ms linear, background-color 280ms ease, opacity 80ms',
            }}
          />
        ))}
      </Box>

      {/* Stop → enters review */}
      <Box
        onClick={finishRecording}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finishRecording(); } }}
        aria-label="Stop recording"
        sx={{
          width: 40, height: 40, borderRadius: radii.circle, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(145deg, #EF4444 0%, #DC2626 100%)',
          color: '#FFFFFF', cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(239,68,68,0.32)',
          transition: 'all .15s cubic-bezier(.4,0,.2,1)',
          '&:hover': { transform: 'scale(1.07)', boxShadow: '0 5px 16px rgba(239,68,68,0.4)' },
          '&:active': { transform: 'scale(0.93)' },
        }}
      >
        <StopIcon size={18} style={{ color: '#FFFFFF' }} />
      </Box>
    </Box>
  );
});

VoiceRecorder.displayName = 'VoiceRecorder';

export default VoiceRecorder;
