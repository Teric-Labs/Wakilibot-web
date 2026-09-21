import React from 'react';
import { Box } from '@mui/material';
import { tokens } from '../styles/theme';

const TypingAnimation = ({ isVisible = true }) => {
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
        <Box sx={{ width: 28, flexShrink: 0 }} />
        <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center', py: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: tokens.muted,
                animation: 'dotPulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
                '@keyframes dotPulse': {
                  '0%, 80%, 100%': { opacity: 0.35, transform: 'translateY(0)' },
                  '40%': { opacity: 0.9, transform: 'translateY(-2px)' },
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TypingAnimation;
