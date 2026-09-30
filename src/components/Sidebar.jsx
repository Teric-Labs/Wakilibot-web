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
// Rail icons come from the workspace icon set (./icons), which is the only place in this app
// that imports an icon library directly.
import {
  AskWakiliIcon,
  HistoryIcon,
  DocumentsIcon,
  SupportIcon,
  SettingsIcon,
  AccountIcon,
  NewEnquiryIcon,
  CollapseRailIcon,
  ExpandRailIcon,
} from './icons';
import WakilibotLogo from './WakilibotLogo';
import { tokens, radii } from '../styles/theme';
import { useLanguage } from '../hooks/useLanguage';

const navBtnSx = (open, selected) => ({
  position: 'relative',
  // Square on purpose (radii.card): the selection shade is a block sitting behind the label,
  // not a pill.
  borderRadius: radii.card,
  mb: 0.25,
  minHeight: 40,
  justifyContent: open ? 'flex-start' : 'center',
  px: open ? 1.25 : 1,
  color: selected ? '#ECECF1' : 'rgba(236,236,241,0.66)',
  backgroundColor: selected ? 'rgba(255,255,255,0.07)' : 'transparent',
  // A gold rule marks the current screen; brighter than a background tint and it survives
  // the dark sidebar's low contrast.
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 2,
    height: selected ? 18 : 0,
    borderRadius: radii.card,
    backgroundColor: tokens.gold,
    transition: 'height .18s ease',
  },
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#ECECF1',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(255,255,255,0.07)',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.09)' },
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
  const { t } = useLanguage();

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
    // Named for the service rather than for a generic chat window: this is where a
    // consumer asks their wakili (advocate) for help.
    { id: 'chat', label: t('sidebar', 'askWakili'), icon: <AskWakiliIcon /> },
    // No complaint/fraud entries here: intake is a chat topic, published by the agent at
    // GET /intents and rendered by the topic menu, so it must not have a second form.
    { id: 'conversations', label: t('sidebar', 'history'), icon: <HistoryIcon /> },
    { id: 'archive', label: t('sidebar', 'documents'), icon: <DocumentsIcon /> },
    { id: 'help', label: t('sidebar', 'help'), icon: <SupportIcon /> },
    { id: 'settings', label: t('sidebar', 'settings'), icon: <SettingsIcon /> },
    { id: 'account', label: t('sidebar', 'account'), icon: <AccountIcon /> },
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
            aria-label={t('sidebar', 'collapseSidebar')}
            onClick={onClose}
            size="small"
            sx={{ color: 'rgba(236,236,241,0.55)' }}
          >
            <CollapseRailIcon />
          </IconButton>
        )}
      </Box>

      {!open && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
          <IconButton
            aria-label={t('sidebar', 'expandSidebar')}
            onClick={onClose}
            size="small"
            sx={{ color: 'rgba(236,236,241,0.55)' }}
          >
            <ExpandRailIcon />
          </IconButton>
        </Box>
      )}

      <Box sx={{ px: open ? 1.25 : 0.75, pb: 1 }}>
        <Tooltip title={open ? '' : t('sidebar', 'newEnquiryTooltip')} placement="right">
          <Button
            fullWidth={open}
            variant="outlined"
            startIcon={open ? <NewEnquiryIcon /> : undefined}
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
              borderRadius: radii.card,
              transition: 'border-color .18s ease, background-color .18s ease',
              '&:hover': {
                borderColor: 'rgba(184,134,11,0.75)',
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            {open ? t('sidebar', 'newEnquiry') : <NewEnquiryIcon />}
          </Button>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: open ? 1.25 : 0.75 }}>
        {open && (
          <Typography
            sx={{
              px: 1.25,
              pt: 1,
              pb: 1,
              fontSize: '0.64rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(236,236,241,0.35)',
            }}
          >
            {t('sidebar', 'workspace')}
          </Typography>
        )}
        <List disablePadding>{items.map(renderItem)}</List>

        {open && recent.length > 0 && (
          <Box sx={{ mt: 2, px: 0.5 }}>
            <Typography
              sx={{
                px: 1,
                mb: 0.75,
                fontSize: '0.64rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(236,236,241,0.35)',
              }}
            >
              {t('sidebar', 'recent')}
            </Typography>
            {recent.map((conv) => (
              <Box
                key={conv.id || conv.conversation_id}
                onClick={() => handleItemClick('conversations')}
                sx={{
                  px: 1.25,
                  py: 0.9,
                  borderRadius: radii.card,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <Typography
                  noWrap
                  sx={{ fontSize: '0.8rem', color: 'rgba(236,236,241,0.75)' }}
                >
                  {conv.title || conv.preview || t('sidebar', 'conversation')}
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
                  {isGuest ? t('sidebar', 'guest') : user?.full_name || t('sidebar', 'user')}
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
                {t('sidebar', 'signInToSave')}
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
