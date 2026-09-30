import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Button,
} from '@mui/material';
import {
  SearchFieldIcon,
  ConversationIcon,
  EmptyConversationsIcon,
  RefreshIcon,
  OpenActionIcon,
  ExportIcon,
  CopyLinkActionIcon,
} from './icons';
import PanelCard, { PanelEmptyState, PanelSectionLabel } from './PanelCard';
import { tokens, radii } from '../styles/theme';
import api from '../services/api';

const formatTimestamp = (timestamp) => {
  // The agent stores these as unix seconds; api.utils.toMillis is what makes them dates.
  const millis = api.utils.toMillis(timestamp);
  if (millis === null) return '';
  return new Date(millis).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * One saved conversation. Resuming it is the card itself; everything else - exporting the
 * transcript, copying the reference for an email - sits behind the vertical dots on the right edge,
 * which is exactly how a Documents row is built.
 */
const HistoryCard = ({ conversation, active, onOpen }) => {
  const id = conversation.conversation_id || conversation.id;
  const title = conversation.title || conversation.preview || 'Conversation';
  const turns = conversation.message_count || conversation.messages?.length;
  const [notice, setNotice] = useState(null);
  const [exporting, setExporting] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const say = (text) => {
    setNotice(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2800);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { history = [] } = await api.getConversationHistory(id);
      const dataStr = JSON.stringify(
        { conversation_id: id, title, messages: history, exported: new Date().toISOString() },
        null,
        2
      );
      const url = URL.createObjectURL(new Blob([dataStr], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `wakilibot-${String(title).slice(0, 40).replace(/[^\w\s-]+/g, '').trim() || 'conversation'}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      say('Transcript downloaded');
    } catch {
      say('Could not export this conversation');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(String(id || ''));
      say('Reference copied');
    } catch {
      say('Could not copy the reference');
    }
  };

  const meta = [
    notice,
    formatTimestamp(conversation.timestamp || conversation.last_updated || conversation.updated_at),
    conversation.intent ? conversation.intent.replace(/_/g, ' ') : null,
    turns ? `${turns} ${turns === 1 ? 'message' : 'messages'}` : null,
    active ? 'open now' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PanelCard
      glyph={ConversationIcon}
      title={title}
      meta={meta}
      description={
        conversation.preview && conversation.preview !== title ? conversation.preview : null
      }
      selected={Boolean(active)}
      onClick={() => onOpen(conversation)}
      actions={[
        { id: 'open', label: 'Open', icon: OpenActionIcon, onClick: () => onOpen(conversation) },
        {
          id: 'export',
          label: exporting ? 'Exporting…' : 'Export transcript',
          icon: ExportIcon,
          onClick: handleExport,
          disabled: exporting,
        },
        { id: 'rule', divider: true },
        {
          id: 'copy',
          label: 'Copy reference',
          icon: CopyLinkActionIcon,
          onClick: handleCopyReference,
          disabled: !id,
        },
      ]}
    />
  );
};

const ConversationHistory = ({ onSelectConversation, currentConversationId, userId = null }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadConversations = useCallback(async () => {
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
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleConversationClick = async (conversation) => {
    const id = conversation.conversation_id || conversation.id;
    try {
      const historyResponse = await api.getConversationHistory(id);
      onSelectConversation?.({
        id,
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
                <SearchFieldIcon style={{ color: tokens.muted }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={loadConversations}
          startIcon={<RefreshIcon />}
          sx={{
            textTransform: 'none',
            borderColor: tokens.line,
            color: tokens.navy,
            borderRadius: radii.card,
            flexShrink: 0,
          }}
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
        <PanelEmptyState
          glyph={EmptyConversationsIcon}
          title={searchTerm ? 'Nothing matches that search' : 'No conversations yet'}
          note={
            searchTerm
              ? 'Try a topic instead - complaint, fraud, status, rights.'
              : 'Chats you have here are saved so you can pick them up again.'
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <PanelSectionLabel>
          {`${filtered.length} ${filtered.length === 1 ? 'conversation' : 'conversations'}`}
        </PanelSectionLabel>
      )}

      <Stack spacing={1.5}>
        {filtered.map((conversation) => {
          const id = conversation.conversation_id || conversation.id;
          return (
            <HistoryCard
              key={id}
              conversation={conversation}
              active={Boolean(currentConversationId && currentConversationId === id)}
              onOpen={handleConversationClick}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default ConversationHistory;
