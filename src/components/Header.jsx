import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import api from '../services/api';

const Header = ({ toggleTheme, darkMode }) => {
  const theme = useTheme();
  const [agentInfo, setAgentInfo] = useState({
    agent_name: 'AI Assistant',
    agent_lang: 'en'
  });

  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const info = await api.getAgentInfo();
        setAgentInfo(info);
      } catch (error) {
        console.error('Failed to fetch agent info', error);
      }
    };

    fetchAgentInfo();
  }, []);

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            component="img" 
            src="/favicon.ico" 
            alt="Logo" 
            sx={{ height: 30, width: 30, mr: 1 }} 
          />
          <Typography 
            variant="h6" 
            color="text.primary" 
            sx={{ fontWeight: 600 }}
          >
            {agentInfo.agent_name}
          </Typography>
        </Box>
        <IconButton onClick={toggleTheme} color="inherit">
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;