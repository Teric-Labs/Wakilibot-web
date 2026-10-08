import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import VoiceModeOverlay from './VoiceModeOverlay';
import { TopicHeader, TopicPicker, TopicBrief } from './IntentSelector';
import Sidebar from './Sidebar';
import Archive from './Archive';
import Help from './Help';
import ConversationHistory from './ConversationHistory';
import TypingAnimation from './TypingAnimation';
import LanguageSettings from './LanguageSettings';
import AccountPanel from './AccountPanel';
import MethodologyBar from './MethodologyBar';
import StandardPanel from './StandardPanel';
import { menuPaperProps, menuItemSx } from './PanelCard';
import {
  ScrollToLatestIcon,
  OptionsIcon,
  ExportIcon,
  SignInIcon,
  SignOutIcon,
} from './icons';
import api from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { synthesizeToFile } from '../services/sparkTTS';
import { tokens } from '../styles/theme';
import { t as translateFn } from '../i18n/translations';

// The topic menu and its example prompts come from the agent's GET /intents catalog,
// so nothing here is hardcoded to a particular intent any more.

// Welcome text is now sourced from translations; keep a static fallback for the very first render
const WELCOME_TEXT_EN =
  "Karibu / Hello! I'm Wakilibot — the CTDRU assistant for banking, mobile money and credit disputes. Pick a topic to start, or describe what happened in your own words.";

