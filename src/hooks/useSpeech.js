import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { speakStreaming, resolveVoice } from '../services/sparkTTS';

// Only one reply may speak at a time; the abort handle lives at module scope so any
// component can stop the active stream, not just the one that started it.
let activeAbort = null;

/**
 * Speak an assistant reply aloud using the Spark TTS WebSocket stream.
 *
 * Connects directly to ws://tts.atekervoices.com (not subject to CORS), receives
 * PCM chunks in real time, and plays them through Web Audio API. When autoplay is
 * blocked by the browser, the hook reports `needsGesture` so the UI can ask the
 * user to tap the speaker icon once.
 */
export const useSpeech = () => {
  const [status, setStatus] = useState('idle'); // idle | loading | playing | error
  const [engine, setEngine] = useState(null);
  const [error, setError] = useState(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stop = useCallback(() => {
    if (activeAbort) {
      activeAbort();
      activeAbort = null;
    }
    setStatus((current) => (current === 'idle' ? current : 'idle'));
  }, []);

  const speak = useCallback(
    async ({ text, language = 'en', autoplay = false, voice: explicitVoice, gender }) => {
      const speechText = api.utils.cleanTextForTTS(text);
      if (!speechText) return;

      stop();
      setError(null);
      setNeedsGesture(false);
      setStatus('loading');

      const voice = explicitVoice || resolveVoice(language, gender);
      let started = false;

      const { abort, promise } = speakStreaming(speechText, {
        language,
        voice,
        gender,
        onStart: () => {
          started = true;
          if (!mountedRef.current) return;
          setEngine('spark-tts');
          setStatus('playing');
        },
        onEnd: () => {
          if (!mountedRef.current) return;
          activeAbort = null;
          setStatus('idle');
        },
        onError: (err) => {
          if (!mountedRef.current) return;
          activeAbort = null;
          if (autoplay && !started && (err?.name === 'NotAllowedError' || err?.message?.includes('Audio context'))) {
            // Browser blocks AudioContext until user interaction
            setStatus('idle');
            setNeedsGesture(true);
            return;
          }
          setStatus('error');
          setError(err?.message || 'Voice synthesis is unavailable right now.');
        },
      });

      activeAbort = abort;

      try {
        await promise;
      } catch (err) {
        if (!mountedRef.current) return;
        activeAbort = null;
        if (autoplay && !started) {
          setStatus('idle');
          setNeedsGesture(true);
          return;
        }
        setStatus('error');
        setError(err?.message || 'Speech synthesis failed.');
      }
    },
    [stop]
  );

  useEffect(() => {
    return () => {
      if (activeAbort) {
        activeAbort();
        activeAbort = null;
      }
    };
  }, []);

  return { status, engine, error, needsGesture, speak, stop };
};

export default useSpeech;
