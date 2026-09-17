import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  SmartToy as SmartToyIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import WakilibotLogo from './WakilibotLogo';
import api from '../services/api';

const SystemInfoDialog = ({ open, onClose }) => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSystemInfo();
      fetchSessionInfo();
    }
  }, [open]);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const [healthData, serviceData] = await Promise.all([
        api.getHealthStatus(),
        api.getServiceInfo()
      ]);
      setSystemInfo({ health: healthData, service: serviceData });
    } catch (error) {
      console.error('Error fetching system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionInfo = async () => {
    try {
      const sessionData = await api.getUserSession();
      setSessionInfo(sessionData);
    } catch (error) {
      console.error('Error fetching session info:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                width: 48,
                height: 48
              }}
            >
              <WakilibotLogo size={24} showText={false} variant="icon" />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Wakilibot System
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced AI Assistant Status
              </Typography>
            </Box>
          </Box>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchSystemInfo} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {systemInfo && (
          <Box sx={{ mb: 3 }}>
            {/* System Status */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {getStatusIcon(systemInfo.health.status)}
                <Typography variant="body1">
                  {systemInfo.health.service} - {systemInfo.health.status.toUpperCase()}
                </Typography>
                <Chip
                  label={`v${systemInfo.health.version}`}
                  color={getStatusColor(systemInfo.health.status)}
                  size="small"
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Sessions
                  </Typography>
                  <Typography variant="h6">
                    {systemInfo.health.session_status?.active_sessions || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Intent Patterns
                  </Typography>
                  <Typography variant="h6">
                    {systemInfo.health.session_status?.intent_patterns || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Features */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Available Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(systemInfo.health.features || {}).map(([feature, enabled]) => (
                  <Chip
                    key={feature}
                    label={feature.replace('_', ' ')}
                    color={enabled ? 'success' : 'default'}
                    variant={enabled ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Paper>

            {/* API Endpoints */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                API Endpoints
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(systemInfo.health.api_endpoints || {}).map(([name, url]) => (
                  <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 120 }}>
                      {name.replace('_', ' ')}:
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', flex: 1 }}>
                      {url}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Service Capabilities */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Service Capabilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(systemInfo.service.capabilities || []).map((capability, index) => (
                  <Chip
                    key={index}
                    label={capability.replace('✅ ', '')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Session Information */}
        {sessionInfo && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Current Session
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {sessionInfo.user_id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Session Status
                  </Typography>
                  <Chip
                    label={sessionInfo.status}
                    color="success"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Task
                  </Typography>
                  <Typography variant="body2">
                    {sessionInfo.current_task || 'None'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Task Status
                  </Typography>
                  <Chip
                    label={sessionInfo.task_status || 'idle'}
                    color="default"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SystemInfoDialog;
