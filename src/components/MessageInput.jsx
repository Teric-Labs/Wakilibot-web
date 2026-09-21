import React, { useState, useRef, useEffect } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Box, 
  CircularProgress,
  Fade,
  Typography,
  Button,
  Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import VoiceRecorder from './VoiceRecorder';
import api from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { tokens } from '../styles/theme';

const MessageInput = ({ 
  onMessageReceived, 
  onStreamingMessage, 
  conversationId, 
  onStartNewConversation,
  isLoading,
  setIsLoading,
  isStreaming,
  setIsStreaming,
  isWaitingForResponse,
  setIsWaitingForResponse
}) => {
  const { selectedLanguage, isInitialized, getCurrentLanguage } = useLanguage();
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  // Debug: Log language changes and verify consistency
  useEffect(() => {
    console.log('🌍 [MESSAGE INPUT] Language changed to:', selectedLanguage);
    console.log('🌍 [MESSAGE INPUT] Is initialized:', isInitialized);
    console.log('🌍 [MESSAGE INPUT] Context getCurrentLanguage():', getCurrentLanguage());
    console.log('🌍 [MESSAGE INPUT] localStorage value:', localStorage.getItem('wakilibot_language'));
    
    // Verify consistency
    const contextLang = getCurrentLanguage();
    const storageLang = localStorage.getItem('wakilibot_language');
    if (contextLang !== storageLang) {
      console.warn('🌍 [MESSAGE INPUT] ⚠️ INCONSISTENCY DETECTED!');
      console.warn('   Context language:', contextLang);
      console.warn('   Storage language:', storageLang);
    } else {
      console.log('🌍 [MESSAGE INPUT] ✅ Language consistency verified');
    }
  }, [selectedLanguage, isInitialized, getCurrentLanguage]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() === '' || isLoading || isStreaming) return;
    
    // Wait for language context to be initialized
    if (!isInitialized) {
      console.warn('🌍 [MESSAGE INPUT] Language context not initialized yet, waiting...');
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
        console.log('🌍 [MESSAGE INPUT DEBUG] Selected language:', selectedLanguage);
        console.log('🌍 [MESSAGE INPUT DEBUG] User message:', userMessage);
        response = await api.sendMessageStream(userMessage, conversationId, selectedLanguage, (chunk, isComplete, data) => {
          if (onStreamingMessage) {
            onStreamingMessage(chunk, isComplete, data);
          }
        });
        streamingSucceeded = true;
      } catch (streamingError) {
        console.warn('Streaming failed, falling back to regular API:', streamingError);
        console.log('🌍 [MESSAGE INPUT DEBUG] Fallback - Selected language:', selectedLanguage);
        response = await api.sendMessage(userMessage, conversationId, selectedLanguage);
        streamingSucceeded = false;
      }
      
      // Only add final response if streaming failed (to avoid duplicates)
      if (!streamingSucceeded && response && response.answer) {
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
      console.error('Error sending message:', error);
      onMessageReceived({
        text: "I apologize, but I'm experiencing technical difficulties. Please try again or contact CTDRU directly at +256-41-4230060 for immediate assistance.",
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

  const quickActions = [
    'Submit complaint',
    'Report fraud',
    'Check complaint status',
    'Wrong MoMo transfer',
  ];

  const handleQuickAction = (actionText) => {
    setMessage(actionText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const canSend = message.trim() !== '' && !isLoading && !isStreaming;

  return (
    <Box sx={{ position: 'relative' }}>
      <Fade in={!isLoading && !isStreaming && message === ''}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          {quickActions.map((text) => (
            <Button
              key={text}
              size="small"
              onClick={() => handleQuickAction(text)}
              sx={{
                borderRadius: 5,
                textTransform: 'none',
                fontSize: '0.8rem',
                fontWeight: 400,
                px: 1.5,
                py: 0.4,
                border: '1px solid rgba(11,31,58,0.14)',
                color: tokens.navy,
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  backgroundColor: tokens.paper,
                  borderColor: tokens.navyMid,
                },
              }}
            >
              {text}
            </Button>
          ))}
        </Stack>
      </Fade>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          p: '10px 12px',
          display: 'flex',
          alignItems: 'flex-end',
          borderRadius: 3.5,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(11,31,58,0.14)',
          boxShadow: '0 2px 12px rgba(11,31,58,0.04)',
          '&:focus-within': {
            borderColor: tokens.navyMid,
          },
        }}
      >
        <VoiceRecorder
          onMessageReceived={onMessageReceived}
          setIsLoading={setIsLoading}
        />

        <InputBase
          sx={{
            ml: 1.5,
            flex: 1,
            fontSize: '0.95rem',
            fontWeight: 400,
            color: tokens.ink,
            '& textarea::placeholder, & input::placeholder': {
              opacity: 0.55,
              color: tokens.muted,
            },
          }}
          placeholder="Message Wakilibot…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading || isStreaming}
          inputRef={inputRef}
          multiline
          maxRows={4}
        />

        <IconButton
          type="submit"
          aria-label="Send message"
          disabled={!canSend}
          sx={{
            ml: 1,
            width: 36,
            height: 36,
            backgroundColor: canSend ? tokens.navy : 'rgba(11,31,58,0.08)',
            color: canSend ? '#FFFFFF' : 'rgba(11,31,58,0.35)',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: canSend ? tokens.navyMid : 'rgba(11,31,58,0.12)',
            },
            '&:disabled': {
              backgroundColor: 'rgba(11,31,58,0.08)',
              color: 'rgba(11,31,58,0.35)',
            },
          }}
        >
          {isLoading || isStreaming ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SendIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Paper>

      <Typography
        sx={{
          mt: 1.5,
          textAlign: 'center',
          color: tokens.muted,
          fontSize: '0.72rem',
          fontWeight: 400,
        }}
      >
        Wakilibot can make mistakes. Check important information when needed.
      </Typography>
    </Box>
  );
};

export default MessageInput;