import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
  Divider,
} from '@mui/material';
import { ShowPasswordIcon, HidePasswordIcon } from './icons';
import WakilibotLogo from './WakilibotLogo';
import { tokens } from '../styles/theme';
import api from '../services/api';

/**
 * ChatGPT-style centered sign-in: email + password only.
 */
const LoginPage = ({
  onLogin,
  onBack,
  onSwitchToSignup,
  onContinueAsGuest,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email';
    }
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setSubmitError('');
    try {
      const response = await api.loginUser({
        email: email.trim(),
        password,
      });
      api.utils.storeUserData(response.user);
      onLogin(response.user);
    } catch (error) {
      if (error.response?.status === 401) {
        setSubmitError('Incorrect email or password.');
      } else {
        setSubmitError(error.response?.data?.detail || 'Sign-in failed. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: tokens.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
      }}
    >
      <Box className="wakili-fade-up" sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <WakilibotLogo size={48} showText onClick={onBack} />
        </Box>

        <Typography
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: '1.75rem',
            fontWeight: 600,
            textAlign: 'center',
            mb: 1,
            color: tokens.navy,
          }}
        >
          Welcome back
        </Typography>
        <Typography
          sx={{
            color: tokens.muted,
            textAlign: 'center',
            mb: 3.5,
            fontSize: '0.98rem',
            lineHeight: 1.5,
          }}
        >
          Sign in to save complaints and track your cases.
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={{ mb: 2 }}
            autoComplete="email"
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password}
            sx={{ mb: 2.5 }}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                  >
                    {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ py: 1.35, mb: 2 }}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Continue'}
          </Button>
        </Box>

        <Typography sx={{ textAlign: 'center', color: tokens.muted, mb: 2 }}>
          Don&apos;t have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToSignup}
            underline="hover"
            sx={{ color: tokens.navy, fontWeight: 600 }}
          >
            Sign up
          </Link>
        </Typography>

        <Divider sx={{ my: 2.5, color: tokens.muted, fontSize: '0.8rem' }}>or</Divider>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={onContinueAsGuest}
          sx={{ py: 1.25, mb: 2 }}
        >
          Continue as guest
        </Button>

        <Typography
          sx={{
            textAlign: 'center',
            color: tokens.muted,
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}
        >
          Guest chats use a temporary session. Sign in anytime to keep your case history.
        </Typography>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link
            component="button"
            type="button"
            onClick={onBack}
            underline="hover"
            sx={{ color: tokens.muted, fontSize: '0.9rem' }}
          >
            ← Back to home
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
