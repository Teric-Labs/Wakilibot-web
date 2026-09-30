import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Alert,
  InputAdornment,
  CircularProgress,
  Stack,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as BackIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import api from '../services/api';

const PasswordResetRequest = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePasswords = () => {
    const errors = {};

    if (!formData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    setPasswordErrors('');

    // Validate email
    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate passwords
    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Resetting password for:', formData.email);
      const response = await api.resetPassword(
        formData.email,
        formData.newPassword,
        formData.confirmPassword
      );
      
      console.log('Password reset successful:', response);
      
      if (response.success) {
        setSuccess(true);
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(formData.email);
        }
      } else {
        setError(response.message || 'Password reset failed');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.response?.status === 404) {
        setError('No account found with this email address. Please check your email or create a new account.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Invalid data. Please check your input.');
      } else if (err.response?.status === 500) {
        setError('Unable to reset password. Please try again later or contact support.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setFormData({ email: '', newPassword: '', confirmPassword: '' });
    setError('');
    setPasswordErrors({});
    setSuccess(false);
    if (onBack) {
      onBack();
    }
  };

  if (success) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}>
        <Container maxWidth="sm">
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            p: 4,
            textAlign: 'center'
          }}>
            {/* Success Icon */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(76, 175, 80, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <CheckIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </Box>

            {/* Success Message */}
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#ffffff', 
              mb: 2,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              Password Reset Successfully
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              mb: 3,
              lineHeight: 1.6
            }}>
              Your password has been successfully reset for <strong style={{ color: '#ffffff' }}>{formData.email}</strong>
            </Typography>

            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              mb: 4,
              fontSize: '0.9rem'
            }}>
              You can now sign in with your new password.
            </Typography>

            {/* Back Button */}
            <Button
              onClick={handleBack}
              variant="outlined"
              startIcon={<BackIcon />}
              sx={{
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1
              }}
            >
              Back to Login
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2
    }}>
      <Container maxWidth="sm">
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'none',
          borderRadius: 3,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          p: 4
        }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <SecurityIcon sx={{ fontSize: 30, color: '#ffffff' }} />
            </Box>
            
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#ffffff', 
              mb: 1,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              Reset Password
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Enter your email address and new password to reset your account
            </Typography>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                color: '#ffffff',
                '& .MuiAlert-icon': { color: '#f44336' }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Reset Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={3}>
              {/* Email Field */}
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    '&:hover fieldset': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#ffffff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />

              {/* New Password Field */}
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#ffffff' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    '&:hover fieldset': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#ffffff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />

              {/* Confirm Password Field */}
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: '#ffffff' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    '&:hover fieldset': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#ffffff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !formData.email.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: '0.5px'
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Resetting Password...
                  </Box>
                ) : (
                  'Reset Password'
                )}
              </Button>

              {/* Back Button */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  onClick={handleBack}
                  variant="text"
                  startIcon={<BackIcon />}
                  disabled={isLoading}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    },
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Password must be at least 6 characters long
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default PasswordResetRequest;
