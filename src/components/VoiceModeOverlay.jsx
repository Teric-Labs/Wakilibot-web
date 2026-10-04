import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { EndCallIcon, MicIcon } from './icons';
import api from '../services/api';
import { tokens, radii } from '../styles/theme';

const SILENCE_HOLD_MS = 1100; // how long the user has to go quiet before we treat the turn as done
const MIN_SPEECH_MS = 300; // ignore a stray cough/click as "the user spoke"
const MAX_RECORD_MS = 20000; // hard cap so a noisy room can't record forever
const SPEECH_LEVEL = 40; // same byte-frequency threshold VoiceRecorder.jsx uses
const WAITING_TIMEOUT_MS = 20000; // if the reply never arrives, don't strand the user in "Thinking..."

/**
 * Hands-free continuous voice conversation, like ChatGPT Voice / Gemini Live:
 * tap once, the mic listens, auto-detects when you stop talking, sends,
 * speaks the reply, then re-opens the mic on its own. Ends only when the
 * user taps End.
 *
 * Deliberately a separate implementation from VoiceRecorder.jsx (the
 * WhatsApp-style per-message recorder) rather than a shared refactor - that
 * component is a proven, carefully-tuned piece of the per-message flow, and
 * this one has a different state machine (no manual stop, no review/edit
 * step, loops on its own). Keeping them independent means a bug here can't
 * regress the existing recorder.
 *
 * Sending reuses the exact same pipeline as the manual voice flow
 * (`onSend` is ChatInterface's handleVoiceTranscript), so streaming,
 * server-side TTS, and the chat transcript all behave identically - this
 * overlay only owns the listen/silence-detect/loop state machine.
 */
