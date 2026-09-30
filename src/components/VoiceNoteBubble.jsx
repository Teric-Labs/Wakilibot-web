import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PlayReplyIcon, PauseIcon } from './icons';
import { tokens, radii } from '../styles/theme';

const BAR_COUNT = 32;

/**
 * Deterministic pseudo-random bar heights from a seed string.
 * Produces a visual "waveform" that looks the same for the same URL every render.
 */
const generateBarPattern = (seed, count) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const bars = [];
  for (let i = 0; i < count; i++) {
    // Mix position and hash for variety
    const v = Math.abs(Math.sin(hash * 0.001 + i * 1.7) * 0.5 + Math.cos(i * 0.9 + hash * 0.01) * 0.5);
    bars.push(0.2 + v * 0.8); // 0.2 to 1.0 range
  }
  return bars;
};

/**
 * WhatsApp-style voice note bubble.
 *
 * Playable audio with waveform progress, duration, and optional transcript below.
 * Supports autoplay for incoming bot voice replies.
 */
const VoiceNoteBubble = ({ audioUrl, duration = 0, isUser = false, autoplay = false, transcript = null, onAutoPlayEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [ready, setReady] = useState(false);

  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const autoplayFiredRef = useRef(false);

  const formatTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return undefined;

    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setReady(true);
      // Use actual duration if our stored one is 0 or imprecise
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration((prev) => prev || audio.duration);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      onAutoPlayEnd?.();
    };

    audio.onerror = () => {
      setReady(false);
      setIsPlaying(false);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [audioUrl, onAutoPlayEnd]);

  // Autoplay on mount (for bot replies to voice queries)
  useEffect(() => {
    if (!autoplay || !ready || autoplayFiredRef.current || !audioRef.current) return;
    autoplayFiredRef.current = true;
    startPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, ready]);

  const trackProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    const dur = audio.duration && isFinite(audio.duration) ? audio.duration : totalDuration;
    if (dur > 0) {
      setProgress(audio.currentTime / dur);
      setCurrentTime(audio.currentTime);
    }
    rafRef.current = requestAnimationFrame(trackProgress);
  }, [totalDuration]);

  const startPlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(trackProgress);
    }).catch(() => {
      setIsPlaying(false);
    });
  };

  const stopPlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Seek on bar click
  const handleBarClick = (e) => {
    if (!audioRef.current || !ready) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const dur = audioRef.current.duration && isFinite(audioRef.current.duration)
      ? audioRef.current.duration
      : totalDuration;
    audioRef.current.currentTime = ratio * dur;
    setProgress(ratio);
    setCurrentTime(ratio * dur);
  };

  // Generate stable waveform pattern
  const bars = audioUrl ? generateBarPattern(audioUrl, BAR_COUNT) : new Array(BAR_COUNT).fill(0.3);

  const remainingTime = totalDuration - currentTime;
  const displayTime = isPlaying ? formatTime(remainingTime) : formatTime(totalDuration);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Audio bubble */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.5,
          py: 1,
          borderRadius: '18px',
          backgroundColor: isUser ? '#F4F4F5' : 'rgba(11,31,58,0.04)',
          border: isUser ? 'none' : `1px solid ${tokens.line}`,
          minWidth: 220,
          maxWidth: 340,
        }}
      >
        {/* Play/Pause button */}
        <Box
          onClick={togglePlay}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlay(); } }}
          aria-label={isPlaying ? 'Pause' : 'Play voice message'}
          sx={{
            width: 36, height: 36, borderRadius: radii.circle, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: isUser ? tokens.navy : tokens.navyMid,
            color: '#FFFFFF', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(11,31,58,0.2)',
            transition: 'all .12s ease',
            '&:hover': { transform: 'scale(1.06)', boxShadow: '0 3px 12px rgba(11,31,58,0.28)' },
            '&:active': { transform: 'scale(0.94)' },
          }}
        >
          {isPlaying
            ? <PauseIcon size={14} style={{ color: '#FFFFFF' }} />
            : <PlayReplyIcon size={14} style={{ color: '#FFFFFF', marginLeft: 2 }} />
          }
        </Box>

        {/* Waveform bars with progress */}
        <Box
          onClick={handleBarClick}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5px',
            height: 28,
            cursor: ready ? 'pointer' : 'default',
            position: 'relative',
          }}
          aria-label="Seek"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          {bars.map((height, i) => {
            const barRatio = i / BAR_COUNT;
            const played = barRatio <= progress;
            return (
              <Box
                key={i}
                sx={{
                  width: 3,
                  height: `${(height * 100).toFixed(0)}%`,
                  borderRadius: '1.5px',
                  backgroundColor: played
                    ? (isUser ? tokens.navy : tokens.gold)
                    : (isUser ? 'rgba(11,31,58,0.15)' : 'rgba(11,31,58,0.1)'),
                  transition: isPlaying ? 'none' : 'background-color .1s',
                  flexShrink: 0,
                }}
              />
            );
          })}
        </Box>

        {/* Duration */}
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: tokens.muted,
            minWidth: 32,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          {displayTime}
        </Typography>
      </Box>

      {/* Transcript text below the bubble (for user voice messages) */}
      {transcript && (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: '0.8rem',
            color: tokens.muted,
            fontStyle: 'italic',
            lineHeight: 1.5,
            px: 0.5,
            maxHeight: 48,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transcript}
        </Typography>
      )}

      {/* Not ready indicator */}
      {!ready && audioUrl && (
        <Typography sx={{ mt: 0.5, fontSize: '0.7rem', color: tokens.muted, fontStyle: 'italic' }}>
          Preparing audio...
        </Typography>
      )}
    </Box>
  );
};

export default VoiceNoteBubble;
