import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Tooltip,
  Avatar,
  Button,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Archive as ArchiveIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Gavel as GavelIcon,
  Report as ReportIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import WakilibotLogo from './WakilibotLogo';

const navBtnSx = (open, selected) => ({
  borderRadius: 1.5,
  mb: 0.25,
  minHeight: 40,
  justifyContent: open ? 'flex-start' : 'center',
  px: open ? 1.25 : 1,
  color: selected ? '#ECECF1' : 'rgba(236,236,241,0.72)',
  backgroundColor: selected ? 'rgba(255,255,255,0.08)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(255,255,255,0.08)',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
  },
});

const Sidebar = ({
  open,
  onClose,
  onNewConversation,
  onItemClick,
  conversations = [],
  user = null,
  isGuest = false,
  onLogin,
  onSignup,
}) => {
  const [selectedItem, setSelectedItem] = useState('chat');

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (item === 'new-chat') {
      onNewConversation?.();
      onItemClick?.('new-chat');
      return;
    }
    onItemClick?.(item);
  };

  const items = [
    { id: 'chat', label: 'Chat', icon: <ChatIcon fontSize="small" /> },
    { id: 'complaint', label: 'File a complaint', icon: <GavelIcon fontSize="small" /> },
    { id: 'fraud', label: 'Report fraud', icon: <ReportIcon fontSize="small" /> },
    { id: 'conversations', label: 'History', icon: <HistoryIcon fontSize="small" /> },
    { id: 'archive', label: 'Documents', icon: <ArchiveIcon fontSize="small" /> },
    { id: 'help', label: 'Help', icon: <SupportIcon fontSize="small" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
    { id: 'account', label: 'Account', icon: <PersonIcon fontSize="small" /> },
  ];

  const recent = conversations.slice(0, 5);

  const renderItem = (item) => {
    const selected =
      selectedItem === item.id ||
      (item.id === 'chat' && selectedItem === 'new-chat');
    const button = (
      <ListItemButton
        key={item.id}
        selected={selected}
        onClick={() => handleItemClick(item.id)}
        sx={navBtnSx(open, selected)}
      >
        <ListItemIcon
          sx={{
            minWidth: open ? 36 : 0,
            color: 'inherit',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {open && (
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          />
        )}
      </ListItemButton>
    );

    return open ? (
      button
    ) : (
      <Tooltip key={item.id} title={item.label} placement="right">
        {button}
      </Tooltip>
    );
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: open ? 260 : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 260 : 64,
          boxSizing: 'border-box',
          backgroundColor: '#171717',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          color: '#ECECF1',
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          px: open ? 1.5 : 1,
          py: 1.5,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
        }}
      >
        {open ? (
          <WakilibotLogo size={32} showText showSubtitle={false} inverted />
        ) : (
          <WakilibotLogo size={30} showText={false} />
        )}
        {open && (
          <IconButton
            aria-label="Collapse sidebar"
            onClick={onClose}
            size="small"
            sx={{ color: 'rgba(236,236,241,0.55)' }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {!open && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
          <IconButton
            aria-label="Expand sidebar"
            onClick={onClose}
            size="small"
            sx={{ color: 'rgba(236,236,241,0.55)' }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ px: open ? 1.25 : 0.75, pb: 1 }}>
        <Button
          fullWidth={open}
          variant="outlined"
          startIcon={open ? <AddIcon /> : undefined}
          onClick={() => handleItemClick('new-chat')}
          sx={{
            justifyContent: open ? 'flex-start' : 'center',
            minWidth: open ? undefined : 40,
            minHeight: 40,
            px: open ? 1.5 : 0,
            borderColor: 'rgba(255,255,255,0.14)',
            color: '#ECECF1',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            borderRadius: 1.5,
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.28)',
              backgroundColor: 'rgba(255,255,255,0.04)',
            },
          }}
        >
          {open ? 'New chat' : <AddIcon fontSize="small" />}
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: open ? 1.25 : 0.75 }}>
        <List disablePadding>{items.map(renderItem)}</List>

        {open && recent.length > 0 && (
          <Box sx={{ mt: 2, px: 0.5 }}>
            <Typography
              sx={{
                px: 1,
                mb: 0.75,
                fontSize: '0.7rem',
                fontWeight: 500,
                color: 'rgba(236,236,241,0.4)',
              }}
            >
              Recent
            </Typography>
            {recent.map((conv) => (
              <Box
                key={conv.id || conv.conversation_id}
                onClick={() => handleItemClick('conversations')}
                sx={{
                  px: 1.25,
                  py: 0.9,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <Typography
                  noWrap
                  sx={{ fontSize: '0.8rem', color: 'rgba(236,236,241,0.75)' }}
                >
                  {conv.title || conv.preview || 'Conversation'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ p: open ? 1.5 : 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: isGuest ? 1 : 0 }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: '#ECECF1',
                }}
              >
                {isGuest ? 'G' : user?.full_name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                  {isGuest ? 'Guest' : user?.full_name || 'User'}
                </Typography>
              </Box>
            </Box>
            {isGuest && (onLogin || onSignup) && (
              <Button
                fullWidth
                size="small"
                onClick={onLogin || onSignup}
                sx={{
                  mt: 0.5,
                  color: 'rgba(236,236,241,0.8)',
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  justifyContent: 'flex-start',
                  px: 0.5,
                }}
              >
                Sign in to save
              </Button>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: '0.75rem',
                bgcolor: 'rgba(255,255,255,0.12)',
              }}
            >
              {isGuest ? 'G' : user?.full_name?.charAt(0) || 'U'}
            </Avatar>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
