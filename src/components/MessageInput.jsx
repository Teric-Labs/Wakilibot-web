import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { MicIcon, SendIcon, VoiceModeIcon } from './icons';
import VoiceRecorder from './VoiceRecorder';
import api from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { tokens, radii } from '../styles/theme';

/**
 * The composer: a text field, a microphone, and a send control.
 *
 * While a recording is in progress the voice panel takes the whole slot — a half-used
 * text box next to a live transcript only confuses which one is being sent.
 *
 * The VoiceRecorder is rendered ONCE and stays mounted regardless of phase, preventing
 * the remount bug that wiped recording state when the user tapped the mic.
 */
const MessageInput = ({
  onMessageReceived,
  onStreamingMessage,
  conversationId,
  onConversationIdChange,
  activeIntent = null,
  activeTopicLabel = null,
  onSendTranscript,
  onStartVoiceMode,
  isLoading,
  setIsLoading,
  isStreaming,
  setIsStreaming,
  isWaitingForResponse,
  setIsWaitingForResponse
}) => {
  const { selectedLanguage, isInitialized } = useLanguage();
  const [message, setMessage] = useState('');
  const [voicePhase, setVoicePhase] = useState('idle');
  const inputRef = useRef(null);
  const recorderRef = useRef(null);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && voicePhase === 'idle') {
      inputRef.current.focus();
    }
  }, [voicePhase]);

  const busy = isLoading || isStreaming;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (message.trim() === '' || busy) return;

    // Wait for language context to be initialized
    if (!isInitialized) {
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);
    setIsStreaming(true);
    setIsWaitingForResponse(true);

    // Add user message to chat
    onMessageReceived({
      text: userMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    });

    try {
      // Try streaming API first, fallback to regular API if it fails
      let response;
      let streamingSucceeded = false;

      try {
        response = await api.sendMessageStream(userMessage, conversationId, selectedLanguage, (chunk, isComplete, data) => {
          if (onStreamingMessage) {
            onStreamingMessage(chunk, isComplete, data);
          }
        }, activeIntent);
        streamingSucceeded = true;
      } catch (streamingError) {
        response = await api.sendMessage(userMessage, conversationId, selectedLanguage, null, activeIntent);
        streamingSucceeded = false;
      }

      // Only add final response if streaming failed (to avoid duplicates)
      if (!streamingSucceeded && response && response.answer) {
        // Streaming path updates React via onStreamingMessage; non-stream must
        // mirror conversation_id into parent state so the next turn keeps the thread.
        if (response.conversation_id) {
          onConversationIdChange?.(response.conversation_id);
        }
        onMessageReceived({
          text: response.answer,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          // Enhanced response data
          responseData: {
            intent: response.intent,
            taskStatus: response.task_status,
            responseTime: response.response_time,
            isCached: api.utils.isResponseCached(response),
            complaintId: response.complaint_id,
            agent: response.agent,
            version: response.performance?.version,
            conversationId: response.conversation_id
          }
        });
      } else if (!streamingSucceeded && (!response || !response.answer)) {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      onMessageReceived({
        text: "I apologize, but I'm experiencing technical difficulties. Please try again or contact CTDRU directly at +256 760 345 027 or +256 784 101 593 for immediate assistance.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setIsWaitingForResponse(false);
    }
  };

  const handleVoiceSend = useCallback(
    (text, intent, audioMeta) => {
      // Always forward — even when text is empty the audioMeta contains the
      // audioUrl and a transcriptPromise that ChatInterface will await.
      // The old `if (!text) return` guard was the root cause of the
      // "audio disappears on Send" bug: it dropped the entire call before
      // the transcript could resolve, so neither the bubble nor the agent
      // query ever went through.
      onSendTranscript?.(text, intent, audioMeta);
    },
    [onSendTranscript]
  );

  const handleMicClick = useCallback(() => {
    recorderRef.current?.startRecording();
  }, []);

  const canSend = message.trim() !== '' && !busy;

  const placeholder = activeTopicLabel
    ? `Message about ${activeTopicLabel}…`
    : 'Ask Wakili…';

  return (
    <Box sx={{ position: 'relative' }}>
      {/* VoiceRecorder stays mounted at a stable tree position — never unmounts */}
      <VoiceRecorder
        ref={recorderRef}
        onSendTranscript={handleVoiceSend}
        onPhaseChange={setVoicePhase}
        activeIntent={activeIntent}
        disabled={busy}
      />

      {/* Normal text form — hidden while voice recording or review is active */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          p: '8px 8px 8px 10px',
          display: voicePhase === 'idle' ? 'flex' : 'none',
          alignItems: 'flex-end',
          gap: 1,
          borderRadius: radii.card,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(11,31,58,0.14)',
          boxShadow: '0 1px 2px rgba(11,31,58,0.04), 0 12px 32px -18px rgba(11,31,58,0.35)',
          transition: 'border-color .18s ease, box-shadow .18s ease',
          '&:focus-within': {
            borderColor: tokens.navyMid,
            boxShadow: '0 1px 2px rgba(11,31,58,0.04), 0 0 0 3px rgba(184,134,11,0.14)',
          },
        }}
      >
        {/* Mic button — triggers VoiceRecorder to enter recording phase */}
        <IconButton
          onClick={handleMicClick}
          aria-label="Record a voice message"
          disabled={busy}
          sx={{
            width: 38,
            height: 38,
            borderRadius: radii.circle,
            color: busy ? 'rgba(11,31,58,0.2)' : tokens.navy,
            border: '1px solid rgba(11,31,58,0.12)',
            transition: 'all .15s ease',
            '&:hover': {
              borderColor: tokens.gold,
              backgroundColor: 'rgba(184,134,11,0.06)',
              color: tokens.gold,
            },
            '&:disabled': {
              color: 'rgba(11,31,58,0.2)',
              border: '1px solid rgba(11,31,58,0.06)',
            },
          }}
        >
          <MicIcon size={19} />
        </IconButton>

        <InputBase
          sx={{
            ml: 0.5,
            flex: 1,
            fontSize: '0.95rem',
            fontWeight: 400,
            color: tokens.ink,
            py: 0.75,
            '& textarea::placeholder, & input::placeholder': {
              opacity: 0.6,
              color: tokens.muted,
            },
          }}
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={busy}
          inputRef={inputRef}
          multiline
          maxRows={5}
          inputProps={{ 'aria-label': 'Message to Wakilibot' }}
        />

        <IconButton
          type="submit"
          aria-label="Send message"
          disabled={!canSend}
          sx={{
            width: 38,
            height: 38,
            backgroundColor: canSend ? tokens.navy : 'rgba(11,31,58,0.07)',
            color: canSend ? '#FFFFFF' : 'rgba(11,31,58,0.32)',
            borderRadius: radii.circle,
            transition: 'background-color .18s ease, transform .18s ease',
            '&:hover': {
              backgroundColor: canSend ? tokens.navyMid : 'rgba(11,31,58,0.1)',
              transform: canSend ? 'translateY(-1px)' : 'none',
            },
            '&:disabled': {
              backgroundColor: 'rgba(11,31,58,0.07)',
              color: 'rgba(11,31,58,0.32)',
            },
          }}
        >
          {busy ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </IconButton>

        {/* Hands-free continuous voice conversation (listens, replies, re-listens on
            its own) — distinct from the mic button, which records one message at a time. */}
        <IconButton
          onClick={onStartVoiceMode}
          aria-label="Start voice conversation"
          disabled={busy}
          sx={{
            width: 38,
            height: 38,
            borderRadius: radii.circle,
            color: busy ? 'rgba(11,31,58,0.2)' : tokens.gold,
            border: '1px solid rgba(184,134,11,0.3)',
            transition: 'all .15s ease',
            '&:hover': {
              borderColor: tokens.gold,
              backgroundColor: 'rgba(184,134,11,0.08)',
            },
            '&:disabled': {
              color: 'rgba(11,31,58,0.2)',
              border: '1px solid rgba(11,31,58,0.06)',
            },
          }}
        >
          <VoiceModeIcon size={19} />
        </IconButton>
      </Paper>

      <Box
        sx={{
          mt: 1,
          display: voicePhase === 'idle' ? 'flex' : 'none',
          justifyContent: 'space-between',
          gap: 2,
          px: 0.5,
        }}
      >
        <Typography sx={{ color: tokens.muted, fontSize: '0.68rem' }}>
          Enter sends · Shift + Enter starts a new line
        </Typography>
        <Typography sx={{ color: tokens.muted, fontSize: '0.68rem', display: { xs: 'none', sm: 'block' } }}>
          Wakilibot can make mistakes. Check important information.
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageInput;
