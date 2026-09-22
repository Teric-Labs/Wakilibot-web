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
  IconButton,
  CircularProgress,
  Stack
} from '@mui/material';
import TopNav from './TopNav';
import WakilibotLogo from './WakilibotLogo';
import PasswordResetRequest from './PasswordResetRequest';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import api from '../services/api';

const LoginPage = ({ onLogin, onBack, onSwitchToSignup, onFeatures, onHowItWorks, onAboutUs }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // At least one of email or phone must be provided
    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = 'Please provide either email or phone number';
      newErrors.phone = 'Please provide either email or phone number';
    }
    
    // If email is provided, validate it
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // If phone is provided, validate it
    if (formData.phone.trim()) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    // Password is required
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      // Prepare login data - only send email OR phone, not both
      const loginData = {
        password: formData.password
      };
      
      if (formData.email.trim()) {
        loginData.email = formData.email.trim();
      } else if (formData.phone.trim()) {
        loginData.phone = formData.phone.trim();
      }

      // Call the login API
      const response = await api.loginUser(loginData);
      
      // Store user data in localStorage for persistent login
      api.utils.storeUserData(response.user);
      
      // Call the login handler with user data
      onLogin(response.user);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setSubmitError('Invalid credentials. Please check your email/phone and password.');
      } else if (error.response?.status === 400) {
        setSubmitError(error.response.data.detail || 'Invalid login data. Please check your input.');
      } else {
        setSubmitError('Login failed. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset handlers
  const handleForgotPassword = () => {
    setShowPasswordReset(true);
  };

  const handlePasswordResetBack = () => {
    setShowPasswordReset(false);
  };

  const handlePasswordResetSuccess = (email) => {
    console.log('Password reset completed for:', email);
    // Reset state and go back to login
    setShowPasswordReset(false);
  };

  // Render password reset component if needed
  if (showPasswordReset) {
    return (
      <PasswordResetRequest
        onBack={handlePasswordResetBack}
        onSuccess={handlePasswordResetSuccess}
      />
    );
  }

  return (
    <Box sx={{ 
        minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.01) 0%, transparent 50%)
        `,
        zIndex: 0
      }} />
      
      <TopNav 
        onHome={onBack}
        onFeatures={onFeatures}
        onHowItWorks={onHowItWorks}
        onAboutUs={onAboutUs}
        showAuthButtons={false}
      />
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'center', 
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 0 },
        mt: 20,
        position: 'relative',
        zIndex: 1
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 2, md: 4 },
            alignItems: 'flex-start',
            minHeight: 'auto',
            maxWidth: '1000px',
            mx: 'auto'
          }}>
            {/* Left Side - Visual Representation */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              order: { xs: 1, lg: 1 },
              mb: { xs: 2, lg: 0 }
            }}>
              {/* Visual Title */}
              <Typography variant="h4" sx={{ 
        color: '#ffffff',
                fontWeight: 700, 
                mb: 3,
                textAlign: 'center',
                fontSize: { xs: '1.5rem', md: '2rem' },
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                letterSpacing: '0.5px'
              }}>
                Experience Wakilibot
              </Typography>
              
              {/* Phones Container */}
              <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
                gap: { xs: 1, sm: 1.5, md: 2 },
                mb: 2
              }}>
                {/* Nokia Button Phone */}
                <Box sx={{
                  position: 'relative',
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 168, sm: 210, md: 252 },
                  background: '#1a1a1a',
                  borderRadius: { xs: 3, sm: 4, md: 6 },
                  border: '3px solid #333333',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
                  overflow: 'hidden',
                  zIndex: 8,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  {/* Nokia Screen */}
                  <Box sx={{
                    width: '100%',
                    height: '50%',
                    background: '#000000',
                    borderRadius: { xs: 3, sm: 4, md: 6 },
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid #444444'
                  }}>
                    {/* Nokia Display */}
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      background: '#001100',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0.5
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#00ff00', 
                        fontFamily: 'monospace',
                        fontSize: { xs: '5px', sm: '6px', md: '7px' },
                        textAlign: 'center',
                        mb: 0.3
                      }}>
                        Wakilibot SMS
                      </Typography>
                      <Box sx={{
                        background: '#003300',
                        borderRadius: 0.5,
                        p: 0.3,
                        width: '90%',
                        mb: 0.3
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#00ff00', 
                          fontFamily: 'monospace',
                          fontSize: { xs: '4px', sm: '5px', md: '6px' },
                          textAlign: 'left',
                          lineHeight: 1.2
                        }}>
                          Hello! I'm Wakilibot
                        </Typography>
                      </Box>
                      <Box sx={{
                        background: '#001a00',
                        borderRadius: 0.5,
                        p: 0.3,
                        width: '90%',
                        alignSelf: 'flex-end'
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#00ff00', 
                          fontFamily: 'monospace',
                          fontSize: { xs: '4px', sm: '5px', md: '6px' },
                          textAlign: 'right',
                          lineHeight: 1.2
                        }}>
                          Legal help
                          </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Nokia Keypad */}
                  <Box sx={{
                    width: '100%',
                    height: '50%',
                    background: '#2a2a2a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0.5
                  }}>
                    {/* Number Pad */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 0.3,
                      width: '85%',
                      mb: 0.5
                    }}>
                      {/* Numbers 1-9 */}
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                        <Box key={num} sx={{
                          width: { xs: 12, sm: 14, md: 16 },
                          height: { xs: 12, sm: 14, md: 16 },
                          background: '#444444',
                          borderRadius: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          '&:hover': { background: '#555555' }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#ffffff', 
                            fontSize: { xs: '6px', sm: '7px', md: '8px' },
                            fontWeight: 'bold'
                          }}>
                            {num}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Bottom Row */}
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '85%',
                      alignItems: 'center'
                    }}>
                      <Box sx={{
                        width: { xs: 12, sm: 14, md: 16 },
                        height: { xs: 12, sm: 14, md: 16 },
                        background: '#444444',
                        borderRadius: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        '&:hover': { background: '#555555' }
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#ffffff', 
                          fontSize: { xs: '5px', sm: '6px', md: '7px' },
                          fontWeight: 'bold'
                        }}>
                          *
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: { xs: 12, sm: 14, md: 16 },
                        height: { xs: 12, sm: 14, md: 16 },
                        background: '#444444',
                        borderRadius: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        '&:hover': { background: '#555555' }
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#ffffff', 
                          fontSize: { xs: '6px', sm: '7px', md: '8px' },
                          fontWeight: 'bold'
                        }}>
                          0
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: { xs: 12, sm: 14, md: 16 },
                        height: { xs: 12, sm: 14, md: 16 },
                        background: '#444444',
                        borderRadius: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        '&:hover': { background: '#555555' }
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#ffffff', 
                          fontSize: { xs: '5px', sm: '6px', md: '7px' },
                          fontWeight: 'bold'
                        }}>
                          #
                        </Typography>
                      </Box>
                    </Box>

                    {/* Nokia Brand */}
                    <Typography variant="caption" sx={{ 
                      color: '#666666', 
                      fontSize: { xs: '4px', sm: '5px', md: '6px' },
                      mt: 0.3,
                      fontWeight: 'bold'
                    }}>
                      NOKIA
                    </Typography>
                  </Box>
                </Box>

                {/* iPhone Chatbot Visual */}
                <Box sx={{ 
                  position: 'relative',
                  width: { xs: 120, sm: 150, md: 180 },
                  height: { xs: 210, sm: 262, md: 315 },
                  background: '#000000',
                  borderRadius: { xs: 2, sm: 3, md: 4 },
                  border: '6px solid #1a1a1a',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  overflow: 'hidden',
                  zIndex: 10,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  {/* iPhone Screen */}
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    background: '#ffffff',
                    borderRadius: { xs: 1.5, sm: 2, md: 3 },
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {/* Status Bar */}
                    <Box sx={{
                      height: 20,
                      background: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 1.5,
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#000000'
                    }}>
                      <Box>9:41</Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 8, borderRadius: 0.5, background: '#000000' }} />
                        <Box sx={{ width: 16, height: 8, borderRadius: 0.5, background: '#000000' }} />
                      </Box>
                    </Box>

                    {/* Chat Header */}
                    <Box sx={{
                      height: 40,
                      background: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      px: 1.5,
                      gap: 1
                    }}>
                      <WakilibotLogo 
                        size={16}
                        showText={false}
                        variant="icon-only"
                      />
                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '12px' }}>
                        Wakilibot
                      </Typography>
                    </Box>

                    {/* Chat Messages */}
                    <Box sx={{
                      flex: 1,
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      height: 'calc(100% - 100px)',
                      overflow: 'hidden'
                    }}>
                      {/* Bot Message */}
                      <Box sx={{
                        alignSelf: 'flex-start',
                        maxWidth: '80%',
                        background: '#f5f5f5',
                        borderRadius: 1.5,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}>
                        <Typography variant="body2" sx={{ fontSize: '9px', lineHeight: 1.3 }}>
                          Hello! I'm Wakilibot, your legal assistant. How can I help you today?
                        </Typography>
                      </Box>

                      {/* User Message */}
                      <Box sx={{
                        alignSelf: 'flex-end',
                        maxWidth: '80%',
                        background: '#1976d2',
                        borderRadius: 1.5,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}>
                        <Typography variant="body2" sx={{ fontSize: '9px', lineHeight: 1.3, color: '#ffffff' }}>
                          I have a complaint about my mobile service provider
                        </Typography>
                      </Box>
                    
                      {/* Bot Response */}
                      <Box sx={{
                        alignSelf: 'flex-start',
                        maxWidth: '80%',
                        background: '#f5f5f5',
                        borderRadius: 1.5,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}>
                        <Typography variant="body2" sx={{ fontSize: '9px', lineHeight: 1.3 }}>
                          I can help you with that! Let me gather some information...
                        </Typography>
                      </Box>

                      {/* Typing Indicator */}
                      <Box sx={{
                        alignSelf: 'flex-start',
                        background: '#f5f5f5',
                        borderRadius: 1.5,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3
                      }}>
                        <Box sx={{
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: '#666666',
                          animation: 'typing 1.4s infinite ease-in-out'
                        }} />
                        <Box sx={{
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: '#666666',
                          animation: 'typing 1.4s infinite ease-in-out 0.2s'
                        }} />
                        <Box sx={{
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: '#666666',
                          animation: 'typing 1.4s infinite ease-in-out 0.4s'
                        }} />
                      </Box>
                    </Box>

                    {/* Input Area */}
                    <Box sx={{
                      height: 35,
                      background: '#ffffff',
                      borderTop: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      px: 1.5,
                      gap: 0.5
                    }}>
                      <Box sx={{
                        flex: 1,
                        height: 25,
                        background: '#f5f5f5',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        px: 1.5,
                        fontSize: '10px',
                        color: '#666666'
                      }}>
                        Type a message...
                      </Box>
                      <Box sx={{
                        width: 25,
                        height: 25,
                        background: '#1976d2',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}>
                        <ArrowIcon sx={{ fontSize: 12, color: '#ffffff' }} />
                      </Box>
                      </Box>
                  </Box>

                  {/* iPhone Home Indicator */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 30,
                    height: 3,
                    background: '#ffffff',
                    borderRadius: 1.5,
                    opacity: 0.3
                  }} />
                </Box>
              </Box>

              {/* Circular Features Row */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1, sm: 1.5, md: 2 },
                flexWrap: 'wrap'
              }}>
                {/* Voice-to-Voice Circle */}
                <Box sx={{
                  width: { xs: 50, sm: 60, md: 70 },
                  height: { xs: 50, sm: 60, md: 70 },
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 5,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'scale(1.1)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)'
                  }
                }}>
                  <Box sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, color: '#ffffff', mb: 0.5 }}>🎤</Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '8px', sm: '9px', md: '10px' }, textAlign: 'center' }}>
                    Voice
                  </Typography>
                </Box>

                {/* IVR Circle */}
                <Box sx={{
                  width: { xs: 50, sm: 60, md: 70 },
                  height: { xs: 50, sm: 60, md: 70 },
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 5,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'scale(1.1)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)'
                  }
                }}>
                  <Box sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, color: '#ffffff', mb: 0.5 }}>📞</Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '8px', sm: '9px', md: '10px' }, textAlign: 'center' }}>
                    IVR
                  </Typography>
                </Box>

                {/* USSD Circle */}
                <Box sx={{
                  width: { xs: 50, sm: 60, md: 70 },
                  height: { xs: 50, sm: 60, md: 70 },
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 5,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'scale(1.1)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)'
                  }
                }}>
                  <Box sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, color: '#ffffff', mb: 0.5 }}>📱</Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '8px', sm: '9px', md: '10px' }, textAlign: 'center' }}>
                    USSD
                  </Typography>
                </Box>

                {/* Messaging Circle */}
                <Box sx={{
                  width: { xs: 50, sm: 60, md: 70 },
                  height: { xs: 50, sm: 60, md: 70 },
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 5,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'scale(1.1)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)'
                  }
                }}>
                  <Box sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, color: '#ffffff', mb: 0.5 }}>💬</Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '8px', sm: '9px', md: '10px' }, textAlign: 'center' }}>
                    SMS
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right Side - Login Form */}
            <Box sx={{ 
              flex: 1,
              maxWidth: { xs: '100%', lg: '450px' },
              order: { xs: 2, lg: 2 }
            }}>
              {/* Login Form Card */}
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: 3,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                p: 3,
                maxWidth: '100%',
                minHeight: 'auto'
              }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <WakilibotLogo size={40} showText={true} />
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: '#ffffff', 
                    mt: 1,
                    mb: 0.5,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                  }}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Sign in to access your Wakilibot account
                  </Typography>
                </Box>

                {/* Error Display */}
                  {submitError && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {submitError}
                      </Alert>
                  )}

                  {/* Login Form */}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <Stack spacing={2}>
                      {/* Email Field */}
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          error={!!errors.email}
                          helperText={errors.email}
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

                      {/* Phone Field */}
                        <TextField
                          fullWidth
                      label="Phone Number (Alternative)"
                      type="tel"
                          value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          error={!!errors.phone}
                      helperText={errors.phone}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: '#ffffff' }} />
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

                      {/* Password Field */}
                        <TextField
                          fullWidth
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          error={!!errors.password}
                          helperText={errors.password}
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

                    {/* Login Button */}
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                      size="large"
                          disabled={isLoading}
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
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: '0.5px'
                          }}
                        >
                          {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" />
                              Signing In...
                            </Box>
                          ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LoginIcon />
                          Sign In
                        </Box>
                          )}
                        </Button>

                    {/* Forgot Password Link */}
                    <Box sx={{ textAlign: 'right', mt: 1 }}>
                      <Button
                        variant="text"
                        onClick={handleForgotPassword}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                          },
                        }}
                      >
                        Forgot Password?
                      </Button>
                    </Box>

                    {/* Switch to Signup */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Don't have an account?{' '}
                          <Button
                          variant="text"
                            onClick={onSwitchToSignup}
                            sx={{
                              color: '#ffffff',
                            fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                              background: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            Create Account
                          </Button>
                      </Typography>
                        </Box>
                    </Stack>
                  </Box>

              {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Powered by CTDRU • Secure & Reliable
                  </Typography>
                </Box>
              </Card>
            </Box>
        </Box>
      </Container>
      </Box>
    </Box>
  );
};

export default LoginPage;