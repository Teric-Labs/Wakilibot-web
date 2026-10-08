import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { AccountIcon, SpokenIcon } from './icons';
import VoiceNoteBubble from './VoiceNoteBubble';
import WakilibotLogo from './WakilibotLogo';
import { tokens } from '../styles/theme';

/** Chat-style message bubble with voice note support. */
const MessageBubble = ({
  message,
  isUser,
  responseData = null,
  isError = false,
  isStreaming = false,
  isWelcome = false,
  autoSpeak = false,
  viaVoice = false,
  isVoiceReply = false,
  audioUrl = null,
  audioDuration = 0,
  replyAudioUrl = null,
  ttsError = false,
  language = 'en',
  onAutoPlayEnd = null,
}) => {
  // Determine if we should show a voice note bubble:
  // - User voice messages with captured audio
  const showUserVoiceNote = Boolean(isUser && viaVoice && audioUrl);
  // - Bot replies to voice queries:
  const isBotVoiceReply = !isUser && !isWelcome && !isError && Boolean(autoSpeak || viaVoice || isVoiceReply);
  // - Bot voice note ready (TTS audio URL available) - audio only, no text
  const showBotVoiceNote = isBotVoiceReply && Boolean(replyAudioUrl);
  // - Bot voice note preparing (streaming or TTS pending, not failed)
  const isBotVoiceLoading = isBotVoiceReply && !replyAudioUrl && !ttsError;
  // - Bot voice note failed (fallback)
  const isBotVoiceFailed = isBotVoiceReply && !replyAudioUrl && Boolean(ttsError);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        py: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1.75,
          width: '100%',
          maxWidth: 768,
          alignItems: 'flex-start',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        <Avatar
          sx={{
            width: 28,
            height: 28,
            mt: 0.25,
            flexShrink: 0,
            bgcolor: isUser ? tokens.navyMid : tokens.navy,
            color: '#fff',
            fontSize: 14,
          }}
        >
          {isUser ? (
            <AccountIcon size={16} />
          ) : (
            <WakilibotLogo size={16} showText={false} />
          )}
        </Avatar>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: isUser ? '85%' : '100%',
            ...(isUser && !showUserVoiceNote
              ? {
                  backgroundColor: '#F4F4F5',
                  borderRadius: '18px',
                  px: 2,
                  py: 1.25,
                }
              : {}),
          }}
        >
          {/* ─── User voice note bubble (audio only, WhatsApp style) ─── */}
          {showUserVoiceNote && (
            <VoiceNoteBubble
              audioUrl={audioUrl}
              duration={audioDuration}
              isUser={true}
              autoplay={false}
              transcript={null}
            />
          )}

          {/* ─── Bot voice note reply (Audio response ONLY, no text) ─── */}
          {showBotVoiceNote && (
            <Box sx={{ width: '100%' }}>
              <VoiceNoteBubble
                audioUrl={replyAudioUrl}
                duration={0}
                isUser={false}
                autoplay={true}
                transcript={null}
                onAutoPlayEnd={onAutoPlayEnd}
              />
            </Box>
          )}

          {/* ─── Bot voice reply preparing (simple natural statement, no card) ─── */}
          {isBotVoiceLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.5 }}>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: tokens.muted,
                  fontStyle: 'italic',
                  letterSpacing: '0.01em',
                  userSelect: 'none',
                }}
              >
                Thinking...
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: tokens.muted,
                      animation: 'dotPulse 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.15}s`,
                      '@keyframes dotPulse': {
                        '0%, 80%, 100%': { opacity: 0.25, transform: 'scale(0.8)' },
                        '40%': { opacity: 0.9, transform: 'scale(1.2)' },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* ─── Bot voice reply failed (TTS unavailable fallback) ─── */}
          {isBotVoiceFailed && (
            <Box>
              <Typography sx={{ fontSize: '0.74rem', color: tokens.muted, fontStyle: 'italic', mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SpokenIcon size={12} />
                Audio unavailable. Transcript:
              </Typography>
              <Typography
                component="div"
                sx={{
                  color: tokens.ink,
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  '& p': { m: 0 },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
              </Typography>
            </Box>
          )}

          {/* ─── Plain text (user typed, welcome, streaming, error) ─── */}
          {!showUserVoiceNote && !showBotVoiceNote && !isBotVoiceLoading && !isBotVoiceFailed && (
            <Typography
              component="div"
              sx={{
                color: isError ? tokens.danger : tokens.ink,
                fontSize: '0.95rem',
                fontWeight: 400,
                lineHeight: 1.7,
                letterSpacing: '0.01em',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                '& p': { m: 0 },
                '& ul, & ol': { m: 0, pl: '1.25rem' },
                '& li': { m: 0 },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  m: 0,
                  fontFamily: '"Source Sans 3", sans-serif',
                },
                '& strong': { fontWeight: 600, color: isUser ? 'inherit' : tokens.navy },
                '& a': {
                  color: tokens.navyMid,
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                },
                '& code': {
                  fontSize: '0.85em',
                  backgroundColor: 'rgba(11,31,58,0.06)',
                  borderRadius: '4px',
                  px: '4px',
                },
                '& table': { borderCollapse: 'collapse' },
                '& th, & td': { border: `1px solid ${tokens.line}`, px: 1, py: 0.25 },
              }}
            >
              {isUser ? (
                message
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
              )}
              {isStreaming && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: 2,
                    height: '1em',
                    ml: 0.4,
                    verticalAlign: 'text-bottom',
                    backgroundColor: tokens.navy,
                    animation: 'cursorBlink 1s step-end infinite',
                    '@keyframes cursorBlink': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0 },
                    },
                  }}
                />
              )}
            </Typography>
          )}

          {/* ─── User typed message via voice badge (no audio bubble fallback) ─── */}
          {isUser && viaVoice && !audioUrl && (
            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5, color: tokens.muted }}>
              <SpokenIcon />
              <Typography sx={{ fontSize: '0.68rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                Spoken
              </Typography>
            </Box>
          )}

          {/* ─── Response metadata (complaint ID, references) - only for text replies ─── */}
          {Boolean(responseData?.complaintId || (Array.isArray(responseData?.references) && responseData.references.length > 0)) && !isWelcome && !isUser && !isBotVoiceReply && (
            <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid #E5E7EB`, display: 'grid', gap: 1 }}>
              {responseData?.complaintId && (
                <Typography sx={{ fontSize: '0.78rem', color: tokens.muted, fontWeight: 600 }}>
                  Reference: {responseData.complaintId}
                </Typography>
              )}

              {Array.isArray(responseData?.references) && responseData.references.length > 0 && (
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: tokens.muted, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Sources
                  </Typography>
                  {responseData.references.map((reference, index) => {
                    const title = reference?.title || reference?.document_title || 'Source';
                    const href = reference?.url || reference?.link;
                    const excerpt = reference?.excerpt;
                    return (
                      <Box key={`${title}-${index}`} sx={{ display: 'grid', gap: 0.25 }}>
                        <Typography sx={{ fontSize: '0.76rem', color: href ? tokens.navy : tokens.muted, lineHeight: 1.5, fontWeight: 500 }}>
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                            >
                              {title}
                            </a>
                          ) : (
                            title
                          )}
                        </Typography>
                        {excerpt && (
                          <Typography sx={{ fontSize: '0.72rem', color: tokens.muted, fontStyle: 'italic', pl: 1, borderLeft: '2px solid #E5E7EB', lineHeight: 1.4 }}>
                            "{excerpt}"
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MessageBubble;
