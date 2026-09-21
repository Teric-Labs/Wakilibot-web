import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { tokens } from '../styles/theme';

/**
 * Shared white content shell matching the ChatGPT-style chat screen.
 */
const StandardPanel = ({
  title,
  subtitle,
  onBack,
  children,
  maxWidth = 768,
}) => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      color: tokens.navy,
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        px: 3,
        py: 1.75,
        borderBottom: '1px solid rgba(11,31,58,0.08)',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexShrink: 0,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            color: tokens.navy,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: tokens.muted, fontSize: '0.82rem', mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {onBack && (
        <IconButton aria-label="Back to chat" onClick={onBack} sx={{ color: tokens.muted }}>
          <ArrowBackIcon />
        </IconButton>
      )}
    </Box>

    <Box sx={{ flex: 1, overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
      <Box
        sx={{
          maxWidth,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 3.5 },
        }}
      >
        {children}
      </Box>
    </Box>
  </Box>
);

export default StandardPanel;
