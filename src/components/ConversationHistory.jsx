import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Skeleton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Avatar,
  Badge,
  Fade,
  Slide,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Container,
  LinearProgress,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  Message as MessageIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Archive as ArchiveIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Label as LabelIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  Support as SupportIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import api from '../services/api';

const ConversationHistory = ({ 
  onSelectConversation, 
  currentConversationId,
  userId = null 
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntent, setFilterIntent] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [expandedConversation, setExpandedConversation] = useState(null);
  const [favoriteConversations, setFavoriteConversations] = useState(new Set());

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getUserConversations(userId, 100);
      setConversations(response.conversations || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = async (conversation) => {
    try {
      // Load the conversation history
      const historyResponse = await api.getConversationHistory(conversation.conversation_id);
      
      // Call the parent callback with conversation data
      onSelectConversation({
        id: conversation.conversation_id,
        title: conversation.title || 'Untitled Conversation',
        messages: historyResponse.history || [],
        timestamp: conversation.timestamp,
        intent: conversation.intent
      });
    } catch (err) {
      console.error('Error loading conversation history:', err);
      setError('Failed to load conversation');
    }
  };

  const handleMenuClick = (event, conversation) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConversation(null);
  };

  const handleRenameConversation = () => {
    // TODO: Implement rename functionality
    console.log('Rename conversation:', selectedConversation);
    handleMenuClose();
  };

  const handleDeleteConversation = () => {
    // TODO: Implement delete functionality
    console.log('Delete conversation:', selectedConversation);
    handleMenuClose();
  };

  const handleToggleFavorite = (conversationId) => {
    setFavoriteConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 24 * 7) {
        return `${Math.floor(diffInHours / 24)}d ago`;
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return '';
    }
  };

  const getIntentColor = (intent) => {
    const intentColors = {
      'greeting': '#4caf50',
      'submit_complaint': '#f44336',
      'check_status': '#2196f3',
      'fraud_reporting': '#ff9800',
      'fraud_alert': '#e91e63',
      'general_inquiry': '#9c27b0',
      'contact_information': '#607d8b',
      'ctdru_services': '#795548',
      'consumer_rights': '#009688'
    };
    return intentColors[intent] || '#666666';
  };

  const getIntentLabel = (intent) => {
    const intentLabels = {
      'greeting': 'Greeting',
      'submit_complaint': 'Complaint',
      'check_status': 'Status Check',
      'fraud_reporting': 'Fraud Report',
      'fraud_alert': 'Fraud Alert',
      'general_inquiry': 'Inquiry',
      'contact_information': 'Contact Info',
      'ctdru_services': 'Services',
      'consumer_rights': 'Consumer Rights'
    };
    return intentLabels[intent] || intent;
  };

  const getIntentIcon = (intent) => {
    const intentIcons = {
      'greeting': <PersonIcon />,
      'submit_complaint': <GavelIcon />,
      'check_status': <CheckCircleIcon />,
      'fraud_reporting': <SecurityIcon />,
      'fraud_alert': <WarningIcon />,
      'general_inquiry': <SupportIcon />,
      'contact_information': <BusinessIcon />,
      'ctdru_services': <BusinessIcon />,
      'consumer_rights': <GavelIcon />
    };
    return intentIcons[intent] || <ChatIcon />;
  };

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter(conv => {
      const matchesSearch = !searchTerm || 
        (conv.title && conv.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conv.query && conv.query.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterIntent === 'all' || conv.intent === filterIntent;
      
      return matchesSearch && matchesFilter;
    });

    // Sort conversations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'favorites':
          const aFav = favoriteConversations.has(a.conversation_id);
          const bFav = favoriteConversations.has(b.conversation_id);
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'intent':
          return (a.intent || '').localeCompare(b.intent || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [conversations, searchTerm, filterIntent, sortBy, favoriteConversations]);

  const intentOptions = [
    { value: 'all', label: 'All Intents', count: conversations.length },
    { value: 'greeting', label: 'Greeting', count: conversations.filter(c => c.intent === 'greeting').length },
    { value: 'submit_complaint', label: 'Complaint', count: conversations.filter(c => c.intent === 'submit_complaint').length },
    { value: 'check_status', label: 'Status Check', count: conversations.filter(c => c.intent === 'check_status').length },
    { value: 'fraud_reporting', label: 'Fraud Report', count: conversations.filter(c => c.intent === 'fraud_reporting').length },
    { value: 'general_inquiry', label: 'Inquiry', count: conversations.filter(c => c.intent === 'general_inquiry').length },
    { value: 'consumer_rights', label: 'Consumer Rights', count: conversations.filter(c => c.intent === 'consumer_rights').length }
  ];

  if (loading && conversations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ backgroundColor: '#333333' }} />
          <Skeleton variant="text" width={300} height={20} sx={{ backgroundColor: '#333333', mt: 1 }} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, backgroundColor: '#333333' }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: '#f44336',
            borderRadius: 3
          }}
          action={
            <Button color="inherit" onClick={loadConversations} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Conversation History
            </Typography>
            <Typography variant="body1" sx={{ color: '#cccccc' }}>
              {conversations.length} conversations • {filteredConversations.length} filtered
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh conversations">
              <IconButton 
                onClick={loadConversations}
                sx={{ 
                  color: '#cccccc',
                  backgroundColor: '#333333',
                  '&:hover': { 
                    backgroundColor: '#444444',
                    color: '#ffffff'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Enhanced Search and Filters */}
        <Paper sx={{ 
          p: 3, 
          backgroundColor: '#111111', 
          border: '1px solid #333333',
          borderRadius: 3
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#888888' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#222222',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#444444',
                    },
                    '&:hover fieldset': {
                      borderColor: '#666666',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffffff',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff',
                    '&::placeholder': {
                      color: '#888888',
                      opacity: 1
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#888888' }}>Filter by Intent</InputLabel>
                <Select
                  value={filterIntent}
                  onChange={(e) => setFilterIntent(e.target.value)}
                  label="Filter by Intent"
                  sx={{
                    backgroundColor: '#222222',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#444444',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#666666',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff',
                    },
                    '& .MuiSelect-icon': {
                      color: '#888888',
                    }
                  }}
                >
                  {intentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.value !== 'all' && getIntentIcon(option.value)}
                          {option.label}
                        </Box>
                        <Chip 
                          label={option.count} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#333333', 
                            color: '#cccccc',
                            fontSize: '10px',
                            height: 20
                          }} 
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#888888' }}>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                  sx={{
                    backgroundColor: '#222222',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#444444',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#666666',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff',
                    },
                    '& .MuiSelect-icon': {
                      color: '#888888',
                    }
                  }}
                >
                  <MenuItem value="recent">Most Recent</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="favorites">Favorites First</MenuItem>
                  <MenuItem value="intent">By Intent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Conversations Grid */}
      {filteredConversations.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: '#111111',
          borderRadius: 3,
          border: '1px solid #333333'
        }}>
          <SmartToyIcon sx={{ fontSize: 64, color: '#666666', mb: 3 }} />
          <Typography variant="h5" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
            {searchTerm || filterIntent !== 'all' ? 'No conversations found' : 'No conversations yet'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#888888', mb: 3 }}>
            {searchTerm || filterIntent !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Start a new conversation to see it here'
            }
          </Typography>
          {(searchTerm || filterIntent !== 'all') && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setFilterIntent('all');
              }}
              sx={{
                borderColor: '#444444',
                color: '#cccccc',
                '&:hover': {
                  borderColor: '#666666',
                  backgroundColor: '#333333'
                }
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredConversations.map((conversation, index) => (
            <Grid item xs={12} md={6} lg={4} key={conversation.conversation_id}>
              <Fade in timeout={300 + (index * 100)}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                    border: '1px solid #333333',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: getIntentColor(conversation.intent),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${getIntentColor(conversation.intent)}20`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(135deg, ${getIntentColor(conversation.intent)} 0%, ${getIntentColor(conversation.intent)}CC 100%)`,
                    }
                  }}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                        <Avatar
                          sx={{
                            backgroundColor: getIntentColor(conversation.intent),
                            width: 40,
                            height: 40,
                            background: `linear-gradient(135deg, ${getIntentColor(conversation.intent)} 0%, ${getIntentColor(conversation.intent)}CC 100%)`,
                          }}
                        >
                          {getIntentIcon(conversation.intent)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#ffffff',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {conversation.title || 'Untitled Conversation'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon sx={{ fontSize: 14, color: '#888888' }} />
                            <Typography variant="caption" sx={{ color: '#888888' }}>
                              {formatTimestamp(conversation.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(conversation.conversation_id);
                          }}
                          sx={{
                            color: favoriteConversations.has(conversation.conversation_id) ? '#ffd700' : '#888888',
                            '&:hover': {
                              backgroundColor: '#333333',
                              color: '#ffd700'
                            }
                          }}
                        >
                          {favoriteConversations.has(conversation.conversation_id) ? 
                            <StarIcon sx={{ fontSize: 18 }} /> : 
                            <StarBorderIcon sx={{ fontSize: 18 }} />
                          }
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, conversation)}
                          sx={{
                            color: '#888888',
                            '&:hover': {
                              backgroundColor: '#333333',
                              color: '#ffffff'
                            }
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Preview */}
                    <Box sx={{ mb: 2, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#cccccc',
                          fontSize: '13px',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1.5
                        }}
                      >
                        {conversation.query || 'No preview available'}
                      </Typography>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip
                        label={getIntentLabel(conversation.intent)}
                        size="small"
                        sx={{
                          backgroundColor: getIntentColor(conversation.intent),
                          color: '#ffffff',
                          fontWeight: 500,
                          fontSize: '11px',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1.5
                          }
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#888888', fontSize: '11px' }}>
                          {conversation.conversation_id?.slice(-6) || 'Unknown'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Enhanced Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#222222',
            border: '1px solid #444444',
            color: '#ffffff',
            borderRadius: 2,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={handleRenameConversation} sx={{ color: '#ffffff' }}>
          <ListItemIcon sx={{ color: '#cccccc' }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Rename Conversation
        </MenuItem>
        <MenuItem onClick={() => handleToggleFavorite(selectedConversation?.conversation_id)} sx={{ color: '#ffffff' }}>
          <ListItemIcon sx={{ color: '#cccccc' }}>
            {favoriteConversations.has(selectedConversation?.conversation_id) ? 
              <StarIcon fontSize="small" /> : 
              <StarBorderIcon fontSize="small" />
            }
          </ListItemIcon>
          {favoriteConversations.has(selectedConversation?.conversation_id) ? 'Remove from Favorites' : 'Add to Favorites'}
        </MenuItem>
        <MenuItem sx={{ color: '#ffffff' }}>
          <ListItemIcon sx={{ color: '#cccccc' }}>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share Conversation
        </MenuItem>
        <MenuItem sx={{ color: '#ffffff' }}>
          <ListItemIcon sx={{ color: '#cccccc' }}>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          Export Conversation
        </MenuItem>
        <Divider sx={{ borderColor: '#444444' }} />
        <MenuItem onClick={handleDeleteConversation} sx={{ color: '#f44336' }}>
          <ListItemIcon sx={{ color: '#f44336' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Conversation
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ConversationHistory;
