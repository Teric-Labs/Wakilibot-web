import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { tokens, radii } from '../styles/theme';
import { uppercaseLabelSx } from './PanelCard';

const sharp = {
  // Square, like every other panel surface (radii.card); spread so the rows below stay readable.
  borderRadius: radii.card,
};

const FieldRow = ({ label, value, last }) => (
  <Box
    sx={{
      px: 2,
      py: 1.6,
      borderBottom: last ? 'none' : `1px solid ${tokens.line}`,
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
      gap: { xs: 0.5, sm: 2 },
      alignItems: 'baseline',
    }}
  >
    <Typography sx={uppercaseLabelSx}>{label}</Typography>
    <Typography
      sx={{
        fontWeight: 560,
        fontSize: '0.95rem',
        color: tokens.navy,
        wordBreak: 'break-word',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const AccountPanel = ({ user, isGuest, onLogin, onSignup, onLogout }) => {
  const displayName = isGuest ? 'Guest' : user?.full_name || 'User';
  const email = isGuest ? 'Temporary session' : user?.email || '—';
  const initials = isGuest
    ? 'G'
    : (displayName || 'U')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || 'U';

  return (
    <Box sx={{ maxWidth: 520 }}>
      <Typography
        sx={{
          color: tokens.muted,
          mb: 3,
          lineHeight: 1.65,
          fontSize: '0.95rem',
        }}
      >
        {isGuest
          ? 'You are chatting as a guest. Sign in to save case history and track filings.'
          : 'Your profile for CTDRU guidance, complaint filings, and saved conversations.'}
      </Typography>

      <Box
        sx={{
          ...sharp,
          border: `1px solid ${tokens.line}`,
          backgroundColor: '#FFFFFF',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 2,
            borderBottom: `1px solid ${tokens.line}`,
            backgroundColor: tokens.paper,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              ...sharp,
              width: 48,
              height: 48,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.navy,
              color: '#FFFFFF',
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.05rem',
            }}
          >
            {initials}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: '1.15rem',
                color: tokens.navy,
                lineHeight: 1.25,
              }}
            >
              {displayName}
            </Typography>
            <Typography sx={{ color: tokens.muted, fontSize: '0.82rem', mt: 0.25 }}>
              {isGuest ? 'Guest session' : 'Signed in'}
            </Typography>
          </Box>
        </Box>

        <FieldRow label="Name" value={displayName} />
        <FieldRow label="Email" value={email} />
        <FieldRow
          label="Access"
          value={isGuest ? 'Guest — not saved across devices' : 'Full account'}
          last
        />
      </Box>

      {isGuest ? (
        <Stack spacing={1.25}>
          <Button
            variant="contained"
            onClick={onLogin}
            fullWidth
            sx={{
              ...sharp,
              textTransform: 'none',
              py: 1.35,
              fontWeight: 600,
            }}
          >
            Sign in
          </Button>
          <Button
            variant="outlined"
            onClick={onSignup}
            fullWidth
            sx={{
              ...sharp,
              textTransform: 'none',
              py: 1.35,
              borderColor: tokens.line,
              color: tokens.navy,
              '&:hover': {
                borderColor: tokens.navy,
                backgroundColor: tokens.paper,
              },
            }}
          >
            Create account
          </Button>
        </Stack>
      ) : (
        <Button
          variant="outlined"
          onClick={onLogout}
          fullWidth
          sx={{
            ...sharp,
            textTransform: 'none',
            py: 1.35,
            borderColor: tokens.line,
            color: tokens.navy,
            '&:hover': {
              borderColor: tokens.navy,
              backgroundColor: tokens.paper,
            },
          }}
        >
          Sign out
        </Button>
      )}
    </Box>
  );
};

export default AccountPanel;
