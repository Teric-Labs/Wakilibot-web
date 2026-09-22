import React from 'react';
import { Box, Avatar } from '@mui/material';
import {
  AccountBalance as ScalesIcon
} from '@mui/icons-material';

const WakilibotLogo = ({ 
  size = 48, 
  showText = true, 
  variant = 'full',
  onClick = null 
}) => {
  const logoStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      '&:hover': onClick ? {
        transform: 'translateY(-1px)',
        '& .logo-text': {
          color: '#1976d2'
        }
      } : {}
    },
    avatar: {
      backgroundColor: '#0D47A1',
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #0D47A1 0%, #1976d2 100%)',
      boxShadow: '0 4px 20px rgba(13, 71, 161, 0.3)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 6px 25px rgba(13, 71, 161, 0.4)'
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        borderRadius: '50%'
      }
    },
    iconContainer: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%'
    },
    scalesIcon: {
      fontSize: size * 0.5,
      color: '#ffffff',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    digitalElements: {
      position: 'absolute',
      top: '20%',
      right: '20%',
      width: size * 0.15,
      height: size * 0.15,
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '2px',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '25%',
        left: '25%',
        right: '25%',
        bottom: '25%',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '1px'
      }
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    mainText: {
      fontWeight: 700,
      color: '#ffffff',
      fontSize: size * 0.25,
      lineHeight: 1,
      transition: 'color 0.3s ease'
    },
    subText: {
      color: '#C0C0C0',
      fontSize: size * 0.15,
      fontWeight: 500,
      letterSpacing: '0.5px',
      lineHeight: 1
    }
  };

  const renderLogoIcon = () => (
    <Box sx={logoStyles.iconContainer}>
      {/* Scales of Justice */}
      <ScalesIcon sx={logoStyles.scalesIcon} />
      
      {/* Digital Elements */}
      <Box sx={logoStyles.digitalElements} />
      
      {/* Additional digital accent */}
      <Box sx={{
        ...logoStyles.digitalElements,
        top: '70%',
        left: '20%',
        width: size * 0.1,
        height: size * 0.1,
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '50%'
      }} />
    </Box>
  );

  const renderText = () => {
    if (!showText) return null;
    
    return (
      <Box sx={logoStyles.textContainer}>
        <Box 
          component="span" 
          className="logo-text"
          sx={logoStyles.mainText}
        >
          Wakilibot
        </Box>
        <Box component="span" sx={logoStyles.subText}>
          by CTDRU
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={logoStyles.container} onClick={onClick}>
      <Avatar sx={logoStyles.avatar}>
        {renderLogoIcon()}
      </Avatar>
      {renderText()}
    </Box>
  );
};

export default WakilibotLogo;
