import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Collapse,
  Badge,
  useTheme
} from '@mui/material';
import {
  Chat as ChatIcon,
  Archive as ArchiveIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  SmartToy as SmartToyIcon,
  History as HistoryIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import WakilibotLogo from './WakilibotLogo';

const Sidebar = ({ 
  open, 
  onClose, 
  onNewConversation, 
  onSelectConversation,
  currentConversationId,
  conversations = [],
  onItemClick,
  userId = null
}) => {
  const theme = useTheme();
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedItem, setSelectedItem] = useState('conversations');

  const handleToggle = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (onItemClick) {
      onItemClick(item);
    }
    if (item === 'new-chat') {
      onNewConversation();
    }
  };

  const sidebarItems = [
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: <AddIcon />,
      action: 'new-chat'
    },
    {
      id: 'conversations',
      label: 'Conversations',
      icon: <ChatIcon />,
      count: conversations.length,
      action: 'conversations'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <ArchiveIcon />,
      count: 0,
      action: 'archive'
    },
    {
      id: 'help',
      label: 'Help',
      icon: <SupportIcon />,
      action: 'help'
    },
    {
      id: 'account',
      label: 'Account',
      icon: <PersonIcon />,
      action: 'account'
    },
    {
      id: 'contact-support',
      label: 'Contact Support',
      icon: <SupportIcon />,
      action: 'contact-support'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      action: 'settings'
    }
  ];

  const recentConversations = conversations.slice(0, 5).map(conv => ({
    id: conv.id,
    title: conv.title || 'New Conversation',
    timestamp: conv.timestamp,
    preview: conv.preview || 'Start a conversation...'
  }));

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: open ? 280 : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 280 : 72,
          boxSizing: 'border-box',
          backgroundColor: '#111111',
          borderRight: '1px solid #333333',
          color: '#ffffff',
          transition: 'width 0.3s ease',
          overflow: 'hidden'
        },
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          p: open ? 2 : 1.5,
          borderBottom: '1px solid #333333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: 64
        }}
      >
        {open ? (
          <>
            <WakilibotLogo 
              size={32}
              showText={true}
              variant="full"
            />
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: '#cccccc',
                '&:hover': { backgroundColor: '#333333' }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          <Tooltip title="Expand Sidebar" placement="right">
            <WakilibotLogo 
              size={24}
              showText={false}
              variant="icon"
              onClick={() => {
                // Toggle the sidebar open state
                if (onClose) {
                  onClose();
                }
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List sx={{ px: 1, py: 1 }}>
          {sidebarItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              {open ? (
                <ListItemButton
                  onClick={() => handleItemClick(item.id)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: selectedItem === item.id ? '#333333' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#222222',
                    },
                    py: 1,
                    px: 2
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#cccccc' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#ffffff'
                    }}
                  />
                  {item.count !== undefined && (
                    <Chip
                      label={item.count}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '11px',
                        backgroundColor: '#333333',
                        color: '#cccccc',
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              ) : (
                <Tooltip title={item.label} placement="right">
                  <ListItemButton
                    onClick={() => handleItemClick(item.id)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: selectedItem === item.id ? '#333333' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#222222',
                      },
                      py: 1,
                      px: 1,
                      justifyContent: 'center',
                      minHeight: 48
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 'auto', color: '#cccccc', justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              )}
            </ListItem>
          ))}
        </List>



      </Box>

      {/* Sidebar Footer */}
      <Box
        sx={{
          p: open ? 2 : 1.5,
          borderTop: '1px solid #333333',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center'
        }}
      >
        {open ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#333333',
                color: '#ffffff'
              }}
            >
              <PersonIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: '#ffffff',
                  fontSize: '13px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                User Account
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#888888',
                  fontSize: '11px'
                }}
              >
                Free Plan
              </Typography>
            </Box>
          </Box>
        ) : (
          <Tooltip title="User Account" placement="right">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#333333',
                color: '#ffffff',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#444444'
                }
              }}
            >
              <PersonIcon sx={{ fontSize: 18 }} />
            </Avatar>
          </Tooltip>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
