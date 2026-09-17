import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { Psychology as PsychologyIcon, Keyboard as KeyboardIcon } from '@mui/icons-material';

// Animation keyframes
const animationPulse = keyframes`
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
`;

const animationDots = keyframes`
  0%, 20% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  80%, 100% {
    opacity: 0;
  }
`;

const animationGlow = keyframes`
  0% {
    box-shadow: 0 0 3px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 3px rgba(255, 255, 255, 0.1);
  }
`;

const TypingAnimation = ({ isVisible = true, isThinking = false }) => {
  if (!isVisible) return null;

  // Debug logging
  console.log('TypingAnimation: isVisible =', isVisible, 'isThinking =', isThinking);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: isThinking ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
        border: isThinking ? '2px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: isThinking ? 'blur(15px)' : 'blur(8px)',
        maxWidth: 'fit-content',
        mx: 'auto',
        mb: 2,
        animation: `${animationPulse} ${isThinking ? '2s' : '1.5s'} ease-in-out infinite, ${animationGlow} ${isThinking ? '3s' : '2s'} ease-in-out infinite`,
        position: 'relative',
        overflow: 'hidden',
        transform: isThinking ? 'translateY(-2px)' : 'translateY(2px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          animation: `shimmer ${isThinking ? '2s' : '1.8s'} infinite`,
        },
        '@keyframes shimmer': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      }}
    >
      {/* Dynamic Icon */}
      {isThinking ? (
        <PsychologyIcon
          sx={{
            color: '#ffffff',
            fontSize: 24,
            animation: `${animationPulse} 2s ease-in-out infinite`,
          }}
        />
      ) : (
        <KeyboardIcon
          sx={{
            color: '#ffffff',
            fontSize: 20,
            animation: `${animationPulse} 1.5s ease-in-out infinite`,
          }}
        />
      )}
      
      {/* Dynamic Text with Animated Dots */}
      <Typography
        variant="body2"
        sx={{
          color: '#ffffff',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          position: 'relative',
          zIndex: 1,
        }}
      >
        Wakilibot is {isThinking ? 'thinking' : 'typing'}
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            gap: 0.25,
            ml: 0.5,
          }}
        >
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              component="span"
              sx={{
                width: isThinking ? 4 : 3,
                height: isThinking ? 4 : 3,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                animation: `${animationDots} ${isThinking ? '1.4s' : '1.2s'} ease-in-out infinite`,
                animationDelay: `${index * (isThinking ? 0.2 : 0.15)}s`,
              }}
            />
          ))}
        </Box>
      </Typography>
    </Box>
  );
};

export default TypingAnimation;
