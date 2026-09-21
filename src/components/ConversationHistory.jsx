import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import { tokens } from '../styles/theme';
import api from '../services/api';

const ConversationHistory = ({ onSelectConversation, currentConversationId, userId = null }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getUserConversations(userId, 100);
      setConversations(response.conversations || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [userId]);

  const handleConversationClick = async (conversation) => {
    try {
      const historyResponse = await api.getConversationHistory(conversation.conversation_id);
      onSelectConversation?.({
        id: conversation.conversation_id,
        title: conversation.title || 'Untitled conversation',
        messages: historyResponse.history || [],
        timestamp: conversation.timestamp,
        intent: conversation.intent,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to open conversation');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const title = (c.title || c.preview || '').toLowerCase();
      const intent = (c.intent || '').toLowerCase();
      return title.includes(q) || intent.includes(q);
    });
  }, [conversations, searchTerm]);

  return (
    <Box>
      <Typography sx={{ color: tokens.muted, mb: 3, lineHeight: 1.6, maxWidth: 560 }}>
        Resume earlier chats about complaints, fraud reports, and status checks.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search history"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: tokens.muted, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={loadConversations}
          sx={{ textTransform: 'none', borderColor: 'rgba(11,31,58,0.2)', color: tokens.navy }}
        >
          Refresh
        </Button>
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Typography sx={{ color: tokens.muted, py: 4 }}>No conversations yet.</Typography>
      )}

      <Stack spacing={1.25}>
        {filtered.map((conversation) => {
          const id = conversation.conversation_id || conversation.id;
          const active = currentConversationId && currentConversationId === id;
          return (
            <Box
              key={id}
              onClick={() => handleConversationClick(conversation)}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                border: active
                  ? `1px solid ${tokens.navy}`
                  : '1px solid rgba(11,31,58,0.1)',
                backgroundColor: active ? tokens.paper : '#FFFFFF',
                '&:hover': { backgroundColor: tokens.paper },
              }}
            >
              <ChatIcon sx={{ color: tokens.navyMid, mt: 0.2, fontSize: 20 }} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap sx={{ fontWeight: 600, color: tokens.navy, mb: 0.35 }}>
                  {conversation.title || conversation.preview || 'Conversation'}
                </Typography>
                <Typography sx={{ color: tokens.muted, fontSize: '0.8rem' }}>
                  {formatTimestamp(conversation.timestamp || conversation.updated_at)}
                  {conversation.intent ? ` · ${conversation.intent.replace(/_/g, ' ')}` : ''}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ConversationHistory;
