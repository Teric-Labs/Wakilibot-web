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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ShowPasswordIcon, HidePasswordIcon } from './icons';
import WakilibotLogo from './WakilibotLogo';
import { tokens } from '../styles/theme';
import api from '../services/api';

/**
 * ChatGPT-style centered signup — minimal fields.
 */
const SignupPage = ({
  onSignup,
  onBack,
  onSwitchToLogin,
  onContinueAsGuest,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const next = {};
    if (!formData.fullName.trim()) next.fullName = 'Name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Invalid email';
    if (!formData.password || formData.password.length < 8) {
      next.password = 'At least 8 characters';
    }
    if (!formData.agreeToTerms) next.agreeToTerms = 'Please accept the terms';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setSubmitError('');
    try {
      const result = await api.registerUser({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        preferred_language: 'english',
      });
      const user = result?.user || result;
      if (user?.user_id) {
        api.utils.storeUserData(user);
      }
      onSignup(user);
    } catch (error) {
      setSubmitError(
        error.response?.data?.detail || 'Could not create account. Try again.'
      );
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
          Create your account
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
          Save complaints, track status, and resume fraud cases securely.
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof submitError === 'string' ? submitError : 'Registration failed'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Full name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName}
            sx={{ mb: 2 }}
            autoComplete="name"
            autoFocus
          />
          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={{ mb: 2 }}
            autoComplete="email"
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={Boolean(errors.password)}
            helperText={errors.password || 'At least 8 characters'}
            sx={{ mb: 1.5 }}
            autoComplete="new-password"
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
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeToTerms: e.target.checked })
                }
                sx={{ color: tokens.navy }}
              />
            }
            label="I agree to the terms of use"
            sx={{ mb: errors.agreeToTerms ? 0 : 2, color: tokens.muted }}
          />
          {errors.agreeToTerms && (
            <Typography color="error" variant="caption" display="block" sx={{ mb: 2 }}>
              {errors.agreeToTerms}
            </Typography>
          )}
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
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToLogin}
            underline="hover"
            sx={{ color: tokens.navy, fontWeight: 600 }}
          >
            Sign in
          </Link>
        </Typography>

        <Divider sx={{ my: 2.5 }}>or</Divider>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={onContinueAsGuest}
          sx={{ py: 1.25, mb: 2 }}
        >
          Continue as guest
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
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

export default SignupPage;
