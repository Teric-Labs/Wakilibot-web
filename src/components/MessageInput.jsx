import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
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
  onPendingEvidence,
  onComplaintFiled,
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
  const [attachmentName, setAttachmentName] = useState(null);
  const [attachmentContext, setAttachmentContext] = useState(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState(null);
  const [attachmentDurableUrl, setAttachmentDurableUrl] = useState(null);
  const [attachmentIsImage, setAttachmentIsImage] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const inputRef = useRef(null);
  const recorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const pendingFileRef = useRef(null);
  const previewUrlRef = useRef(null);
  const durableUploadPromiseRef = useRef(null);

  const clearAttachment = useCallback((revokePreview = true) => {
    if (revokePreview && previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
    durableUploadPromiseRef.current = null;
    setAttachmentPreviewUrl(null);
    setAttachmentDurableUrl(null);
    setAttachmentIsImage(false);
    setAttachmentName(null);
    setAttachmentContext(null);
    pendingFileRef.current = null;
  }, []);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && voicePhase === 'idle') {
      inputRef.current.focus();
    }
  }, [voicePhase]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    },
    []
  );

  const busy = isLoading || isStreaming;

  const handleAttachFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busy || extracting) return;
    clearAttachment(true);
    const isImage = Boolean(file.type && file.type.startsWith('image/'));
    let previewUrl = null;
    if (isImage) {
      previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;
      setAttachmentPreviewUrl(previewUrl);
      setAttachmentIsImage(true);
    } else {
      setAttachmentIsImage(false);
    }
    setExtracting(true);
    setAttachmentName(file.name);
    pendingFileRef.current = file;
    // Persist to backend/R2 in parallel so history can reload the preview after refresh.
    durableUploadPromiseRef.current = api
      .uploadChatAttachment(file, { conversationId })
      .then((uploaded) => {
        if (pendingFileRef.current !== file) return null;
        const durableUrl = uploaded?.file_url || null;
        if (durableUrl) setAttachmentDurableUrl(durableUrl);
        return uploaded;
      })
      .catch((err) => {
        console.warn('[Chat] Durable attachment upload failed:', err);
        return null;
      });
    try {
      const result = await api.extractAttachment(file, message.trim() || null);
      if (result?.extracted_text) {
        setAttachmentContext(result.extracted_text);
      } else {
        clearAttachment(true);
        const detail =
          result?.note ||
          result?.error ||
          'Could not read that file. Try a clearer JPG/PNG or a text PDF (HEIC not supported).';
        onMessageReceived?.({
          text: detail,
          isUser: false,
          isError: true,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err) {
      clearAttachment(true);
      onMessageReceived?.({
        text:
          err?.payload?.note ||
          err?.payload?.error ||
          err.message ||
          'Attachment extract failed. Try JPG/PNG under 12MB, or a text PDF.',
        isUser: false,
        isError: true,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if ((message.trim() === '' && !attachmentContext) || busy || extracting) return;

    // Wait for language context to be initialized
    if (!isInitialized) {
      return;
    }

    const pendingName = attachmentName;
    const pendingAttachment = attachmentContext;
    const pendingFile = pendingFileRef.current;
    const pendingPreviewUrl = previewUrlRef.current;
    const pendingIsImage = attachmentIsImage;
    let pendingDurableUrl = attachmentDurableUrl;
    const uploadPromise = durableUploadPromiseRef.current;
    const userMessage =
      message.trim() ||
      (pendingAttachment
        ? pendingIsImage
          ? 'Please review the attached image.'
          : `Please review the attached document (${pendingName || 'file'}).`
        : '');
    setMessage('');
    // Keep the object URL alive for the chat bubble; only clear local composer state.
    previewUrlRef.current = null;
    durableUploadPromiseRef.current = null;
    setAttachmentPreviewUrl(null);
    setAttachmentDurableUrl(null);
    setAttachmentIsImage(false);
    setAttachmentContext(null);
    setAttachmentName(null);
    pendingFileRef.current = null;
    if (pendingFile && pendingAttachment) {
      onPendingEvidence?.({
        file: pendingFile,
        extractedText: pendingAttachment,
        name: pendingName,
      });
    }
    setIsLoading(true);
    setIsStreaming(true);
    setIsWaitingForResponse(true);

    if (!pendingDurableUrl && uploadPromise) {
      try {
        const uploaded = await uploadPromise;
        pendingDurableUrl = uploaded?.file_url || null;
      } catch (_err) {
        pendingDurableUrl = null;
      }
    }

    const attachmentKind = pendingAttachment
      ? pendingIsImage
        ? 'image'
        : 'file'
      : null;
    const previewForBubble =
      (pendingIsImage && (pendingDurableUrl || pendingPreviewUrl)) || null;

    // Add user message to chat (with image/file preview for WhatsApp-style display)
    onMessageReceived({
      text: userMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      imagePreview: previewForBubble,
      attachmentName: pendingName || null,
      attachmentKind,
      attachmentUrl: pendingDurableUrl || null,
    });

    // Blob URLs are session-only; revoke once the durable URL is in the bubble.
    if (pendingDurableUrl && pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }

    const attachmentMeta = pendingDurableUrl
      ? {
          attachment_url: pendingDurableUrl,
          attachment_name: pendingName || null,
          attachment_kind: attachmentKind,
        }
      : null;

    try {
      // Try streaming API first, fallback to regular API if it fails
      let response;
      let streamingSucceeded = false;

      try {
        response = await api.sendMessageStream(
          userMessage,
          conversationId,
          selectedLanguage,
          (chunk, isComplete, data) => {
            if (onStreamingMessage) {
              onStreamingMessage(chunk, isComplete, data);
            }
          },
          activeIntent,
          pendingAttachment,
          attachmentMeta
        );
        streamingSucceeded = true;
      } catch (streamingError) {
        response = await api.sendMessage(
          userMessage,
          conversationId,
          selectedLanguage,
          null,
          activeIntent,
          pendingAttachment,
          attachmentMeta
        );
        streamingSucceeded = false;
      }

      // Only add final response if streaming failed (to avoid duplicates)
      if (!streamingSucceeded && response && response.answer) {
        // Streaming path updates React via onStreamingMessage; non-stream must
        // mirror conversation_id into parent state so the next turn keeps the thread.
        if (response.conversation_id) {
          onConversationIdChange?.(response.conversation_id);
        }
        if (response.complaint_id && response.evidence_token) {
          onComplaintFiled?.(response.complaint_id, response.evidence_token);
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
            evidenceToken: response.evidence_token,
            evidenceUploadUrl: response.evidence_upload_url,
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

  const canSend = (message.trim() !== '' || Boolean(attachmentContext)) && !busy && !extracting;

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

      {attachmentName && voicePhase === 'idle' && (
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            gap: 1.25,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {attachmentPreviewUrl ? (
            <Box
              sx={{
                position: 'relative',
                width: { xs: 112, sm: 140 },
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(11,31,58,0.12)',
                boxShadow: '0 8px 20px -14px rgba(11,31,58,0.45)',
                backgroundColor: '#F4F4F5',
              }}
            >
              <Box
                component="img"
                src={attachmentPreviewUrl}
                alt={attachmentName}
                sx={{
                  display: 'block',
                  width: '100%',
                  height: 140,
                  objectFit: 'cover',
                  opacity: extracting ? 0.7 : 1,
                }}
              />
              {extracting && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.35)',
                  }}
                >
                  <CircularProgress size={22} />
                </Box>
              )}
              {!extracting && (
                <IconButton
                  size="small"
                  aria-label="Remove attachment"
                  onClick={() => clearAttachment(true)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 26,
                    height: 26,
                    backgroundColor: 'rgba(11,31,58,0.72)',
                    color: '#fff',
                    '&:hover': { backgroundColor: 'rgba(11,31,58,0.9)' },
                  }}
                >
                  <Typography component="span" sx={{ fontSize: '0.95rem', lineHeight: 1 }}>
                    ×
                  </Typography>
                </IconButton>
              )}
              <Typography
                sx={{
                  px: 1,
                  py: 0.5,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: tokens.ink,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {extracting ? `Reading ${attachmentName}…` : attachmentName}
              </Typography>
            </Box>
          ) : (
            <Chip
              size="small"
              label={extracting ? `Reading ${attachmentName}…` : `Attached: ${attachmentName}`}
              onDelete={extracting ? undefined : () => clearAttachment(true)}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      )}

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
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleAttachFile}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach a PDF or image"
          disabled={busy || extracting}
          sx={{
            width: 38,
            height: 38,
            borderRadius: radii.circle,
            color: busy || extracting ? 'rgba(11,31,58,0.2)' : tokens.navy,
            border: '1px solid rgba(11,31,58,0.12)',
          }}
        >
          {extracting ? <CircularProgress size={18} /> : <AttachFileIcon sx={{ fontSize: 19 }} />}
        </IconButton>

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
