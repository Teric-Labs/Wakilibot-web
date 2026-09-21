import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Sidebar from './Sidebar';
import Archive from './Archive';
import Help from './Help';
import ConversationHistory from './ConversationHistory';
import TypingAnimation from './TypingAnimation';
import LanguageSettings from './LanguageSettings';
import AccountPanel from './AccountPanel';
import ComplaintForm from './ComplaintForm';
import MethodologyBar from './MethodologyBar';
import StandardPanel from './StandardPanel';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { tokens } from '../styles/theme';

const SUGGESTIONS = [
  'Help me file a CTDRU complaint about a wrong MoMo transfer',
  'I think someone stole money from my wallet—how do I report fraud?',
  'Unauthorized bank charge appeared on my statement—what should I do?',
];

const WELCOME_TEXT =
  "Karibu / Hello! I'm Wakilibot—your CTDRU legal assistant for Uganda. We'll work through a standard intake method: identify the issue, gather facts, collect evidence, review your options, then file or escalate. You can start as a guest; sign in later to save your case. How can I help today?";

const FRAUD_PROMPT =
  'I need to report fraud or a scam involving my mobile money or bank account. Please help me capture what happened and the urgent next steps.';

const ChatInterface = ({ user, onLogout, onLogin, onSignup }) => {
  const isGuest = Boolean(user?.isGuest);
  const { getCurrentLanguageInfo } = useLanguage();
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
  const chatContainerRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: WELCOME_TEXT,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        isWelcome: true,
      },
    ]);
  }, []);

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
      if (isWaitingForResponse) setIsWaitingForResponse(false);

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

        if (last?.isUser) {
          return [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              text: chunk,
              isUser: false,
              timestamp: new Date().toLocaleTimeString(),
              isStreaming: !isComplete,
              responseData: payload,
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
                  responseData: isComplete ? payload : msg.responseData,
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
            responseData: payload,
          },
        ];
      });

      if (responseData?.conversation_id) {
        setConversationId(responseData.conversation_id);
      }
      setIsStreaming(!isComplete);

      if (isComplete) {
        const userId = user?.user_id || api.utils.getCurrentUserId();
        api
          .getUserConversations(userId, 50)
          .then((response) => setConversations(response.conversations || []))
          .catch(() => {});
      }
    },
    [user?.user_id, isWaitingForResponse]
  );

  const startNewConversation = useCallback(() => {
    api.utils.startNewConversation();
    setMessages([
      {
        id: 'welcome',
        text: WELCOME_TEXT,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        isWelcome: true,
      },
    ]);
    setConversationId(null);
    setIsStreaming(false);
    setCurrentView('chat');
  }, []);

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
    if (itemId === 'complaint') {
      setCurrentView('complaint');
      return;
    }
    if (itemId === 'fraud') {
      setCurrentView('fraud');
      return;
    }
    setCurrentView(itemId);
  };

  const handleSelectConversation = async (conversationData) => {
    if (typeof conversationData === 'string') {
      setConversationId(conversationData);
      setCurrentView('chat');
      return;
    }
    if (conversationData?.messages) {
      setConversationId(conversationData.id);
      setCurrentView('chat');
      const formatted = conversationData.messages.map((msg) => ({
        id: msg.id || `msg_${Date.now()}_${Math.random()}`,
        text: msg.query || msg.message || msg.text || '',
        isUser: msg.role === 'user' || msg.type === 'user',
        timestamp: msg.timestamp
          ? new Date(msg.timestamp).toLocaleTimeString()
          : new Date().toLocaleTimeString(),
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

  const sendSuggestion = async (text) => {
    if (isLoading || isStreaming) return;
    handleNewMessage({ text, isUser: true });
    setIsLoading(true);
    setIsStreaming(true);
    setIsWaitingForResponse(true);
    try {
      await api.sendMessageStream(
        text,
        conversationId,
        getCurrentLanguageInfo()?.code || 'en',
        (chunk, isComplete, data) => handleStreamingMessage(chunk, isComplete, data)
      );
    } catch {
      handleNewMessage({
        text: 'Sorry, I could not reach the assistant. Please try again.',
        isUser: false,
        isError: true,
      });
      setIsWaitingForResponse(false);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  const showEmptySuggestions =
    messages.length <= 1 && messages[0]?.isWelcome && !isWaitingForResponse;

  const goChat = () => setCurrentView('chat');

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
                borderBottom: '1px solid rgba(11,31,58,0.08)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  color: tokens.muted,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {getCurrentLanguageInfo()?.name || 'English'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                      {isGuest ? 'Guest' : user.full_name}
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
                    Sign in
                  </Button>
                )}
                <IconButton
                  aria-label="Conversation options"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ color: tokens.muted }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={handleExportConversation}>
                    <ListItemIcon>
                      <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export conversation</ListItemText>
                  </MenuItem>
                  {isGuest ? (
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        onLogin?.();
                      }}
                    >
                      <ListItemIcon>
                        <LoginIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Sign in</ListItemText>
                    </MenuItem>
                  ) : null}
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      onLogout?.();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{isGuest ? 'End guest session' : 'Sign out'}</ListItemText>
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
                  borderBottom: '1px solid rgba(11,31,58,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Typography sx={{ color: tokens.muted, fontSize: '0.8rem' }}>
                  Guest mode — guidance is informational, not legal advice.
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
                    Create account
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
                backgroundColor: '#FFFFFF',
              }}
            >
              <Box sx={{ maxWidth: 768, mx: 'auto' }}>
                {showEmptySuggestions && <MethodologyBar />}
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
                  />
                ))}

                {isWaitingForResponse && <TypingAnimation />}

                {showEmptySuggestions && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mt: 2,
                      maxWidth: 560,
                    }}
                  >
                    {SUGGESTIONS.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outlined"
                        onClick={() => sendSuggestion(prompt)}
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          borderColor: 'rgba(11,31,58,0.14)',
                          color: tokens.navy,
                          borderRadius: 2,
                          px: 2,
                          py: 1.25,
                          fontWeight: 400,
                          fontSize: '0.88rem',
                          lineHeight: 1.45,
                          textTransform: 'none',
                          backgroundColor: '#FFFFFF',
                          '&:hover': {
                            borderColor: tokens.navyMid,
                            backgroundColor: tokens.paper,
                          },
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </Box>
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
                  <ArrowDownwardIcon />
                </IconButton>
              )}
            </Box>

            <Box
              sx={{
                borderTop: '1px solid rgba(11,31,58,0.08)',
                backgroundColor: '#FFFFFF',
                px: { xs: 2, md: 3 },
                py: 2,
              }}
            >
              <Box sx={{ maxWidth: 768, mx: 'auto' }}>
                <MessageInput
                  onMessageReceived={handleNewMessage}
                  onStreamingMessage={handleStreamingMessage}
                  conversationId={conversationId}
                  onStartNewConversation={startNewConversation}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  isStreaming={isStreaming}
                  setIsStreaming={setIsStreaming}
                  isWaitingForResponse={isWaitingForResponse}
                  setIsWaitingForResponse={setIsWaitingForResponse}
                />
              </Box>
            </Box>
          </>
        )}

        {currentView === 'archive' && (
          <StandardPanel title="Documents" subtitle="Guides and reference materials" onBack={goChat}>
            <Archive />
          </StandardPanel>
        )}

        {currentView === 'help' && (
          <StandardPanel title="Help" subtitle="How to use Wakilibot" onBack={goChat}>
            <Help
              onFileComplaint={() => setCurrentView('complaint')}
              onReportFraud={() => setCurrentView('fraud')}
            />
          </StandardPanel>
        )}

        {currentView === 'complaint' && (
          <StandardPanel
            title="File a complaint"
            subtitle="Capture the facts for a CTDRU case"
            onBack={goChat}
            maxWidth={1180}
          >
            <ComplaintForm onBack={goChat} />
          </StandardPanel>
        )}

        {currentView === 'fraud' && (
          <StandardPanel
            title="Report fraud"
            subtitle="Urgent intake for scams and unauthorized activity"
            onBack={goChat}
            maxWidth={1180}
          >
            <ComplaintForm
              onBack={goChat}
              initialComplaintType="mobile_money"
              mode="fraud"
            />
          </StandardPanel>
        )}

        {currentView === 'conversations' && (
          <StandardPanel title="History" subtitle="Past conversations" onBack={goChat}>
            <ConversationHistory
              onSelectConversation={handleSelectConversation}
              currentConversationId={conversationId}
              userId={user?.user_id || api.utils.getCurrentUserId()}
            />
          </StandardPanel>
        )}

        {currentView === 'settings' && (
          <StandardPanel title="Settings" subtitle="Language preference" onBack={goChat}>
            <LanguageSettings />
          </StandardPanel>
        )}

        {currentView === 'account' && (
          <StandardPanel title="Account" subtitle="Profile and access" onBack={goChat}>
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