const ChatInterface = ({ user, onLogout, onLogin, onSignup }) => {
  const isGuest = Boolean(user?.isGuest);
  const { getCurrentLanguageInfo, selectedLanguage, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [intents, setIntents] = useState([]);
  const [activeIntent, setActiveIntent] = useState(null);
  // The full menu can also be opened deliberately mid-conversation with "Change topic".
  const [browseTopics, setBrowseTopics] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [voiceModeResumeSignal, setVoiceModeResumeSignal] = useState(0);
  const chatContainerRef = useRef(null);
  // True for the turn that started from a recording, so the reply is read back out loud
  // without the user having to reach for the speaker button.
  const voiceTurnRef = useRef(false);

  // Load (and reload) the intent menu whenever the language changes so topic cards
  // always show in the user's chosen language. Falls back to the built-in translated copy
  // if the agent is unreachable, so the selector always renders.
  useEffect(() => {
    let cancelled = false;
    api
      .getIntents(selectedLanguage)
      .then(({ intents: catalog }) => {
        if (!cancelled) setIntents(catalog);
      })
      .catch(() => {
        if (!cancelled) setIntents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLanguage]);

  // Re-set welcome message whenever language changes so it shows in the correct language.
  useEffect(() => {
    setMessages((prev) => {
      // Only update if the first message is the welcome placeholder.
      if (prev.length === 0 || prev[0]?.isWelcome) {
        return [
          {
            id: 'welcome',
            text: translateFn(selectedLanguage, 'welcome', 'text') || WELCOME_TEXT_EN,
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
            isWelcome: true,
          },
          ...prev.slice(1),
        ];
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userId = user?.user_id || api.utils.getCurrentUserId();
        const response = await api.getUserConversations(userId, 50);
        setConversations(response.conversations || []);
      } catch {
        setConversations([]);
      }
    };
    loadConversations();
  }, [user?.user_id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isWaitingForResponse]);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNewMessage = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}_${Math.random()}`,
        ...message,
        timestamp: message.timestamp || new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  const handleStreamingMessage = useCallback(
    (chunk, isComplete, responseData) => {
      setIsWaitingForResponse(false);
      const fromVoiceTurn = voiceTurnRef.current === true;

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        const payload = isComplete
          ? {
              intent: responseData?.intent,
              taskStatus: responseData?.task_status,
              responseTime: responseData?.response_time,
              complaintId: responseData?.complaint_id,
              conversationId: responseData?.conversation_id,
            }
          : null;

        const mergedResponseData = isComplete
          ? {
              ...payload,
              references: responseData?.references || [],
            }
          : {
              ...last?.responseData,
              references: responseData?.references || last?.responseData?.references || [],
            };

        if (last?.isUser) {
          return [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              text: chunk,
              isUser: false,
              timestamp: new Date().toLocaleTimeString(),
              isStreaming: !isComplete,
              responseData: mergedResponseData,
              autoSpeak: fromVoiceTurn,
              viaVoice: fromVoiceTurn,
              isVoiceReply: fromVoiceTurn,
            },
          ];
        }

        if (last && !last.isUser && last.isStreaming) {
          return prev.map((msg, i) =>
            i === prev.length - 1
              ? {
                  ...msg,
                  text: chunk,
                  isStreaming: !isComplete,
                  responseData: mergedResponseData,
                  autoSpeak: msg.autoSpeak || fromVoiceTurn,
                  viaVoice: msg.viaVoice || fromVoiceTurn,
                  isVoiceReply: msg.isVoiceReply || fromVoiceTurn,
                }
              : msg
          );
        }

        return [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            text: chunk,
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
            isStreaming: !isComplete,
            responseData: mergedResponseData,
            autoSpeak: fromVoiceTurn,
            viaVoice: fromVoiceTurn,
            isVoiceReply: fromVoiceTurn,
          },
        ];
      });

      if (responseData?.conversation_id) {
        setConversationId(responseData.conversation_id);
        api.utils.setCurrentConversationId(responseData.conversation_id);
      }

      // Free chat keeps intent unset (or 'auto') so each turn can be answered freely.
      // Multi-step complaint/fraud/status state lives on the agent session — pinning
      // a detected topic here forced every later free-chat message into intake.
      if (isComplete && responseData?.intent) {
        setActiveIntent((current) => {
          if (current && current !== 'auto') return current;
          return current === 'auto' ? 'auto' : null;
        });
      }

      setIsStreaming(!isComplete);

      // Generate TTS audio for bot replies to voice queries (WhatsApp-style voice note)
      if (isComplete && fromVoiceTurn && chunk && chunk.trim()) {
        const lang = getCurrentLanguageInfo()?.code || 'en';
        
        const fetchAudio = async () => {
          try {
            return await synthesizeToFile(chunk, lang);
          } catch (err) {
            console.warn('[TTS] synthesizeToFile failed, attempting api.synthesizeSpeech proxy:', err);
            const fallbackResult = await api.synthesizeSpeech(chunk, lang);
            return fallbackResult.audioUrl;
          }
        };

        fetchAudio()
          .then((replyAudioUrl) => {
            setMessages((prev) => {
              const updated = [...prev];
              // Find the last bot message and attach the audio URL
              for (let i = updated.length - 1; i >= 0; i--) {
                if (!updated[i].isUser && (updated[i].autoSpeak || updated[i].isVoiceReply)) {
                  updated[i] = { ...updated[i], replyAudioUrl, isVoiceReply: true };
                  break;
                }
              }
              return updated;
            });
          })
          .catch((err) => {
            console.error('[TTS] Failed to generate audio response:', err);
            setMessages((prev) => {
              const updated = [...prev];
              for (let i = updated.length - 1; i >= 0; i--) {
                if (!updated[i].isUser && (updated[i].autoSpeak || updated[i].isVoiceReply)) {
                  updated[i] = { ...updated[i], ttsError: true };
                  break;
                }
              }
              return updated;
            });
          });
      }

      if (isComplete) {
        const userId = user?.user_id || api.utils.getCurrentUserId();
        api
          .getUserConversations(userId, 50)
          .then((response) => setConversations(response.conversations || []))
          .catch(() => {});
      }
    },
    [user?.user_id, getCurrentLanguageInfo]
  );

  const startNewConversation = useCallback(() => {
    api.utils.startNewConversation();
    setMessages([
      {
        id: 'welcome',
        text: translateFn(selectedLanguage, 'welcome', 'text') || WELCOME_TEXT_EN,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        isWelcome: true,
      },
    ]);
    setConversationId(null);
    setActiveIntent(null);
    setBrowseTopics(false);
    setIsStreaming(false);
    voiceTurnRef.current = false;
    setCurrentView('chat');
  }, [selectedLanguage]);

  // Voice mode's loop: resume listening once the bot's spoken reply has
  // actually finished playing (not just "arrived"), so the user never talks
  // over the assistant.
  const handleVoiceReplyEnded = useCallback(() => {
    if (voiceModeActive) setVoiceModeResumeSignal((n) => n + 1);
  }, [voiceModeActive]);

  const handleVoiceModeSend = useCallback(
    (text, audioMeta) => handleVoiceTranscript(text, activeIntent, audioMeta),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIntent, conversationId]
  );

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSidebarItemClick = (itemId) => {
    if (itemId === 'new-chat') {
      startNewConversation();
      return;
    }
    if (itemId === 'chat') {
      setCurrentView('chat');
      return;
    }
    setCurrentView(itemId);
  };

  // Deep link from the Help panel: show the chat with this topic already picked, so
  // there is one intake path (the agent's flow) rather than a parallel form.
  const openTopic = useCallback((topicId) => {
    setCurrentView('chat');
    setBrowseTopics(false);
    setActiveIntent(topicId);
  }, []);

  const handleSelectConversation = async (conversationData) => {
    const resumeId =
      typeof conversationData === 'string'
        ? conversationData
        : conversationData?.id || conversationData?.conversation_id || null;

    // Keep React state and sessionStorage on the same id so the next send
    // (prop or api.js fallback) continues the resumed thread on the agent.
    if (resumeId) {
      setConversationId(resumeId);
      api.utils.setCurrentConversationId(resumeId);
    }

    if (typeof conversationData === 'string') {
      setCurrentView('chat');
      return;
    }
    if (conversationData?.messages) {
      setCurrentView('chat');
      const formatted = conversationData.messages.map((msg) => ({
        id: msg.id || `msg_${Date.now()}_${Math.random()}`,
        text: msg.query || msg.message || msg.text || '',
        isUser: msg.role === 'user' || msg.type === 'user',
        // Stored as unix seconds by the agent, so it goes through the same normaliser the
        // History panel uses before it is shown as a clock time.
        timestamp: new Date(api.utils.toMillis(msg.timestamp) ?? Date.now()).toLocaleTimeString(),
        responseData: msg.response_data || null,
      }));
      setMessages(formatted);
    }
  };

  const handleExportConversation = () => {
    const dataStr = JSON.stringify(
      { messages, timestamp: new Date().toISOString(), user: user?.full_name },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wakilibot-conversation-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setAnchorEl(null);
  };

  // 'auto' is the menu's "no topic" control; the agent expects null for that.
  const handleSelectTopic = useCallback(
    (topicId) => {
      const next = !topicId || topicId === 'auto' ? null : topicId;
      // Choosing a topic opens its clean screen; dropping one goes back to the menu,
      // because a user who just cleared a topic wants to see the alternatives again.
      setActiveIntent(next);
      setBrowseTopics(next === null);
    },
    []
  );

  // Skipping the menu entirely: composer straight away, agent picks the topic per turn.
  // Use the 'auto' sentinel so pickerOpen closes (!activeIntent would keep the menu up
  // while the welcome message is still showing). The API treats 'auto' as no intent.
  const handleChatFreely = useCallback(() => {
    setActiveIntent('auto');
    setBrowseTopics(false);
  }, []);

  const sendSuggestion = async (text, intent = activeIntent, options = {}) => {
    if (!text) return;
    const {
      viaVoice = false,
      audioUrl: voiceAudioUrl,
      audioDuration: voiceAudioDuration,
      existingUserMessageId = null,
    } = options;
    if (isLoading || isStreaming) return;
    if (intent) setActiveIntent(intent);
    // Set before the reply starts arriving: the streaming handler reads this flag to
    // decide whether the answer should be spoken back without another click.
    voiceTurnRef.current = viaVoice;
    if (!existingUserMessageId) {
      handleNewMessage({ text, isUser: true, viaVoice, audioUrl: voiceAudioUrl, audioDuration: voiceAudioDuration });
    }
    setIsLoading(true);
    setIsStreaming(true);
    setIsWaitingForResponse(true);
    try {
      await api.sendMessageStream(
        text,
        conversationId,
        getCurrentLanguageInfo()?.code || 'en',
        (chunk, isComplete, data) => handleStreamingMessage(chunk, isComplete, data),
        intent
      );
    } catch {
      handleNewMessage({
        text: t('errors', 'cannotReach'),
        isUser: false,
        isError: true,
      });
      setIsWaitingForResponse(false);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
      setIsWaitingForResponse(false);
      setIsStreaming(false);
      voiceTurnRef.current = false;
    }
  };

  // Voice send flow (WhatsApp style): the audio bubble appears in chat IMMEDIATELY,
  // then the transcript resolves in the background before the query is sent to the agent.
  const handleVoiceTranscript = async (initialText, intent, audioMeta = {}) => {
    const { audioUrl, audioDuration, transcriptPromise } = audioMeta;

    // 1. Optimistically add the user's audio bubble to chat right away.
    const userMsgId = `msg_${Date.now()}_${Math.random()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        text: initialText || '',
        isUser: true,
        viaVoice: true,
        audioUrl,
        audioDuration,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    // 2. Await the transcript silently (it should already be resolved or nearly so).
    let text = (initialText || '').trim();
    if (!text && transcriptPromise) {
      try {
        text = ((await transcriptPromise) || '').trim();
      } catch (_) {
        text = '';
      }
    }

    // Update the visible bubble if the transcript arrived after the send.
    if (text && text !== initialText) {
      setMessages((prev) => prev.map((m) => (m.id === userMsgId ? { ...m, text } : m)));
    }

    if (!text) {
      // No speech was detected (or transcription failed) — the audio bubble stays in
      // place, but say so instead of leaving the user staring at a reply that never
      // comes. A known weak spot: the live ASR endpoint is still imperfect for local
      // languages, so this happens for real, not just on a dead network.
      handleNewMessage({
        text: t('errors', 'noSpeechDetected'),
        isUser: false,
        isError: true,
      });
      return;
    }

    // 3. Send the transcript to the agent for a reply (skip re-adding the user message).
    await sendSuggestion(text, intent ?? activeIntent, {
      viaVoice: true,
      audioUrl,
      audioDuration,
      existingUserMessageId: userMsgId,
    });
  };

  const showEmptySuggestions =
    messages.length <= 1 && messages[0]?.isWelcome && !isWaitingForResponse;
  // The menu screen has no message box at all; the input only appears once the user has
  // either chosen a topic or opted to chat freely ('auto' sentinel closes the menu).
  // browseTopics forces the menu back open even while free-chat is active.
  const pickerOpen = browseTopics || (!activeIntent && showEmptySuggestions);
  const conversationStarted = messages.length > 1;

  const goChat = () => setCurrentView('chat');

  // Catalog entry for the chosen topic, used by the header pinned above the chat.
  // Free-chat ('auto') has no topic brief — just the composer.
  const isFreeChat = activeIntent === 'auto';
  const activeTopic =
    activeIntent && !isFreeChat
      ? intents.find((topic) => topic.id === activeIntent) || null
      : null;
  const inputLocked = isLoading || isStreaming;

  // The menu is the first thing anyone sees, so it introduces the assistant in one line
  // and uses the caller's name when the session has one.
  const firstName = !isGuest ? (user?.full_name || '').trim().split(' ')[0] : '';
  const baseGreeting = t('welcome', 'text');
  const pickerGreeting = firstName
    ? `Karibu ${firstName} — ${baseGreeting}`
    : baseGreeting;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen((v) => !v)}
        onNewConversation={startNewConversation}
        onSelectConversation={handleSelectConversation}
        currentConversationId={conversationId}
        conversations={conversations}
        onItemClick={handleSidebarItemClick}
        user={user}
        isGuest={isGuest}
        onLogin={onLogin}
        onSignup={onSignup}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {currentView === 'chat' && (
          <>
            <Box
              sx={{
                px: 3,
                py: 1.75,
                borderBottom: `1px solid ${tokens.line}`,
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              {activeTopic ? (
                <TopicHeader
                  topic={activeTopic}
                  onClear={() => handleSelectTopic(null)}
                  disabled={inputLocked}
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25, minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: tokens.navy,
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: 600,
                      fontSize: '1rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {pickerOpen ? t('chat', 'chooseTopic') : t('chat', 'askWakili')}
                  </Typography>
                  <Typography
                    sx={{
                      color: tokens.muted,
                      fontSize: '0.8rem',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {pickerOpen ? t('chat', 'chooseTopicSubtitle') : t('chat', 'freeChat')}
                  </Typography>
                  {!pickerOpen && (
                    <Button
                      size="small"
                      onClick={() => setBrowseTopics(true)}
                      disabled={inputLocked}
                      sx={{
                        color: tokens.navyMid,
                        textTransform: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        px: 0.75,
                        py: 0.25,
                      }}
                    >
                      {t('chat', 'browseTopics')}
                    </Button>
                  )}
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography
                  sx={{
                    color: tokens.muted,
                    fontSize: '0.8rem',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {getCurrentLanguageInfo()?.flag} {getCurrentLanguageInfo()?.name || 'English'}
                </Typography>
                {user && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: isGuest ? tokens.sand : tokens.navyMid,
                        fontSize: '0.85rem',
                        color: isGuest ? tokens.navy : '#fff',
                      }}
                    >
                      {isGuest ? 'G' : user.full_name?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography
                      sx={{
                        color: tokens.navy,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      {isGuest ? t('chat', 'guest') : user.full_name}
                    </Typography>
                  </Box>
                )}
                {isGuest && onLogin && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={onLogin}
                    sx={{
                      display: { xs: 'none', sm: 'inline-flex' },
                      color: tokens.navy,
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                    }}
                  >
                    {t('chat', 'signIn')}
                  </Button>
                )}
                <IconButton
                  aria-label="Conversation options"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ color: tokens.muted }}
                >
                  <OptionsIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  slotProps={{ paper: menuPaperProps }}
                >
                  <MenuItem sx={menuItemSx} onClick={handleExportConversation}>
                    <ExportIcon size={15} />
                    {t('chat', 'exportConversation')}
                  </MenuItem>
                  {isGuest ? (
                    <MenuItem
                      sx={menuItemSx}
                      onClick={() => {
                        setAnchorEl(null);
                        onLogin?.();
                      }}
                    >
                      <SignInIcon size={15} />
                      {t('chat', 'signIn')}
                    </MenuItem>
                  ) : null}
                  <MenuItem
                    sx={menuItemSx}
                    onClick={() => {
                      setAnchorEl(null);
                      onLogout?.();
                    }}
                  >
                    <SignOutIcon size={15} />
                    {isGuest ? t('chat', 'endGuestSession') : t('chat', 'signOut')}
                  </MenuItem>
                </Menu>
              </Box>
            </Box>

            {isGuest && (
              <Box
                sx={{
                  px: 3,
                  py: 0.85,
                  background: tokens.paper,
                  borderBottom: `1px solid ${tokens.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Typography sx={{ color: tokens.muted, fontSize: '0.8rem' }}>
                  {t('chat', 'guestMode')}
                </Typography>
                {onSignup && (
                  <Button
                    size="small"
                    onClick={onSignup}
                    sx={{
                      color: tokens.navy,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.8rem',
                    }}
                  >
                    {t('chat', 'createAccount')}
                  </Button>
                )}
              </Box>
            )}

            <Box
              ref={chatContainerRef}
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: { xs: 2, md: 3 },
                py: 2,
                position: 'relative',
                // The menu gets the warm paper canvas the rest of the product uses; an
                // ongoing conversation stays on white so bubbles keep their contrast.
                backgroundColor: '#FFFFFF',
                backgroundImage: pickerOpen
                  ? 'radial-gradient(120% 80% at 50% 0%, rgba(247,244,239,0.9) 0%, rgba(255,255,255,0) 60%)'
                  : 'none',
              }}
            >
              <Box sx={{ maxWidth: 768, mx: 'auto' }}>
                {pickerOpen ? (
                  <>
                    <TopicPicker
                      intents={intents}
                      disabled={inputLocked}
                      greeting={pickerGreeting}
                      onSelectTopic={handleSelectTopic}
                      onChatFreely={handleChatFreely}
                    />
                    <MethodologyBar />
                  </>
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message.text}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                        responseData={message.responseData}
                        isError={message.isError}
                        isStreaming={message.isStreaming}
                        isWelcome={message.isWelcome}
                        autoSpeak={message.autoSpeak}
                        viaVoice={message.viaVoice}
                        isVoiceReply={message.isVoiceReply}
                        audioUrl={message.audioUrl}
                        audioDuration={message.audioDuration}
                        replyAudioUrl={message.replyAudioUrl}
                        ttsError={message.ttsError}
                        language={getCurrentLanguageInfo()?.code || 'en'}
                        onAutoPlayEnd={handleVoiceReplyEnded}
                      />
                    ))}

                    {isWaitingForResponse && <TypingAnimation />}

                    {!conversationStarted && activeTopic && (
                      <TopicBrief
                        topic={activeTopic}
                        disabled={inputLocked}
                        onUseExample={(example) => sendSuggestion(example, activeIntent)}
                        onChangeTopic={() => handleSelectTopic(null)}
                      />
                    )}
                  </>
                )}
              </Box>

              {showScrollButton && (
                <IconButton
                  aria-label="Scroll to latest message"
                  onClick={scrollToBottom}
                  sx={{
                    position: 'sticky',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#FFFFFF',
                    color: tokens.navy,
                    border: '1px solid rgba(11,31,58,0.12)',
                    boxShadow: '0 2px 8px rgba(11,31,58,0.08)',
                    '&:hover': { backgroundColor: tokens.paper },
                  }}
                >
                  <ScrollToLatestIcon />
                </IconButton>
              )}
            </Box>

            {!pickerOpen && (
              <Box
                sx={{
                  px: { xs: 2, md: 3 },
                  pt: 1.5,
                  pb: 2,
                  // A soft fade rather than a ruled line, so the composer reads as part of
                  // the conversation instead of a bar bolted under it.
                  background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 22%)',
                }}
              >
                <Box sx={{ maxWidth: 768, mx: 'auto' }}>
                  <MessageInput
                    onMessageReceived={handleNewMessage}
                    onStreamingMessage={handleStreamingMessage}
                    conversationId={conversationId}
                    onConversationIdChange={(id) => {
                      setConversationId(id);
                      api.utils.setCurrentConversationId(id);
                    }}
                    activeIntent={activeIntent}
                    activeTopicLabel={activeTopic?.label || null}
                    onSendTranscript={handleVoiceTranscript}
                    onStartVoiceMode={() => setVoiceModeActive(true)}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    isStreaming={isStreaming}
                    setIsStreaming={setIsStreaming}
                    isWaitingForResponse={isWaitingForResponse}
                    setIsWaitingForResponse={setIsWaitingForResponse}
                  />
                </Box>
              </Box>
            )}
          </>
        )}

        {voiceModeActive && (
          <VoiceModeOverlay
            onClose={() => setVoiceModeActive(false)}
            onSend={handleVoiceModeSend}
            language={getCurrentLanguageInfo()?.code || 'en'}
            isWaitingForResponse={isWaitingForResponse}
            isStreaming={isStreaming}
            latestMessage={messages[messages.length - 1] || null}
            resumeSignal={voiceModeResumeSignal}
          />
        )}

        {currentView === 'archive' && (
          <StandardPanel
            title={t('archive', 'title')}
            subtitle={t('sidebar', 'documents')}
            onBack={goChat}
          >
            <Archive />
          </StandardPanel>
        )}

        {currentView === 'help' && (
          <StandardPanel
            title={t('help', 'title')}
            subtitle={t('help', 'subtitle')}
            onBack={goChat}
          >
            <Help
              onFileComplaint={() => openTopic('submit_complaint')}
              onReportFraud={() => openTopic('fraud_alert')}
            />
          </StandardPanel>
        )}

        {currentView === 'conversations' && (
          <StandardPanel
            title={t('history', 'title')}
            subtitle={t('history', 'title')}
            onBack={goChat}
          >
            <ConversationHistory
              onSelectConversation={handleSelectConversation}
              currentConversationId={conversationId}
              userId={user?.user_id || api.utils.getCurrentUserId()}
            />
          </StandardPanel>
        )}

        {currentView === 'settings' && (
          <StandardPanel
            title={t('settings', 'title')}
            subtitle={t('languageSettings', 'description')}
            onBack={goChat}
          >
            <LanguageSettings />
          </StandardPanel>
        )}

        {currentView === 'account' && (
          <StandardPanel title={t('account', 'title')} subtitle="" onBack={goChat}>
            <AccountPanel
              user={user}
              isGuest={isGuest}
              onLogin={onLogin}
              onSignup={onSignup}
              onLogout={onLogout}
            />
          </StandardPanel>
        )}
      </Box>
    </Box>
  );
};

export default ChatInterface;
