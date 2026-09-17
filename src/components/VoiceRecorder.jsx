import React, { useState, useEffect, useRef } from 'react';
import { IconButton, CircularProgress, Box, Typography, Tooltip, Stack } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const VoiceRecorder = ({ onMessageReceived, setIsLoading }) => {
  const { selectedLanguage, getCurrentLanguage } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSendCancel, setShowSendCancel] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (recorder) {
        recorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [timerInterval, recorder]);

  const startRecording = async () => {
    try {
      console.log('🎤 [VOICE DEBUG] Starting recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      console.log('🎤 [VOICE DEBUG] Microphone access granted');
      console.log('🎤 [VOICE DEBUG] Audio tracks:', stream.getAudioTracks().length);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      console.log('🎤 [VOICE DEBUG] MediaRecorder created');
      console.log('🎤 [VOICE DEBUG] Supported MIME types:', MediaRecorder.isTypeSupported('audio/webm;codecs=opus'));
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('🎤 [VOICE DEBUG] Data available - size:', event.data.size, 'type:', event.data.type);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('🎤 [VOICE DEBUG] Recording stopped');
        console.log('🎤 [VOICE DEBUG] Total chunks collected:', chunks.length);
        
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log('🎤 [VOICE DEBUG] Audio blob created - size:', audioBlob.size, 'type:', audioBlob.type);
        
        setRecordedAudioBlob(audioBlob);
        setShowSendCancel(true);
        console.log('🎤 [VOICE DEBUG] Ready to send audio to server');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setRecorder(mediaRecorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing your microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    console.log('🎤 [VOICE DEBUG] Stopping recording...');
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
    setIsRecording(false);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const sendRecording = async () => {
    console.log('🎤 [VOICE DEBUG] Starting sendRecording...');
    if (!recordedAudioBlob) {
      console.error('🎤 [VOICE DEBUG] No recorded audio available');
      return;
    }

    setIsProcessing(true);
    setIsLoading(true);
    setShowSendCancel(false);

    try {
      console.log('🎤 [VOICE DEBUG] Sending audio to API...');
      console.log('🎤 [VOICE DEBUG] Using language:', selectedLanguage);
      console.log('🎤 [VOICE DEBUG] Context getCurrentLanguage():', getCurrentLanguage());
      const response = await api.sendVoiceMessage(recordedAudioBlob, selectedLanguage);
      console.log('🎤 [VOICE DEBUG] API response received:', response);
      
      // Check if we have a valid response with answer
      if (response && response.answer) {
        // Add user message with transcribed text
        const transcribedText = response.voice_chat_info?.transcribed_text || "Voice message";
        onMessageReceived({
          text: transcribedText,
          isUser: true,
          timestamp: new Date()
        });
        
        // Add AI response
        onMessageReceived({
          text: response.answer,
          isUser: false,
          timestamp: new Date()
        });
      } else {
        throw new Error('Voice processing failed - no answer received');
      }
      
    } catch (error) {
      console.error('🎤 [VOICE DEBUG] Error sending voice message:', error);
      onMessageReceived({
        text: "Sorry, I couldn't process your voice message. Please try again.",
        isUser: false,
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
      setRecordedAudioBlob(null);
      console.log('🎤 [VOICE DEBUG] Send recording completed');
    }
  };

  const cancelRecording = () => {
    console.log('🎤 [VOICE DEBUG] Canceling recording...');
    setShowSendCancel(false);
    setRecordedAudioBlob(null);
    setIsProcessing(false);
    setIsLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonColor = () => {
    if (isProcessing) return 'warning';
    if (isRecording) return 'error';
    return 'default';
  };

  const getTooltipTitle = () => {
    if (isProcessing) return 'Processing your voice...';
    if (isRecording) return 'Click to stop recording';
    return 'Click to start voice chat';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showSendCancel ? (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Send voice message">
            <IconButton
              onClick={sendRecording}
              disabled={isProcessing}
              color="primary"
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              {isProcessing ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton
              onClick={cancelRecording}
              disabled={isProcessing}
              color="error"
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : (
        <Tooltip title={getTooltipTitle()}>
          <IconButton
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            color={getButtonColor()}
            sx={{ 
              bgcolor: isRecording ? 'error.main' : 'default',
              color: isRecording ? 'white' : 'default',
              '&:hover': { 
                bgcolor: isRecording ? 'error.dark' : 'action.hover' 
              }
            }}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>
      )}
      
      {isRecording && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeUpIcon color="error" />
          <Typography variant="body2" color="error">
            {formatTime(recordingTime)}
          </Typography>
        </Box>
      )}
      
      {isProcessing && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Processing...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VoiceRecorder;