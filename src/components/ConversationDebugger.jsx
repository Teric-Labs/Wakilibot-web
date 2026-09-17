import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import api from '../services/api';

const ConversationDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const gatherDebugInfo = () => {
      const sessionUserId = api.utils.getSessionUserId();
      const currentUserId = api.utils.getCurrentUserId();
      const storedUser = api.utils.getStoredUserData();
      const isLoggedIn = api.utils.isUserLoggedIn();
      
      setDebugInfo({
        sessionUserId,
        currentUserId,
        storedUser,
        isLoggedIn,
        sessionStorage: {
          ctdru_user_id: sessionStorage.getItem('ctdru_user_id'),
          ctdru_conversation_id: sessionStorage.getItem('ctdru_conversation_id')
        },
        localStorage: {
          wakilibot_user: localStorage.getItem('wakilibot_user')
        }
      });
    };

    gatherDebugInfo();
  }, []);

  const testConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = api.utils.getCurrentUserId();
      console.log('🔍 Testing conversations for user:', userId);
      
      const response = await api.getUserConversations(userId, 10);
      console.log('📊 API Response:', response);
      
      setConversations(response.conversations || []);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = api.utils.getCurrentUserId();
      console.log('📤 Sending test message for user:', userId);
      
      const response = await api.sendMessage('Test message for debugging conversations', null);
      console.log('📝 Message response:', response);
      
      // Refresh conversations after sending message
      await testConversations();
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        🔧 Conversation Debugger
      </Typography>

      {/* Debug Information */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#111111', border: '1px solid #333333' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
          📋 Debug Information
        </Typography>
        <pre style={{ 
          color: '#cccccc', 
          fontSize: '12px', 
          backgroundColor: '#222222', 
          padding: '16px', 
          borderRadius: '8px',
          overflow: 'auto',
          maxHeight: '300px'
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </Paper>

      {/* Test Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={testConversations}
          disabled={loading}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          {loading ? 'Loading...' : 'Test Get Conversations'}
        </Button>
        
        <Button
          variant="contained"
          onClick={sendTestMessage}
          disabled={loading}
          sx={{
            backgroundColor: '#4caf50',
            '&:hover': { backgroundColor: '#45a049' }
          }}
        >
          {loading ? 'Sending...' : 'Send Test Message'}
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
          {error}
        </Alert>
      )}

      {/* Conversations Display */}
      <Paper sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #333333' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
          💬 Conversations ({conversations.length})
        </Typography>
        
        {conversations.length === 0 ? (
          <Typography sx={{ color: '#888888', fontStyle: 'italic' }}>
            No conversations found. Try sending a test message.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {conversations.map((conv, index) => (
              <Paper
                key={conv.conversation_id}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: '#222222',
                  border: '1px solid #444444'
                }}
              >
                <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                  {conv.title || 'Untitled Conversation'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
                  ID: {conv.conversation_id}
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
                  Query: {conv.query}
                </Typography>
                <Typography variant="caption" sx={{ color: '#888888' }}>
                  Intent: {conv.intent} | Messages: {conv.message_count} | 
                  Updated: {new Date(conv.last_updated * 1000).toLocaleString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ConversationDebugger;
