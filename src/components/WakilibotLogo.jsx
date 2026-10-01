import React from 'react';
import { Box, Avatar } from '@mui/material';
import { tokens } from '../styles/theme';
import ctdruLogo from '../assets/logo/cropped-CTDR-U-Logo-1-150x150.png';

const WakilibotLogo = ({
  size = 44,
  showText = true,
  showSubtitle = true,
  onClick = null,
  inverted = false,
}) => {
  const textColor = inverted ? '#FFFFFF' : tokens.navy;
  const subColor = inverted ? 'rgba(255,255,255,0.72)' : tokens.muted;

  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? 'Wakilibot home' : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
        transition: 'opacity 0.2s ease',
        '&:hover': onClick ? { opacity: 0.88 } : {},
        '&:focus-visible': {
          outline: `2px solid ${tokens.gold}`,
          outlineOffset: 3,
          borderRadius: 2,
        },
      }}
    >
      <Avatar
        src={ctdruLogo}
        alt="CTDRU"
        sx={{
          width: size,
          height: size,
          bgcolor: '#FFFFFF',
          boxShadow: inverted
            ? '0 4px 14px rgba(0, 0, 0, 0.28)'
            : '0 6px 18px rgba(11, 31, 58, 0.18)',
          '& .MuiAvatar-img': {
            objectFit: 'cover',
          },
        }}
      />
      {showText && (
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <Box
            component="span"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 650,
              fontSize: Math.max(16, size * 0.38),
              color: textColor,
              letterSpacing: '-0.02em',
            }}
          >
            Wakilibot
          </Box>
          {showSubtitle && (
            <Box
              component="span"
              sx={{
                fontSize: Math.max(10, size * 0.2),
                fontWeight: 500,
                color: subColor,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              by CTDRU
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WakilibotLogo;
