import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import { tokens } from '../styles/theme';
import api from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const STANDARDS = [
  { label: '01 Issue', hint: 'What went wrong' },
  { label: '02 Facts', hint: 'Who, when, amount' },
  { label: '03 Evidence', hint: 'IDs, SMS, receipts' },
  { label: '04 Impact', hint: 'Loss or risk' },
  { label: '05 Ask', hint: 'Remedy requested' },
];

const STARTERS = {
  complaint: [
    'Draft a MoMo wrong-transfer complaint',
    'Format a bank unauthorized-charge case',
    'What does CTDRU need for a billing dispute?',
  ],
  fraud: [
    'Draft a PIN-theft fraud report',
    'Format a phishing / fake SMS report',
    'Structure a SIM-swap fraud case',
  ],
};

const buildSystemPrompt = (mode, userText) => {
  const kind = mode === 'fraud' ? 'fraud / scam report' : 'consumer complaint';
  return `You are Wakilibot's drafting assistant for CTDRU (Uganda) consumer protection.
Help the user craft a clear, professional ${kind} following this standard intake method:
1) Issue 2) Facts 3) Evidence 4) Impact 5) Ask (remedy requested).

Rules:
- Ask brief clarifying questions only if critical facts are missing.
- Prefer concrete Ugandan financial context (MoMo, Airtel Money, banks, telecom).
- Do not invent transaction IDs, amounts, dates, or names the user did not provide.
- When you have enough information, produce a FINAL DRAFT in EXACTLY this format (keep labels):

PROVIDER: <company or network>
TRANSACTION_ID: <id or Unknown>
DATE: <YYYY-MM-DD or Unknown>
AMOUNT: <number and currency or Unknown>
ISSUE_TYPE: <fraud|unauthorized_transaction|failed_transaction|wrong_amount|billing_error|other>
NARRATIVE:
<well-written 1-3 paragraph description suitable for a CTDRU filing>

Then add a short CHECKLIST of any missing evidence the user should attach.

User message:
${userText}`;
};

/** Parse structured draft fields from assistant text. */
export const parseDraftFields = (text = '') => {
  const get = (label) => {
    const re = new RegExp(`${label}\\s*:\\s*(.+)`, 'i');
    const m = text.match(re);
    return m ? m[1].trim() : '';
  };

  const narrativeMatch = text.match(/NARRATIVE\s*:\s*([\s\S]*?)(?:\n\s*CHECKLIST\s*:|$)/i);
  let narrative = narrativeMatch ? narrativeMatch[1].trim() : '';

  if (!narrative && text.length > 80) {
    const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    narrative = parts[parts.length - 1] || text.trim();
  }

  const issueRaw = get('ISSUE_TYPE').toLowerCase().replace(/\s+/g, '_');
  const allowed = [
    'fraud',
    'unauthorized_transaction',
    'failed_transaction',
    'wrong_amount',
    'billing_error',
    'poor_service',
    'account_blocked',
    'refund_issue',
    'technical_issue',
    'other',
  ];
  const issueType = allowed.find((v) => issueRaw.includes(v)) || '';

  const amountRaw = get('AMOUNT');
  const amount = amountRaw.replace(/[^\d.]/g, '');

  const dateRaw = get('DATE');
  let dateOfIncident = '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateRaw)) {
    dateOfIncident = dateRaw.slice(0, 10);
  }

  const provider = get('PROVIDER');
  const transactionId = get('TRANSACTION_ID');
  const unknown = /^(unknown|n\/?a|-)$/i;

  return {
    companyName: provider && !unknown.test(provider) ? provider : '',
    transactionId:
      transactionId && !unknown.test(transactionId) ? transactionId : '',
    dateOfIncident,
    amount: amount || '',
    issueType,
    description: narrative,
    hasStructuredDraft: Boolean(narrativeMatch || get('PROVIDER') || get('NARRATIVE')),
  };
};

const sharp = {
  borderRadius: 0,
  '& .MuiOutlinedInput-root': { borderRadius: 0 },
  '& fieldset': { borderRadius: 0 },
};

/**
 * Mini chat for drafting CTDRU-standard complaints / fraud reports with the LLM.
 * Sharp, square edges — no ovals / rounded corners.
 */
