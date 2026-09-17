import React, { useState, useRef, useEffect } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Box, 
  CircularProgress,
  Chip,
  Fade,
  Typography,
  Button,
  Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VoiceRecorder from './VoiceRecorder';
import api from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

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

  // Quick action buttons - Dark theme
  const quickActions = [
    { text: "Submit complaint", icon: <AssignmentIcon /> },
    { text: "Check status", icon: <AutoAwesomeIcon /> },
    { text: "Report fraud", icon: <AssignmentIcon /> },
    { text: "Consumer rights", icon: <AutoAwesomeIcon /> }
  ];

  const handleQuickAction = (actionText) => {
    setMessage(actionText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Quick Actions - Dark Theme */}
      <Fade in={!isLoading && !isStreaming && message === ''}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="#cccccc" sx={{ mb: 1, display: 'block', fontWeight: 500 }}>
            Quick actions:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                size="small"
                variant="outlined"
                startIcon={action.icon}
                onClick={() => handleQuickAction(action.text)}
                sx={{
                  borderRadius: 4,
                  textTransform: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  px: 2,
                  py: 0.5,
                  borderColor: '#444444',
                  color: '#cccccc',
                  backgroundColor: '#111111',
                  '&:hover': {
                    backgroundColor: '#222222',
                    borderColor: '#666666',
                    color: '#ffffff',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {action.text}
              </Button>
            ))}
          </Stack>
        </Box>
      </Fade>

      {/* Dark Theme Input Container - Smaller */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          p: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          backgroundColor: '#111111',
          border: '1px solid #333333',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#444444',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
          },
          '&:focus-within': {
            borderColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(255,255,255,0.1)',
          }
        }}
      >
        {/* Voice Recorder */}
        <VoiceRecorder 
          onMessageReceived={onMessageReceived} 
          setIsLoading={setIsLoading}
        />
        
        {/* Dark Theme Text Input */}
        <InputBase
          sx={{ 
            ml: 2, 
            flex: 1,
            fontSize: '15px',
            fontWeight: 400,
            color: '#ffffff',
            '& input': {
              '&::placeholder': {
                opacity: 0.6,
                fontWeight: 400,
                fontSize: '15px',
                color: '#888888'
              }
            },
            '& textarea': {
              '&::placeholder': {
                opacity: 0.6,
                fontWeight: 400,
                fontSize: '15px',
                color: '#888888'
              }
            }
          }}
          placeholder="Message Wakilibot..."
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
        
        {/* Dark Theme Send Button - Smaller */}
        <IconButton 
          type="submit" 
          disabled={message.trim() === '' || isLoading || isStreaming}
          sx={{ 
            ml: 1,
            p: 1,
            backgroundColor: message.trim() !== '' && !isLoading && !isStreaming
              ? '#ffffff'
              : '#333333',
            color: message.trim() !== '' && !isLoading && !isStreaming ? '#000000' : '#888888',
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: message.trim() !== '' && !isLoading && !isStreaming
                ? '#cccccc'
                : '#444444',
              transform: 'scale(1.05)',
            },
            '&:disabled': {
              backgroundColor: '#333333',
              color: '#888888',
              transform: 'none'
            }
          }}
        >
          {isLoading || isStreaming ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Paper>

      {/* Dark Theme Status Indicators */}
      <Fade in={isLoading || isStreaming}>
        <Box sx={{ 
          position: 'absolute', 
          top: -40, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center',
          gap: 1
        }}>
          <Chip
            icon={<AutoAwesomeIcon />}
            label={isStreaming ? "Wakilibot is typing..." : "Processing..."}
            size="small"
            variant="outlined"
            sx={{ 
              backgroundColor: '#111111',
              borderColor: '#333333',
              color: '#cccccc',
              fontWeight: 500,
              fontSize: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          />
        </Box>
      </Fade>

      {/* Dark Theme Footer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 2,
        opacity: 0.5
      }}>
        <Typography variant="caption" color="#888888" sx={{ fontWeight: 400, fontSize: '11px' }}>
          Wakilibot can make mistakes. Consider checking important information.
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageInput;