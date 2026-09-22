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
  Stack,
  LinearProgress,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Slide,
  Zoom,
  Chip
} from '@mui/material';
import TopNav from './TopNav';
import WakilibotLogo from './WakilibotLogo';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowIcon,
  ArrowBack as BackIcon,
  PersonAdd as PersonAddIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import api from '../services/api';

const SignupPage = ({ onSignup, onBack, onSwitchToLogin, onFeatures, onHowItWorks, onAboutUs }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    language: 'en',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [stepAnimation, setStepAnimation] = useState(true);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        // Personal Information
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData.language) {
          newErrors.language = 'Please select a preferred language';
        }
        break;
        
      case 2:
        // Contact Information
    if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
        } else if (!/^\+?\d{9,15}$/.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.phone = 'Invalid phone number format';
    }
        break;
    
      case 3:
        // Password & Security
        if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
        if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    return validateStep(1) && validateStep(2) && validateStep(3);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setStepAnimation(false);
      setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        setStepAnimation(true);
      }, 150);
    }
  };

  const handleBack = () => {
    setStepAnimation(false);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
      setStepAnimation(true);
    }, 150);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      const result = await api.registerUser({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        language: formData.language
      });
      
      // API returns user data directly on successful registration
      onSignup(result);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.status === 400) {
        setSubmitError(error.response.data.detail || 'Invalid registration data. Please check your input.');
      } else if (error.response?.status === 409) {
        setSubmitError('An account with this email or phone number already exists.');
      } else {
        setSubmitError('Registration failed. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)
          `,
          zIndex: 0
        }
    }}>
      
      <TopNav 
        onHome={onBack}
        onFeatures={onFeatures}
        onHowItWorks={onHowItWorks}
        onAboutUs={onAboutUs}
        showAuthButtons={false}
      />
      
      <Fade in timeout={800}>
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

            {/* Right Side - Signup Form */}
            <Box sx={{ 
              flex: 1,
              maxWidth: { xs: '100%', lg: '450px' },
              order: { xs: 2, lg: 2 }
            }}>
              {/* Signup Form Card */}
              <Zoom in timeout={1000}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  p: 4,
                  maxWidth: '100%',
                  minHeight: 'auto',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    animation: 'shimmer 3s infinite'
                  },
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <WakilibotLogo size={40} showText={true} />
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: '#ffffff', 
                    mt: 1,
                    mb: 0.5,
                    background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Create Account
                          </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Join Wakilibot and start your legal protection journey
                          </Typography>
                      </Box>
                    
                {/* Error Display */}
                  {submitError && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {submitError}
                      </Alert>
                  )}

                {/* Multi-Step Signup Form */}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  {/* Progress Stepper */}
                  <Box sx={{ mb: 3 }}>
                    <Stepper activeStep={currentStep - 1} orientation="horizontal" sx={{ 
                      mb: 2,
                      '& .MuiStep-root': {
                        '& .MuiStepLabel-root': {
                          '& .MuiStepLabel-iconContainer': {
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.5rem',
                              color: 'rgba(255, 255, 255, 0.3)',
                              '&.Mui-active': {
                                color: '#ffffff',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                padding: '4px'
                              },
                              '&.Mui-completed': {
                                color: '#4caf50',
                                background: 'rgba(76, 175, 80, 0.1)',
                                borderRadius: '50%',
                                padding: '4px'
                              }
                            }
                          }
                        }
                      }
                    }}>
                    <Step>
                      <StepLabel sx={{ 
                        '& .MuiStepLabel-label': { color: 'rgba(255, 255, 255, 0.8)' },
                        '& .MuiStepLabel-label.Mui-active': { color: '#ffffff' },
                        '& .MuiStepLabel-label.Mui-completed': { color: '#ffffff' }
                      }}>
                        Personal Information
                      </StepLabel>
                    </Step>
                    <Step>
                      <StepLabel sx={{ 
                        '& .MuiStepLabel-label': { color: 'rgba(255, 255, 255, 0.8)' },
                        '& .MuiStepLabel-label.Mui-active': { color: '#ffffff' },
                        '& .MuiStepLabel-label.Mui-completed': { color: '#ffffff' }
                      }}>
                        Contact Information
                      </StepLabel>
                    </Step>
                    <Step>
                      <StepLabel sx={{ 
                        '& .MuiStepLabel-label': { color: 'rgba(255, 255, 255, 0.8)' },
                        '& .MuiStepLabel-label.Mui-active': { color: '#ffffff' },
                        '& .MuiStepLabel-label.Mui-completed': { color: '#ffffff' }
                      }}>
                        Password & Security
                      </StepLabel>
                    </Step>
                  </Stepper>

                  {/* Step Content */}
                  <Box sx={{ minHeight: '120px' }}>
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <Slide direction="right" in={stepAnimation} timeout={300}>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip 
                              label="Step 1" 
                              size="small" 
                              sx={{ 
                                background: 'rgba(255, 255, 255, 0.1)', 
                                color: '#ffffff',
                                fontWeight: 600
                              }} 
                            />
                            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                              Personal Information
                            </Typography>
                          </Box>
                        
                      {/* Full Name Field */}
                      <TextField
                          fullWidth
                          label="Full Name"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          error={!!errors.fullName}
                          helperText={errors.fullName}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: '#ffffff' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '8px 12px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.12)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)'
                              },
                              '& fieldset': {
                                border: 'none'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontWeight: 500
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'rgba(255, 255, 255, 0.9)',
                            },
                            '& .MuiOutlinedInput-input': {
                              color: '#ffffff',
                              fontWeight: 400
                            },
                            '& .MuiFormHelperText-root': {
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.75rem'
                            },
                          }}
                        />

                    {/* Language Selection */}
                        <TextField
                          fullWidth
                      select
                      label="Preferred Language"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      error={!!errors.language}
                      helperText={errors.language}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                            <LanguageIcon sx={{ color: '#ffffff' }} />
                              </InputAdornment>
                        ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '8px 12px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          },
                          '&.Mui-focused': {
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)'
                          },
                          '& fieldset': {
                            border: 'none'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 500
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgba(255, 255, 255, 0.9)',
                        },
                        '& .MuiOutlinedInput-input': {
                              color: '#ffffff',
                          fontWeight: 400
                        },
                        '& .MuiFormHelperText-root': {
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.75rem'
                        },
                        '& .MuiSelect-select': {
                          color: '#ffffff',
                        },
                        '& .MuiSelect-icon': {
                          color: '#ffffff',
                        },
                      }}
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                      <option value="fr">French</option>
                    </TextField>
                        </Stack>
                      </Slide>
                    )}

                    {/* Step 2: Contact Information */}
                    {currentStep === 2 && (
                      <Slide direction="right" in={stepAnimation} timeout={300}>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip 
                              label="Step 2" 
                              size="small" 
                              sx={{ 
                                background: 'rgba(255, 255, 255, 0.1)', 
                                color: '#ffffff',
                                fontWeight: 600
                              }} 
                            />
                            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                              Contact Information
                            </Typography>
                          </Box>

                      {/* Phone Field */}
                        <TextField
                          fullWidth
                          label="Phone Number"
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
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '8px 12px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.12)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                },
                                '&.Mui-focused': {
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)'
                                },
                                '& fieldset': {
                                  border: 'none'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 500
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                              },
                              '& .MuiOutlinedInput-input': {
                              color: '#ffffff',
                                fontWeight: 400
                              },
                              '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.75rem'
                              },
                            }}
                          />

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
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '8px 12px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.12)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                },
                                '&.Mui-focused': {
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)'
                                },
                                '& fieldset': {
                                  border: 'none'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 500
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                              },
                              '& .MuiOutlinedInput-input': {
                                color: '#ffffff',
                                fontWeight: 400
                              },
                              '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.75rem'
                              },
                            }}
                          />
                        </Stack>
                      </Slide>
                    )}

                    {/* Step 3: Password & Security */}
                    {currentStep === 3 && (
                      <Slide direction="right" in={stepAnimation} timeout={300}>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip 
                              label="Step 3" 
                              size="small" 
                              sx={{ 
                                background: 'rgba(255, 255, 255, 0.1)', 
                                color: '#ffffff',
                                fontWeight: 600
                              }} 
                            />
                            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                              Password & Security
                            </Typography>
                          </Box>

                      {/* Password Field */}
                        <Box>
                          <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                              onChange={handlePasswordChange}
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
                                  borderRadius: 3,
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  padding: '8px 12px',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.12)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                  },
                                  '&.Mui-focused': {
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)'
                                  },
                                  '& fieldset': {
                                    border: 'none'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontWeight: 500
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: 'rgba(255, 255, 255, 0.9)',
                                },
                                '& .MuiOutlinedInput-input': {
                                color: '#ffffff',
                                  fontWeight: 400
                                },
                                '& .MuiFormHelperText-root': {
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  fontSize: '0.75rem'
                                },
                              }}
                            />
                          {formData.password && (
                            <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={passwordStrength}
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: passwordStrength < 50 ? '#f44336' : passwordStrength < 75 ? '#ff9800' : '#4caf50'
                                    }
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5, display: 'block' }}>
                                  Password strength: {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                                </Typography>
                            </Box>
                          )}
                        </Box>

                      {/* Confirm Password Field */}
                        <TextField
                          fullWidth
                          label="Confirm Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword}
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
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '8px 12px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.12)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                },
                                '&.Mui-focused': {
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)'
                                },
                                '& fieldset': {
                                  border: 'none'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 500
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                              },
                              '& .MuiOutlinedInput-input': {
                              color: '#ffffff',
                                fontWeight: 400
                              },
                              '& .MuiFormHelperText-root': {
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.75rem'
                              },
                            }}
                          />

                      {/* Terms Agreement */}
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <input
                              type="checkbox"
                              checked={formData.agreeToTerms}
                              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                              style={{ marginTop: 4 }}
                            />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                              I agree to the{' '}
                              <Button
                                variant="text"
                                sx={{
                                  color: '#ffffff',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  p: 0,
                                  minWidth: 'auto',
                                  '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                  },
                                }}
                              >
                                Terms of Service
                              </Button>
                              {' '}and{' '}
                              <Button
                                variant="text"
                                sx={{
                                  color: '#ffffff',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  p: 0,
                                  minWidth: 'auto',
                                  '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                  },
                                }}
                              >
                                Privacy Policy
                              </Button>
                            </Typography>
                          </Box>
                        {errors.agreeToTerms && (
                            <FormHelperText error>{errors.agreeToTerms}</FormHelperText>
                        )}
                        </Stack>
                      </Slide>
                    )}
                  </Box>

                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
                        <Button
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      startIcon={<BackIcon />}
                      variant="outlined"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
                        },
                        '&:disabled': {
                          color: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Back
                    </Button>

                    {currentStep < totalSteps ? (
                      <Button
                        onClick={handleNext}
                        endIcon={<ArrowIcon />}
                          variant="contained"
                          sx={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                            textTransform: 'none',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)'
                          }
                        }}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                          color: '#ffffff',
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                            fontWeight: 600,
                          textTransform: 'none',
                          transition: 'all 0.3s ease',
                            '&:hover': {
                            background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                              transform: 'translateY(-2px)',
                            boxShadow: '0 12px 24px rgba(76, 175, 80, 0.4)'
                            },
                            '&:disabled': {
                            background: 'rgba(76, 175, 80, 0.3)',
                            transform: 'none'
                          }
                          }}
                        >
                          {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                              Creating Account...
                            </Box>
                          ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonAddIcon />
                            Create Account
                          </Box>
                          )}
                        </Button>
                    )}
                  </Box>
                </Box>
                </Box>

                {/* Switch to Login */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Already have an account?{' '}
                          <Button
                      variant="text"
                            onClick={onSwitchToLogin}
                            sx={{
                              color: '#ffffff',
                        fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            Sign In
                          </Button>
                  </Typography>
                        </Box>
              </Card>
              </Zoom>
            </Box>
        </Box>
      </Container>
        </Box>
      </Fade>
    </Box>
  );
};

export default SignupPage;