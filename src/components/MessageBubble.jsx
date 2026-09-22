import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Tooltip,
  IconButton,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ReplayIcon from '@mui/icons-material/Replay';
import CachedIcon from '@mui/icons-material/Cached';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GavelIcon from '@mui/icons-material/Gavel';
import ReportIcon from '@mui/icons-material/Report';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import WakilibotLogo from './WakilibotLogo';
import api from '../services/api';

const MessageBubble = ({ 
  message, 
  isUser, 
  timestamp = null, 
  status = 'delivered', 
  responseData = null,
  isError = false,
  isStreaming = false,
  isWelcome = false,
  onRegenerate,
  onCopy
}) => {
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  
  // Dark theme message styling with black background and white text - Smaller size
  const bubbleStyles = {
    user: {
      backgroundColor: '#333333', // Dark gray for user messages
      color: '#ffffff',
      borderRadius: '12px 12px 4px 12px',
      alignSelf: 'flex-end',
      maxWidth: '60%', // Reduced from 75%
      boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
      border: '1px solid #444444'
    },
    assistant: {
      backgroundColor: isError 
        ? '#4a1a1a' // Dark red for errors
        : isWelcome
        ? '#1a2a4a' // Dark blue for welcome
        : '#111111', // Very dark gray for AI messages
      color: isError ? '#ff6b6b' : '#ffffff',
      borderRadius: '12px 12px 12px 4px',
      alignSelf: 'flex-start',
      maxWidth: '70%', // Reduced from 85%
      boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
      border: '1px solid #333333'
    }
  };

  // Status icon
  const StatusIcon = () => {
    if (!isUser) return null;
    
    return status === 'delivered' ? (
      <Tooltip title="Delivered">
        <DoneAllIcon fontSize="small" sx={{ opacity: 0.6, color: '#ffffff' }} />
      </Tooltip>
    ) : null;
  };

  // Format timestamp
  const getFormattedTime = () => {
    if (!timestamp) return '';
    
    try {
      if (timestamp instanceof Date) {
        return new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric'
        }).format(timestamp);
      }
      
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric'
      }).format(new Date(timestamp));
    } catch (error) {
      return '';
    }
  };

  const formattedTime = getFormattedTime();

  // TTS Functions
  // The TTS API returns raw PCM 16-bit 16kHz audio bytes (not a file URL),
  // so playback uses the Web Audio API instead of an <audio> element.
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const decodePcm16 = (pcmArrayBuffer, sampleRate) => {
    const ctx = getAudioContext();
    const int16 = new Int16Array(pcmArrayBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    const buffer = ctx.createBuffer(1, float32.length, sampleRate);
    buffer.copyToChannel(float32, 0);
    return buffer;
  };

  const playBuffer = (buffer) => {
    const ctx = getAudioContext();
    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null;
      try { sourceNodeRef.current.stop(); } catch (e) { /* already stopped */ }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      setIsPlaying(false);
      sourceNodeRef.current = null;
    };
    sourceNodeRef.current = source;
    source.start();
    setIsPlaying(true);
  };

  const handleGenerateTTS = async () => {
    if (!message || isUser || isGeneratingTTS) return;

    setIsGeneratingTTS(true);
    setTtsError(null);
    try {
      console.log('🔊 Generating TTS for message:', message.substring(0, 100) + '...');
      const ttsResponse = await api.generateTTS(message);

      if (ttsResponse && ttsResponse.pcm) {
        const buffer = decodePcm16(ttsResponse.pcm, ttsResponse.sampleRate);
        setAudioBuffer(buffer);
        playBuffer(buffer);
      } else {
        const errorMsg = 'No audio data in TTS response';
        console.error('🔊', errorMsg, ':', ttsResponse);
        setTtsError(errorMsg);
      }
    } catch (error) {
      console.error('🔊 Error generating TTS:', error);
      setTtsError(error.message || 'Failed to generate audio');
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handlePlayAudio = () => {
    if (!audioBuffer) {
      handleGenerateTTS();
      return;
    }
    playBuffer(audioBuffer);
  };

  const handleStopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null;
      try { sourceNodeRef.current.stop(); } catch (e) { /* already stopped */ }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  // Cleanup audio context/source on component unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) { /* already stopped */ }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Get task status color and icon
  const getTaskStatusInfo = (taskStatus) => {
    switch (taskStatus) {
      case 'completed':
        return { color: 'success', icon: <CheckCircleIcon />, label: 'Completed' };
      case 'collecting_data':
        return { color: 'warning', icon: <AssignmentIcon />, label: 'Collecting Data' };
      case 'failed':
      case 'api_error':
        return { color: 'error', icon: <ErrorIcon />, label: 'Failed' };
      case 'information_provided':
        return { color: 'info', icon: <PsychologyIcon />, label: 'Information Provided' };
      default:
        return { color: 'default', icon: <AssignmentIcon />, label: taskStatus?.replace('_', ' ') || 'Processing' };
    }
  };

  // Get intent display info with minimal icons
  const getIntentInfo = (intent) => {
    const intentMap = {
      'submit_complaint': { name: 'Complaint', icon: <GavelIcon />, color: 'error' },
      'check_status': { name: 'Status', icon: <TrendingUpIcon />, color: 'info' },
      'fraud_reporting': { name: 'Fraud', icon: <SecurityIcon />, color: 'warning' },
      'fraud_alert': { name: 'Alert', icon: <ReportIcon />, color: 'error' },
      'greeting': { name: 'Greeting', icon: <AutoAwesomeIcon />, color: 'primary' },
      'general_inquiry': { name: 'Inquiry', icon: <ContactSupportIcon />, color: 'default' },
      'contact_information': { name: 'Contact', icon: <ContactSupportIcon />, color: 'info' },
      'ctdru_services': { name: 'Services', icon: <SecurityIcon />, color: 'primary' },
      'consumer_rights': { name: 'Rights', icon: <GavelIcon />, color: 'success' }
    };
    return intentMap[intent] || { name: intent, icon: <AutoAwesomeIcon />, color: 'default' };
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        mb: 2,
        width: '100%'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 2
        }}
      >
        {/* Dark Theme Avatar - Smaller */}
        <Avatar 
          sx={{ 
            width: 28,
            height: 28,
            backgroundColor: isUser ? '#333333' : '#ffffff',
            color: isUser ? '#ffffff' : '#000000',
            border: '1px solid #444444',
            fontSize: '12px'
          }}
        >
          {isUser ? <PersonIcon sx={{ fontSize: 16 }} /> : <WakilibotLogo size={16} showText={false} variant="icon" />}
        </Avatar>
        
        {/* Dark Theme Message Bubble - Smaller padding */}
        <Paper 
          elevation={0}
          sx={{
            py: 1.5,
            px: 2,
            position: 'relative',
            ...bubbleStyles[isUser ? 'user' : 'assistant']
          }}
        >
          {/* Message Content */}
          {isUser ? (
            <Typography variant="body1" sx={{ fontWeight: 400, lineHeight: 1.6, fontSize: '15px' }}>
              {message}
            </Typography>
          ) : (
            <Box>
              <Box>
                {/* Simple text rendering without ReactMarkdown to avoid children.props.style errors */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 400, 
                    lineHeight: 1.6, 
                    fontSize: '15px',
                    whiteSpace: 'pre-wrap', // Preserve line breaks and formatting
                    '& code': {
                      backgroundColor: '#222222',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      color: '#ffffff',
                      border: '1px solid #444444'
                    }
                  }}
                >
                  {message}
                </Typography>
                
                {/* Dark Theme Streaming Cursor */}
                {isStreaming && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
                    <Box
                      sx={{
                        width: 2,
                        height: 16,
                        backgroundColor: '#ffffff',
                        animation: 'typing 1.2s infinite',
                        '@keyframes typing': {
                          '0%, 50%': { opacity: 1 },
                          '51%, 100%': { opacity: 0.3 }
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
              
              {/* Dark Theme Response Information */}
              {responseData && !isWelcome && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 1.5, opacity: 0.3, borderColor: '#444444' }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {/* Intent Chip */}
                    {responseData.intent && (
                      <Chip
                        icon={getIntentInfo(responseData.intent).icon}
                        label={getIntentInfo(responseData.intent).name}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '11px',
                          height: '24px',
                          borderColor: '#444444',
                          color: '#cccccc',
                          backgroundColor: '#222222',
                          '& .MuiChip-icon': { fontSize: '14px' }
                        }}
                      />
                    )}
                    
                    {/* Task Status Chip */}
                    {responseData.taskStatus && (
                      <Chip
                        icon={getTaskStatusInfo(responseData.taskStatus).icon}
                        label={getTaskStatusInfo(responseData.taskStatus).label}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '11px',
                          height: '24px',
                          borderColor: '#444444',
                          color: '#cccccc',
                          backgroundColor: '#222222',
                          '& .MuiChip-icon': { fontSize: '14px' }
                        }}
                      />
                    )}
                    
                    {/* Response Time */}
                    {responseData.responseTime && (
                      <Tooltip title="Response Time">
                        <Chip
                          icon={<SpeedIcon />}
                          label={`${(responseData.responseTime * 1000).toFixed(0)}ms`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '11px',
                            height: '24px',
                            borderColor: '#444444',
                            color: '#cccccc',
                            backgroundColor: '#222222',
                            '& .MuiChip-icon': { fontSize: '14px' }
                          }}
                        />
                      </Tooltip>
                    )}
                    
                    {/* Cached Response */}
                    {responseData.isCached && (
                      <Tooltip title="Cached Response">
                        <Chip
                          icon={<CachedIcon />}
                          label="Cached"
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '11px',
                            height: '24px',
                            borderColor: '#444444',
                            color: '#cccccc',
                            backgroundColor: '#222222',
                            '& .MuiChip-icon': { fontSize: '14px' }
                          }}
                        />
                      </Tooltip>
                    )}
                    
                    {/* Complaint ID */}
                    {responseData.complaintId && (
                      <Tooltip title="Complaint ID">
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`ID: ${responseData.complaintId}`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '11px',
                            height: '24px',
                            borderColor: '#444444',
                            color: '#cccccc',
                            backgroundColor: '#222222',
                            '& .MuiChip-icon': { fontSize: '14px' }
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          {/* Dark Theme Message Footer */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1.5,
              opacity: 0.6,
              '& .actions': { 
                opacity: 0,
                transition: '0.2s opacity'
              },
              '&:hover .actions': { 
                opacity: 1
              }
            }}
          >
            {formattedTime && (
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 400, color: '#cccccc' }}>
                {formattedTime}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }} className="actions">
              {/* TTS Button - Only for AI messages */}
              {!isUser && !isWelcome && (
                <Tooltip title={
                  ttsError ? `TTS Error: ${ttsError}` :
                  isGeneratingTTS ? "Generating audio..." : 
                  isPlaying ? "Stop audio" : 
                  audioBuffer ? "Play audio" :
                  "Convert to speech"
                }>
                  <IconButton 
                    size="small" 
                    onClick={isPlaying ? handleStopAudio : handlePlayAudio}
                    disabled={isGeneratingTTS}
                    sx={{ 
                      padding: 0.5, 
                      color: ttsError ? '#f44336' : isPlaying ? '#4caf50' : '#cccccc',
                      '&:hover': {
                        color: ttsError ? '#e57373' : isPlaying ? '#66bb6a' : '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {isGeneratingTTS ? (
                      <CircularProgress size={14} sx={{ color: '#cccccc' }} />
                    ) : isPlaying ? (
                      <VolumeOffIcon fontSize="small" />
                    ) : ttsError ? (
                      <VolumeUpIcon fontSize="small" sx={{ opacity: 0.5 }} />
                    ) : (
                      <VolumeUpIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              {!isUser && onRegenerate && (
                <Tooltip title="Regenerate response">
                  <IconButton size="small" onClick={onRegenerate} sx={{ padding: 0.5, color: '#cccccc' }}>
                    <ReplayIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="More options">
                <IconButton size="small" sx={{ padding: 0.5, color: '#cccccc' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <StatusIcon />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MessageBubble;