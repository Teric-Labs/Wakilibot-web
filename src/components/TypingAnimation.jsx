import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import WakilibotLogo from './WakilibotLogo';
import { tokens } from '../styles/theme';
import { useLanguage } from '../hooks/useLanguage';

const TypingAnimation = ({ isVisible = true }) => {
  const { t } = useLanguage();
  if (!isVisible) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        py: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          width: '100%',
          maxWidth: 768,
        }}
      >
        <Avatar
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            bgcolor: tokens.navy,
            color: '#fff',
            fontSize: 14,
          }}
        >
          <WakilibotLogo size={16} showText={false} />
        </Avatar>

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
            {t('typing', 'thinking')}
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
      </Box>
    </Box>
  );
};

export default TypingAnimation;