const VoiceModeOverlay = ({
  onClose,
  onSend,
  language = 'en',
  isWaitingForResponse,
  isStreaming,
  latestMessage,
  resumeSignal,
}) => {
  // requesting | listening | processing | waiting | speaking | retry | denied
  const [phase, setPhase] = useState('requesting');
  const [level, setLevel] = useState(0); // 0..1 live mic amplitude, drives the orb
  const [caption, setCaption] = useState('');

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const meterFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const hasSpokenRef = useRef(false);
  const speechStartRef = useRef(0);
  const silenceStartRef = useRef(0);
  const maxTimerRef = useRef(null);
  const waitingTimerRef = useRef(null);
  const closedRef = useRef(false);
  const handledMessageIdRef = useRef(null);

  const teardownCapture = useCallback(() => {
    if (meterFrameRef.current) { cancelAnimationFrame(meterFrameRef.current); meterFrameRef.current = null; }
    if (maxTimerRef.current) { clearTimeout(maxTimerRef.current); maxTimerRef.current = null; }
    if (sourceRef.current) { try { sourceRef.current.disconnect(); } catch (_) { /* noop */ } sourceRef.current = null; }
    if (analyserRef.current) { try { analyserRef.current.disconnect(); } catch (_) { /* noop */ } analyserRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) { /* noop */ }
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  }, []);

  const clearWaitingTimeout = useCallback(() => {
    if (waitingTimerRef.current) { clearTimeout(waitingTimerRef.current); waitingTimerRef.current = null; }
  }, []);

  // ─── Start listening: mic capture + live amplitude + silence detection ──────
  const startListening = useCallback(async () => {
    if (closedRef.current) return;
    setCaption('');
    chunksRef.current = [];
    hasSpokenRef.current = false;
    speechStartRef.current = 0;
    silenceStartRef.current = 0;
    setPhase('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      if (closedRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      mediaRecorderRef.current = mr;

      const AudioCtor = window.AudioContext || window.webkitAudioContext;
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

      setPhase('listening');

      const tick = () => {
        analyser.getByteFrequencyData(buf);
        let maxVal = 0;
        for (let i = 0; i < buf.length; i += 1) if (buf[i] > maxVal) maxVal = buf[i];
        setLevel(Math.max(0.08, Math.min(1, maxVal / 160)));

        const now = Date.now();
        if (maxVal > SPEECH_LEVEL) {
          if (!hasSpokenRef.current) { hasSpokenRef.current = true; speechStartRef.current = now; }
          silenceStartRef.current = 0;
        } else if (hasSpokenRef.current) {
          if (!silenceStartRef.current) silenceStartRef.current = now;
          const spokeLongEnough = now - speechStartRef.current >= MIN_SPEECH_MS;
          if (spokeLongEnough && now - silenceStartRef.current >= SILENCE_HOLD_MS) {
            finishTurnRef.current?.();
            return;
          }
        }
        meterFrameRef.current = requestAnimationFrame(tick);
      };
      meterFrameRef.current = requestAnimationFrame(tick);

      maxTimerRef.current = setTimeout(() => finishTurnRef.current?.(), MAX_RECORD_MS);
    } catch (err) {
      teardownCapture();
      setPhase('denied');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teardownCapture]);

  // ─── Stop capture, transcribe, send (or go back to listening if silent) ─────
  const finishTurn = useCallback(async () => {
    if (closedRef.current) return;
    if (meterFrameRef.current) { cancelAnimationFrame(meterFrameRef.current); meterFrameRef.current = null; }
    if (maxTimerRef.current) { clearTimeout(maxTimerRef.current); maxTimerRef.current = null; }

    const spoke = hasSpokenRef.current;
    const mr = mediaRecorderRef.current;
    const mimeType = mr?.mimeType || 'audio/webm';

    await new Promise((resolve) => {
      if (mr && mr.state !== 'inactive') {
        mr.onstop = resolve;
        mr.stop();
      } else {
        resolve();
      }
    });
    teardownCapture();
    if (closedRef.current) return;

    if (!spoke) {
      // Nothing was said (silence/noise only) - just keep listening.
      startListening();
      return;
    }

    setPhase('processing');
    setCaption('Transcribing...');
    const blob = new Blob(chunksRef.current, { type: mimeType });
    let text = '';
    try {
      text = ((await api.transcribeAudio(blob, language)) || '').trim();
    } catch (_) {
      text = '';
    }

    if (!text) {
      setCaption("Didn't catch that - try again");
      setTimeout(() => { if (!closedRef.current) startListening(); }, 1200);
      return;
    }

    setCaption(text);
    const audioUrl = blob.size > 0 ? URL.createObjectURL(blob) : null;
    setPhase('waiting');
    clearWaitingTimeout();
    waitingTimerRef.current = setTimeout(() => {
      if (!closedRef.current) startListening();
    }, WAITING_TIMEOUT_MS);
    onSend?.(text, { audioUrl, audioDuration: Math.round((Date.now() - (speechStartRef.current || Date.now())) / 1000) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, onSend, startListening, teardownCapture, clearWaitingTimeout]);

  const finishTurnRef = useRef(null);
  finishTurnRef.current = finishTurn;

  // ─── Kick off on mount; tear everything down on unmount ─────────────────────
  useEffect(() => {
    closedRef.current = false;
    startListening();
    return () => {
      closedRef.current = true;
      clearWaitingTimeout();
      teardownCapture();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Reflect the agent's streaming reply while we wait ───────────────────────
  useEffect(() => {
    if (phase !== 'waiting') return;
    if (isWaitingForResponse || isStreaming) {
      setCaption(latestMessage && !latestMessage.isUser ? latestMessage.text || 'Thinking...' : 'Thinking...');
      return;
    }
    if (!latestMessage || latestMessage.isUser) return;

    if (latestMessage.ttsError) {
      // Can't speak it - show the text long enough to read, then resume.
      clearWaitingTimeout();
      setPhase('speaking');
      setCaption(latestMessage.text || '');
      const dwell = Math.min(5000, Math.max(1500, (latestMessage.text || '').length * 45));
      const timer = setTimeout(() => { if (!closedRef.current) startListening(); }, dwell);
      return () => clearTimeout(timer);
    }

    if (latestMessage.replyAudioUrl) {
      clearWaitingTimeout();
      setPhase('speaking');
      setCaption(latestMessage.text || '');
      handledMessageIdRef.current = latestMessage.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isWaitingForResponse, isStreaming, latestMessage]);

  // ─── The bot's voice note finished playing (signalled by ChatInterface) ─────
  useEffect(() => {
    if (resumeSignal === undefined) return;
    if (phase === 'speaking' || phase === 'waiting') {
      startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeSignal]);

  const handleEnd = () => {
    closedRef.current = true;
    clearWaitingTimeout();
    teardownCapture();
    onClose?.();
  };

  const statusText = {
    requesting: 'One moment...',
    listening: 'Listening...',
    processing: caption || 'Transcribing...',
    waiting: caption || 'Thinking...',
    speaking: 'Speaking...',
    denied: 'Microphone access denied',
  }[phase];

  const orbScale = phase === 'listening' ? 1 + level * 0.35 : phase === 'speaking' ? 1.08 : 1;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        backgroundColor: tokens.navy,
        backgroundImage: 'radial-gradient(60% 50% at 50% 38%, rgba(184,134,11,0.16) 0%, rgba(11,31,58,0) 70%)',
        animation: 'voiceModeFadeIn .18s ease',
        '@keyframes voiceModeFadeIn': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      }}
      role="dialog"
      aria-label="Voice conversation"
      aria-live="polite"
    >
      {phase === 'denied' ? (
        <Box sx={{ textAlign: 'center', px: 4, maxWidth: 380 }}>
          <Typography sx={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 600, mb: 1 }}>
            Microphone access denied
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Allow microphone access in your browser settings to use voice mode, or close this and type instead.
          </Typography>
        </Box>
      ) : (
        <>
          {/* The orb: scales/glows with live mic level while listening, pulses gently while speaking */}
          <Box
            sx={{
              width: 136,
              height: 136,
              borderRadius: radii.circle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: phase === 'speaking'
                ? `radial-gradient(circle at 35% 30%, ${tokens.goldSoft}, ${tokens.gold})`
                : `radial-gradient(circle at 35% 30%, ${tokens.navyMid}, ${tokens.navy})`,
              border: `2px solid rgba(184,134,11,${phase === 'listening' ? 0.5 + level * 0.5 : 0.4})`,
              boxShadow: `0 0 ${20 + level * 60}px rgba(184,134,11,${0.25 + level * 0.35})`,
              transform: `scale(${orbScale})`,
              transition: phase === 'listening' ? 'transform 70ms linear, box-shadow 70ms linear' : 'all .4s ease',
              animation: phase === 'speaking' ? 'voiceModeSpeakPulse 1.6s ease-in-out infinite' : 'none',
              '@keyframes voiceModeSpeakPulse': {
                '0%, 100%': { transform: 'scale(1.05)' },
                '50%': { transform: 'scale(1.14)' },
              },
            }}
          >
            <MicIcon size={34} style={{ color: '#FFFFFF', opacity: phase === 'denied' ? 0.3 : 0.9 }} />
          </Box>

          <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.01em' }}>
            {statusText}
          </Typography>

          {/* Live caption: what we heard / what the bot is saying */}
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              textAlign: 'center',
              maxWidth: 440,
              px: 3,
              minHeight: '1.6em',
            }}
          >
            {phase === 'listening' ? '' : caption}
          </Typography>
        </>
      )}

      <Box
        onClick={handleEnd}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEnd(); } }}
        aria-label="End voice conversation"
        sx={{
          mt: 2,
          width: 56,
          height: 56,
          borderRadius: radii.circle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tokens.danger,
          color: '#FFFFFF',
          cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(155,44,44,0.45)',
          transition: 'transform .15s ease',
          '&:hover': { transform: 'scale(1.06)' },
          '&:active': { transform: 'scale(0.94)' },
        }}
      >
        <EndCallIcon size={24} />
      </Box>
    </Box>
  );
};

export default VoiceModeOverlay;