const DraftAssistant = ({ mode = 'complaint', onApplyDraft, sideBySide = false }) => {
  const { getCurrentLanguageInfo } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [applied, setApplied] = useState(false);
  const listRef = useRef(null);

  const isFraud = mode === 'fraud';
  const starters = STARTERS[isFraud ? 'fraud' : 'complaint'];

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: isFraud
          ? 'Describe the scam or unauthorized activity. I will structure a CTDRU-standard fraud report (Issue → Facts → Evidence → Impact → Ask) you can apply to the form.'
          : 'Describe the dispute in your own words. I will format a CTDRU-standard complaint narrative you can apply to the form.',
      },
    ]);
    setConversationId(null);
    setApplied(false);
  }, [mode, isFraud]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (rawText) => {
    const text = (rawText || input).trim();
    if (!text || loading) return;

    setInput('');
    setError('');
    setApplied(false);
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: 'user', text }]);
    setLoading(true);

    try {
      const prompt = buildSystemPrompt(mode, text);
      const data = await api.sendMessage(
        prompt,
        conversationId,
        getCurrentLanguageInfo()?.code || 'en'
      );
      if (data?.conversation_id) setConversationId(data.conversation_id);
      const answer =
        data?.answer ||
        data?.response ||
        'I could not draft a response. Please try again with a few more details.';
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: 'assistant', text: answer },
      ]);
    } catch (err) {
      console.error(err);
      setError('Drafting assistant is unavailable. You can still fill the form manually.');
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: 'Sorry—I could not reach the drafting assistant. Please try again, or continue with the form.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.id !== 'welcome');
  const parsed = lastAssistant ? parseDraftFields(lastAssistant.text) : null;
  const canApply = Boolean(parsed?.description);

  const handleApply = () => {
    if (!parsed?.description || !onApplyDraft) return;
    onApplyDraft(parsed);
    setApplied(true);
  };

  return (
    <Box
      sx={{
        mb: sideBySide ? 0 : 4,
        border: `1px solid ${tokens.line}`,
        borderRadius: 0,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
        minHeight: sideBySide ? { lg: 'calc(100vh - 180px)' } : 420,
        maxHeight: sideBySide ? { lg: 'calc(100vh - 140px)' } : 560,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: `1px solid ${tokens.line}`,
          backgroundColor: tokens.paper,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
          <AutoAwesomeIcon sx={{ color: tokens.navy, fontSize: 18 }} />
          <Typography
            sx={{
              fontWeight: 650,
              color: tokens.navy,
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}
          >
            AI drafting assistant
          </Typography>
        </Stack>
        <Typography
          sx={{
            color: tokens.muted,
            fontSize: '0.82rem',
            lineHeight: 1.5,
            mb: 1.25,
          }}
        >
          Write and format your {isFraud ? 'fraud report' : 'complaint'} to CTDRU
          standards, then apply it to the form.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 0.5,
          }}
        >
          {STANDARDS.map((s) => (
            <Box
              key={s.label}
              sx={{
                border: `1px solid ${tokens.line}`,
                backgroundColor: '#FFFFFF',
                px: 0.75,
                py: 0.6,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: tokens.navy,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  color: tokens.muted,
                  lineHeight: 1.25,
                  display: { xs: 'none', xl: 'block' },
                }}
              >
                {s.hint}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Messages */}
      <Box
        ref={listRef}
        sx={{
          flex: 1,
          minHeight: 160,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 0,
          py: 0,
          backgroundColor: '#FFFFFF',
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${tokens.line}`,
              backgroundColor: msg.role === 'user' ? tokens.paper : '#FFFFFF',
              borderLeft:
                msg.role === 'user'
                  ? `3px solid ${tokens.navy}`
                  : `3px solid ${tokens.gold}`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: tokens.muted,
                mb: 0.6,
              }}
            >
              {msg.role === 'user' ? 'You' : 'Wakilibot'}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.88rem',
                lineHeight: 1.55,
                color: tokens.ink,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {msg.text}
            </Typography>
          </Box>
        ))}
        {loading && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ px: 2, py: 1.5, color: tokens.muted }}
          >
            <CircularProgress size={14} />
            <Typography sx={{ fontSize: '0.82rem' }}>Drafting…</Typography>
          </Stack>
        )}
      </Box>

      {error && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: 0,
            borderTop: `1px solid ${tokens.line}`,
            borderBottom: `1px solid ${tokens.line}`,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Starters */}
      {messages.length <= 1 && (
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderTop: `1px solid ${tokens.line}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          {starters.map((s) => (
            <Button
              key={s}
              size="small"
              variant="outlined"
              disabled={loading}
              onClick={() => send(s)}
              fullWidth
              sx={{
                ...sharp,
                textTransform: 'none',
                borderColor: tokens.line,
                color: tokens.navy,
                fontSize: '0.78rem',
                justifyContent: 'flex-start',
                textAlign: 'left',
                px: 1.25,
                py: 0.85,
                lineHeight: 1.35,
                whiteSpace: 'normal',
                height: 'auto',
                minHeight: 36,
              }}
            >
              {s}
            </Button>
          ))}
        </Box>
      )}

      {/* Composer */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${tokens.line}`,
          display: 'flex',
          gap: 1,
          alignItems: 'stretch',
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={3}
          placeholder={
            isFraud
              ? 'Describe the scam or unauthorized activity…'
              : 'Describe the dispute in your own words…'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={loading}
          sx={{
            minWidth: 0,
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              fontSize: '0.88rem',
            },
          }}
        />
        <Button
          aria-label="Send"
          variant="contained"
          onClick={() => send()}
          disabled={loading || !input.trim()}
          sx={{
            borderRadius: 0,
            minWidth: 44,
            width: 44,
            px: 0,
            backgroundColor: tokens.navy,
            boxShadow: 'none',
            '&:hover': { backgroundColor: tokens.navyMid, boxShadow: 'none' },
          }}
        >
          <SendIcon fontSize="small" />
        </Button>
      </Box>

      {/* Apply */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${tokens.line}`,
          backgroundColor: tokens.paper,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ color: tokens.muted, fontSize: '0.78rem', lineHeight: 1.45 }}>
          {applied
            ? 'Draft applied to the form. Review and submit when ready.'
            : canApply
            ? 'A filing-ready draft is ready. Apply it to fill the form.'
            : 'Keep chatting until a structured FINAL DRAFT is produced.'}
        </Typography>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ContentPasteGoIcon />}
          disabled={!canApply || loading}
          onClick={handleApply}
          sx={{
            borderRadius: 0,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            py: 1.1,
            '&:hover': { boxShadow: 'none' },
          }}
        >
          Apply draft to form
        </Button>
      </Box>
    </Box>
  );
};

export default DraftAssistant;
