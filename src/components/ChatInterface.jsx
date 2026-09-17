import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  useTheme, 
  IconButton, 
  Avatar, 
  Fade,
  Tooltip,
  AppBar,
  Toolbar,
  Chip,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Badge,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  FormControlLabel
} from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import SystemInfoDialog from './SystemInfoDialog';
import Sidebar from './Sidebar';
import Archive from './Archive';
import Help from './Help';
import ConversationHistory from './ConversationHistory';
import TypingAnimation from './TypingAnimation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import NewChatIcon from '@mui/icons-material/AddComment';
import HealthIcon from '@mui/icons-material/CheckCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import WakilibotLogo from './WakilibotLogo';
import VoiceRecorder from './VoiceRecorder';
import LanguageSettings from './LanguageSettings';
import LanguageTest from './LanguageTest';
import ReduxLanguageTest from './ReduxLanguageTest';
import api from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const ChatInterface = ({ user, onLogout }) => {
  const { getCurrentLanguageInfo, isInitialized } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const chatContainerRef = useRef(null);
  const theme = useTheme();

  // Welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: "Hello! I'm Wakilibot, your AI assistant for consumer protection services. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isWelcome: true,
      responseData: null
    };
    
    setMessages([welcomeMessage]);
    checkSystemHealth();
  }, []);

  // Debug: Log language initialization status
  useEffect(() => {
    console.log('🌍 [CHAT INTERFACE] Language initialized:', isInitialized);
    console.log('🌍 [CHAT INTERFACE] Current language:', getCurrentLanguageInfo().code);
    console.log('🌍 [CHAT INTERFACE] localStorage language:', localStorage.getItem('wakilibot_language'));
  }, [isInitialized, getCurrentLanguageInfo]);

  // Load conversations for sidebar count
  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Use user.user_id if available, otherwise use session user ID
        const userId = user?.user_id || api.utils.getCurrentUserId();
        console.log('Loading conversations for user:', userId);
        const response = await api.getUserConversations(userId, 50);
        setConversations(response.conversations || []);
        console.log('Loaded conversations:', response.conversations?.length || 0);
      } catch (error) {
        console.error('Error loading conversations for sidebar:', error);
        setConversations([]);
      }
    };

    loadConversations();
  }, [user?.user_id]);

  // Check system health
  const checkSystemHealth = async () => {
    try {
      const healthData = await api.getHealthStatus();
      setSystemStatus(healthData);
    } catch (error) {
      console.error('Error checking system health:', error);
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle scroll to show/hide scroll to bottom button
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    
    setShowScrollButton(isScrolledUp);
  }, []);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle new user message
  const handleNewMessage = useCallback((message) => {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      ...message,
      timestamp: message.timestamp || new Date().toLocaleTimeString()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  // Handle streaming response - FIXED TO PREVENT DUPLICATES
  const handleStreamingMessage = useCallback((chunk, isComplete, responseData) => {
    // Stop thinking animation as soon as any streaming response starts
    if (isWaitingForResponse) {
      setIsWaitingForResponse(false);
    }
    
    setMessages(prevMessages => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      
      // If the last message is from the user, create a new AI message
      if (lastMessage && lastMessage.isUser) {
        const newMessage = {
          id: `ai_${Date.now()}`,
          text: chunk,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          isStreaming: !isComplete,
          responseData: isComplete ? {
            intent: responseData.intent,
            taskStatus: responseData.task_status,
            responseTime: responseData.response_time,
            isCached: api.utils.isResponseCached(responseData),
            complaintId: responseData.complaint_id,
            agent: responseData.agent,
            version: responseData.performance?.version,
            conversationId: responseData.conversation_id
          } : null
        };
        
        return [...prevMessages, newMessage];
      }
      
      // If the last message is from AI and streaming, update it
      if (lastMessage && !lastMessage.isUser && lastMessage.isStreaming) {
        return prevMessages.map((msg, index) => 
          index === prevMessages.length - 1 
            ? { 
                ...msg, 
                text: chunk, 
                isStreaming: !isComplete,
                responseData: isComplete ? {
                  intent: responseData.intent,
                  taskStatus: responseData.task_status,
                  responseTime: responseData.response_time,
                  isCached: api.utils.isResponseCached(responseData),
                  complaintId: responseData.complaint_id,
                  agent: responseData.agent,
                  version: responseData.performance?.version,
                  conversationId: responseData.conversation_id
                } : msg.responseData
              }
            : msg
        );
      }
      
      // Fallback: create new message
      const newMessage = {
        id: `ai_${Date.now()}`,
        text: chunk,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        isStreaming: !isComplete,
        responseData: isComplete ? {
          intent: responseData.intent,
          taskStatus: responseData.task_status,
          responseTime: responseData.response_time,
          isCached: api.utils.isResponseCached(responseData),
          complaintId: responseData.complaint_id,
          agent: responseData.agent,
          version: responseData.performance?.version,
          conversationId: responseData.conversation_id
        } : null
      };
      
      return [...prevMessages, newMessage];
    });
    
    // Store conversation ID
    if (responseData?.conversation_id) {
      setConversationId(responseData.conversation_id);
    }
    
    // Update streaming state
    setIsStreaming(!isComplete);
    
    // Refresh conversation count when conversation is completed
    if (isComplete) {
      const userId = user?.user_id || api.utils.getCurrentUserId();
      api.getUserConversations(userId, 50)
        .then(response => setConversations(response.conversations || []))
        .catch(error => console.error('Error refreshing conversations:', error));
    }
  }, [user?.user_id, isWaitingForResponse]);

  const startNewConversation = useCallback(() => {
    api.utils.startNewConversation();
    const welcomeMessage = {
      id: 'welcome',
      text: "Hello! I'm Wakilibot, your AI assistant for consumer protection services. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isWelcome: true,
      responseData: null
    };
    
    setMessages([welcomeMessage]);
    setConversationId(null);
    setIsStreaming(false);
    
    // Refresh conversation count after starting new conversation
    const userId = user?.user_id || api.utils.getCurrentUserId();
    api.getUserConversations(userId, 50)
      .then(response => setConversations(response.conversations || []))
      .catch(error => console.error('Error refreshing conversations:', error));
  }, [user?.user_id]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Navigation handlers
  const handleSidebarItemClick = (itemId) => {
    if (itemId === 'conversations') {
      setCurrentView('conversations');
    } else if (itemId === 'archive') {
      setCurrentView('archive');
    } else if (itemId === 'help') {
      setCurrentView('help');
    } else if (itemId === 'settings') {
      setCurrentView('settings');
    } else if (itemId === 'language-test') {
      setCurrentView('language-test');
    } else if (itemId === 'redux-test') {
      setCurrentView('redux-test');
    } else if (itemId === 'account') {
      setCurrentView('account');
    } else if (itemId === 'new-chat') {
      startNewConversation();
      setCurrentView('chat');
    }
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
    
    // Refresh conversation count when returning from conversations page
    const userId = user?.user_id || api.utils.getCurrentUserId();
    api.getUserConversations(userId, 50)
      .then(response => setConversations(response.conversations || []))
      .catch(error => console.error('Error refreshing conversations:', error));
  };

  const handleSelectConversation = async (conversationData) => {
    try {
      // If it's just a conversation ID (legacy), handle it
      if (typeof conversationData === 'string') {
        setConversationId(conversationData);
        setCurrentView('chat');
        return;
      }

      // If it's a full conversation object with messages
      if (conversationData && conversationData.messages) {
        setConversationId(conversationData.id);
        setCurrentView('chat');
        
        // Convert conversation history to message format
        const formattedMessages = conversationData.messages.map(msg => ({
          id: msg.id || `msg_${Date.now()}_${Math.random()}`,
          text: msg.query || msg.message || msg.text || '',
          isUser: msg.role === 'user' || msg.type === 'user',
          timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          responseData: msg.response_data || null
        }));

        // Add AI responses if they exist
        const messagesWithResponses = [];
        formattedMessages.forEach((msg, index) => {
          messagesWithResponses.push(msg);
          // Look for corresponding AI response
          const aiResponse = conversationData.messages.find(m => 
            m.role === 'assistant' && m.timestamp > msg.timestamp
          );
          if (aiResponse) {
            messagesWithResponses.push({
              id: `ai_${Date.now()}_${Math.random()}`,
              text: aiResponse.response || aiResponse.message || aiResponse.text || '',
              isUser: false,
              timestamp: aiResponse.timestamp ? new Date(aiResponse.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
              responseData: aiResponse.response_data || null
            });
          }
        });

        setMessages(messagesWithResponses);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // Dropdown menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportConversation = () => {
    const conversationData = {
      messages: messages,
      timestamp: new Date().toISOString(),
      user: user?.full_name || 'Anonymous'
    };
    
    const dataStr = JSON.stringify(conversationData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wakilibot-conversation-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    handleMenuClose();
  };


  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden'
      }}
    >
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(!sidebarOpen)}
        onNewConversation={startNewConversation}
        onSelectConversation={handleSelectConversation}
        currentConversationId={conversationId}
        conversations={conversations}
        onItemClick={handleSidebarItemClick}
        userId={user?.user_id || api.utils.getCurrentUserId()}
      />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000000',
          overflow: 'hidden'
        }}
      >
        {currentView === 'chat' && (
          <>
            {/* Wakilibot Branding - No Navbar */}
            <Box
              sx={{
                py: 2,
                px: 3,
                backgroundColor: '#000000',
                borderBottom: '1px solid #333333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#ffffff',
                    fontSize: '20px',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Wakilibot
                </Typography>
                <Chip
                  label={`${getCurrentLanguageInfo().flag} ${getCurrentLanguageInfo().name}`}
                  size="small"
                  sx={{
                    backgroundColor: '#333333',
                    color: '#cccccc',
                    fontWeight: 500,
                    fontSize: '12px'
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* User Info */}
                {user && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ 
                      width: 36, 
                      height: 36, 
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }}>
                      {user.full_name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        {user.full_name}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#888888',
                        fontSize: '11px'
                      }}>
                        Online
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {/* World-Class Dropdown Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Main Dropdown Menu */}
                  <Tooltip title="More Options">
                    <IconButton
                      onClick={handleMenuOpen}
                      size="small"
                      sx={{
                        color: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>

                  {/* World-Class Dropdown Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        backgroundColor: '#111111',
                        border: '1px solid #333333',
                        borderRadius: 3,
                        minWidth: 280,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(20px)',
                        mt: 1
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    {/* System Status Section */}
                    <Box sx={{ p: 2, borderBottom: '1px solid #333333' }}>
                      <Typography variant="subtitle2" sx={{ 
                        color: '#888888', 
                        fontWeight: 600, 
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        letterSpacing: '0.5px',
                        mb: 1
                      }}>
                        System Status
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          icon={<HealthIcon />}
                          label={systemStatus?.status === 'healthy' ? 'Online' : 'Offline'}
                          size="small"
                          sx={{
                            backgroundColor: systemStatus?.status === 'healthy' ? '#4caf50' : '#f44336',
                            color: '#ffffff',
                            fontWeight: 600
                          }}
                        />
                        <Chip
                          icon={<SpeedIcon />}
                          label={`v${systemStatus?.version || '8.3.0'}`}
                          size="small"
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc'
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Working Actions */}
                    <MenuItem onClick={() => { setSidebarOpen(!sidebarOpen); handleMenuClose(); }} sx={{ color: '#ffffff', py: 1.5 }}>
                      <ListItemIcon sx={{ color: '#cccccc' }}>
                        <MenuIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"} 
                        secondary="Toggle navigation panel"
                        secondaryTypographyProps={{ color: '#888888', fontSize: '12px' }}
                      />
                    </MenuItem>

                    <MenuItem onClick={() => { startNewConversation(); handleMenuClose(); }} sx={{ color: '#ffffff', py: 1.5 }}>
                      <ListItemIcon sx={{ color: '#cccccc' }}>
                        <NewChatIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="New Conversation" 
                        secondary="Start fresh chat"
                        secondaryTypographyProps={{ color: '#888888', fontSize: '12px' }}
                      />
                    </MenuItem>

                    <Divider sx={{ borderColor: '#333333', my: 1 }} />

                    {/* Export Functionality */}
                    <MenuItem onClick={handleExportConversation} sx={{ color: '#ffffff', py: 1.5 }}>
                      <ListItemIcon sx={{ color: '#cccccc' }}>
                        <DownloadIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Export Chat" 
                        secondary="Download conversation"
                        secondaryTypographyProps={{ color: '#888888', fontSize: '12px' }}
                      />
                    </MenuItem>

                    <Divider sx={{ borderColor: '#333333', my: 1 }} />

                    {/* System Information */}
                    <MenuItem onClick={() => { setShowSystemInfo(true); handleMenuClose(); }} sx={{ color: '#ffffff', py: 1.5 }}>
                      <ListItemIcon sx={{ color: '#cccccc' }}>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="System Info" 
                        secondary="View detailed status"
                        secondaryTypographyProps={{ color: '#888888', fontSize: '12px' }}
                      />
                    </MenuItem>

                    <Divider sx={{ borderColor: '#333333', my: 1 }} />

                    {/* Logout */}
                    {onLogout && (
                      <MenuItem 
                        onClick={() => { onLogout(); handleMenuClose(); }} 
                        sx={{ 
                          color: '#f44336', 
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: '#f44336' }}>
                          <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Sign Out" 
                          secondary="End your session"
                          secondaryTypographyProps={{ color: '#888888', fontSize: '12px' }}
                        />
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              </Box>
            </Box>

            {/* Chat Messages Area - Smaller and Scrollable */}
            <Box
              ref={chatContainerRef}
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 2,
                py: 1,
                backgroundColor: '#000000',
                maxHeight: 'calc(100vh - 200px)', // Limit height for better scrolling
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#111111',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#333333',
                  borderRadius: '2px',
                },
              }}
            >
              {messages.length > 0 ? (
                <Box sx={{ maxWidth: '768px', mx: 'auto' }}>
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id || index}
                      message={message.text}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                      responseData={message.responseData}
                      isError={message.isError}
                      isStreaming={message.isStreaming}
                      isWelcome={message.isWelcome}
                    />
                  ))}
                  
                  {/* Unified Animation - Thinking or Typing */}
                  <TypingAnimation 
                    isVisible={isWaitingForResponse || isStreaming} 
                    isThinking={isWaitingForResponse}
                  />
                  
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    flexDirection: 'column',
                    gap: 3,
                    maxWidth: '768px',
                    mx: 'auto'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 80,
                      height: 80,
                      backgroundColor: '#ffffff',
                      color: '#000000'
                    }}
                  >
                    <WakilibotLogo size={40} showText={false} variant="icon" />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', color: '#ffffff' }}>
                    Wakilibot
                  </Typography>
                  <Typography variant="body1" color="#cccccc" align="center" sx={{ maxWidth: 400 }}>
                    How can I help you today?
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Scroll to Bottom Button */}
            <Fade in={showScrollButton}>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 100,
                  right: 24,
                  zIndex: 2
                }}
              >
                <Tooltip title="Scroll to bottom">
                  <IconButton
                    onClick={scrollToBottom}
                    sx={{
                      backgroundColor: '#111111',
                      border: '1px solid #333333',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#222222',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Fade>
            
            {/* Message Input Area - Dark Theme */}
            <Box 
              sx={{ 
                px: 3,
                py: 2,
                backgroundColor: '#000000',
                borderTop: '1px solid #333333',
              }}
            >
              <Box sx={{ maxWidth: '768px', mx: 'auto' }}>
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
          <Archive onBack={handleBackToChat} />
        )}

        {currentView === 'help' && (
          <Help onBack={handleBackToChat} />
        )}

        {currentView === 'conversations' && (
          <Box
            sx={{
              height: '100vh',
              backgroundColor: '#000000',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Back Button */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #333333',
                backgroundColor: '#111111'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Conversations
                </Typography>
                <IconButton
                  onClick={handleBackToChat}
                  sx={{
                    color: '#cccccc',
                    '&:hover': { backgroundColor: '#333333' }
                  }}
                >
                  ← Back
                </IconButton>
              </Box>
            </Box>

            {/* Conversation History Content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <ConversationHistory 
                onSelectConversation={handleSelectConversation}
                currentConversationId={conversationId}
                userId={user?.user_id || api.utils.getCurrentUserId()}
              />
            </Box>
          </Box>
        )}

        {currentView === 'settings' && (
          <Box
            sx={{
              height: '100vh',
              backgroundColor: '#000000',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Back Button */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #333333',
                backgroundColor: '#111111'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Settings
                </Typography>
                <IconButton
                  onClick={handleBackToChat}
                  sx={{
                    color: '#cccccc',
                    '&:hover': { backgroundColor: '#333333' }
                  }}
                >
                  ← Back
                </IconButton>
              </Box>
            </Box>

            {/* Settings Content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <LanguageSettings 
                onShowLanguageTest={() => setCurrentView('language-test')} 
                onShowReduxTest={() => setCurrentView('redux-test')}
              />
            </Box>
          </Box>
        )}

        {currentView === 'language-test' && (
          <Box
            sx={{
              height: '100vh',
              backgroundColor: '#000000',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Back Button */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #333333',
                backgroundColor: '#111111'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Language Test
                </Typography>
                <IconButton
                  onClick={handleBackToChat}
                  sx={{
                    color: '#cccccc',
                    '&:hover': { backgroundColor: '#333333' }
                  }}
                >
                  ← Back
                </IconButton>
              </Box>
            </Box>

            {/* Language Test Content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <LanguageTest />
            </Box>
          </Box>
        )}

        {currentView === 'redux-test' && (
          <Box
            sx={{
              height: '100vh',
              backgroundColor: '#000000',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Back Button */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #333333',
                backgroundColor: '#111111'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Redux Language Test
                </Typography>
                <IconButton
                  onClick={handleBackToChat}
                  sx={{
                    color: '#cccccc',
                    '&:hover': { backgroundColor: '#333333' }
                  }}
                >
                  ← Back
                </IconButton>
              </Box>
            </Box>

            {/* Redux Test Content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <ReduxLanguageTest />
            </Box>
          </Box>
        )}

        {currentView === 'account' && (
          <Box
            sx={{
              height: '100vh',
              backgroundColor: '#000000',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Back Button */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #333333',
                backgroundColor: '#111111'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Account
                </Typography>
                <IconButton
                  onClick={handleBackToChat}
                  sx={{
                    color: '#cccccc',
                    '&:hover': { backgroundColor: '#333333' }
                  }}
                >
                  ← Back
                </IconButton>
              </Box>
            </Box>

            {/* Account Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
              <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                Account Information
              </Typography>
              <Typography variant="body1" color="#cccccc">
                Account management features coming soon...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* System Info Dialog */}
      <SystemInfoDialog
        open={showSystemInfo}
        onClose={() => setShowSystemInfo(false)}
      />
    </Box>
  );
};

export default ChatInterface;