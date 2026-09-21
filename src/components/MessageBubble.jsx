import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Avatar,
  Tooltip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import WakilibotLogo from './WakilibotLogo';
import api from '../services/api';
import { tokens } from '../styles/theme';

/** Quiet ChatGPT-style bubbles on a white chat canvas. */
const MessageBubble = ({
  message,
  isUser,
  responseData = null,
  isError = false,
  isStreaming = false,
  isWelcome = false,
}) => {
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsError, setTtsError] = useState(null);

  const handleGenerateTTS = async () => {
    if (!message || isUser || isGeneratingTTS) return;
    setIsGeneratingTTS(true);
    setTtsError(null);
    try {
      const ttsResponse = await api.generateTTS(message);
      if (ttsResponse?.source_lang_audio_file_path) {
        setAudioUrl(ttsResponse.source_lang_audio_file_path);
      } else {
        setTtsError('No audio available');
      }
    } catch (error) {
      setTtsError(error.message || 'Failed to generate audio');
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handlePlayAudio = () => {
    if (!audioUrl) {
      handleGenerateTTS();
      return;
    }
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }
    const audio = new Audio(audioUrl);
    audio.addEventListener('loadeddata', () => {
      audio.play().catch(() => {});
      setIsPlaying(true);
    });
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('pause', () => setIsPlaying(false));
    setAudioElement(audio);
  };

  const handleStopAudio = () => {
    if (audioElement && isPlaying) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        py: 1.5,
        '&:hover .msg-actions': { opacity: 1 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1.75,
          width: '100%',
          maxWidth: 768,
          alignItems: 'flex-start',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        <Avatar
          sx={{
            width: 28,
            height: 28,
            mt: 0.25,
            flexShrink: 0,
            bgcolor: isUser ? tokens.navyMid : tokens.navy,
            color: '#fff',
            fontSize: 14,
          }}
        >
          {isUser ? (
            <PersonIcon sx={{ fontSize: 16 }} />
          ) : (
            <WakilibotLogo size={16} showText={false} />
          )}
        </Avatar>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: isUser ? '85%' : '100%',
            ...(isUser
              ? {
                  backgroundColor: '#F4F4F5',
                  borderRadius: '18px',
                  px: 2,
                  py: 1.25,
                }
              : {}),
          }}
        >
          <Typography
            component="div"
            sx={{
              color: isError ? tokens.danger : tokens.ink,
              fontSize: '0.95rem',
              fontWeight: 400,
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message}
            {isStreaming && (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: 2,
                  height: '1em',
                  ml: 0.4,
                  verticalAlign: 'text-bottom',
                  backgroundColor: tokens.navy,
                  animation: 'cursorBlink 1s step-end infinite',
                  '@keyframes cursorBlink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0 },
                  },
                }}
              />
            )}
          </Typography>

          {responseData?.complaintId && !isWelcome && !isUser && (
            <Typography
              sx={{
                mt: 1.25,
                fontSize: '0.78rem',
                color: tokens.muted,
              }}
            >
              Reference: {responseData.complaintId}
            </Typography>
          )}

          {!isUser && !isWelcome && !isStreaming && (
            <Box
              className="msg-actions"
              sx={{
                mt: 0.5,
                opacity: 0,
                transition: 'opacity 0.15s ease',
              }}
            >
              <Tooltip
                title={
                  ttsError
                    ? `TTS error: ${ttsError}`
                    : isGeneratingTTS
                    ? 'Generating…'
                    : isPlaying
                    ? 'Stop'
                    : 'Read aloud'
                }
              >
                <IconButton
                  size="small"
                  onClick={isPlaying ? handleStopAudio : handlePlayAudio}
                  disabled={isGeneratingTTS}
                  aria-label="Read aloud"
                  sx={{
                    color: tokens.muted,
                    p: 0.5,
                    '&:hover': { color: tokens.navy, background: 'transparent' },
                  }}
                >
                  {isGeneratingTTS ? (
                    <CircularProgress size={14} sx={{ color: 'inherit' }} />
                  ) : isPlaying ? (
                    <VolumeOffIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <VolumeUpIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MessageBubble;
