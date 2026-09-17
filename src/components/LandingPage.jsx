import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowForward as ArrowIcon, Security as SecurityIcon, Speed as SpeedIcon, Support as SupportIcon, Gavel as GavelIcon } from '@mui/icons-material';
import WakilibotLogo from './WakilibotLogo';
import TopNav from './TopNav';

const LandingPage = ({ onSignup, onLogin, onFeatures, onHowItWorks, onAboutUs, onHome, onDebug }) => {
  const stats = [
    { number: '10K+', label: 'Users Helped', icon: <SecurityIcon sx={{ fontSize: 40 }} /> },
    { number: '95%', label: 'Success Rate', icon: <SpeedIcon sx={{ fontSize: 40 }} /> },
    { number: '24/7', label: 'Support', icon: <SupportIcon sx={{ fontSize: 40 }} /> },
    { number: '100%', label: 'Legal Compliance', icon: <GavelIcon sx={{ fontSize: 40 }} /> }
  ];

  return (
    <Box sx={{ backgroundColor: '#000000', color: '#ffffff' }}>
      {/* Top Navigation */}
      <TopNav 
        onHome={onHome}
        onFeatures={onFeatures}
        onHowItWorks={onHowItWorks}
        onAboutUs={onAboutUs}
        onLogin={onLogin}
        onSignup={onSignup}
      />

      {/* Hero Section */}
      <Box sx={{
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        marginTop: { xs: '-20px', md: '-40px' },
        background: '#000000'
      }}>
        <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: 'center', px: { xs: 3, md: 4 }, py: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', gap: { xs: 2, md: 3 } }}>
            
            {/* Left Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      fontWeight: 800,
                      mb: 2,
                      background: 'linear-gradient(45deg, #ffffff 30%, #1976d2 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1
                    }}
                  >
                    Meet Wakilibot
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2.5rem' },
                      color: '#1976d2',
                      mb: 3,
                      fontWeight: 600,
                      lineHeight: 1.2
                    }}
                  >
                    Your AI Consumer Protection Assistant
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#cccccc',
                      mb: 5,
                      fontWeight: 400,
                      lineHeight: 1.6,
                      maxWidth: 600,
                      fontSize: { xs: '1.1rem', md: '1.3rem' }
                    }}
                  >
                    Get instant help with complaints, consumer rights, and legal guidance. Powered by CTDRU's advanced AI technology.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowIcon />}
                      onClick={onSignup}
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontSize: '18px',
                        px: 5,
                        py: 2,
                        borderRadius: 3,
                        boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)'
                        }
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: '#444444',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontSize: '18px',
                        px: 5,
                        py: 2,
                        borderRadius: 3,
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#666666',
                          backgroundColor: '#333333',
                          borderWidth: 2,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Learn More
                    </Button>
                    {onDebug && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={onDebug}
                        sx={{
                          color: '#888888',
                          textTransform: 'none',
                          fontSize: '12px',
                          mt: 2,
                          '&:hover': {
                            color: '#ffffff',
                            backgroundColor: '#333333'
                          }
                        }}
                      >
                        🔧 Debug Conversations
                      </Button>
                    )}
                  </Box>
                </Box>
            </Box>
            
            {/* Phones Container */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              gap: { xs: 2, sm: 3, md: 4 },
              flex: 1,
              minWidth: 0,
              flexDirection: 'column'
            }}>
              
              {/* Phones Row */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3, md: 4 }
              }}>
                {/* Nokia Button Phone */}
                <Box sx={{
                  position: 'relative',
                  width: { xs: 100, sm: 125, md: 150 },
                  height: { xs: 210, sm: 262, md: 315 },
                  background: '#1a1a1a',
                  borderRadius: { xs: 4, sm: 6, md: 8 },
                  border: '3px solid #333333',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                  zIndex: 8
                }}>
                  {/* Nokia Screen */}
                  <Box sx={{
                      width: '100%',
                    height: '50%',
                    background: '#000000',
                    borderRadius: { xs: 4, sm: 6, md: 8 },
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
                      p: 1
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#00ff00', 
                        fontFamily: 'monospace',
                        fontSize: { xs: '6px', md: '8px' },
                        textAlign: 'center',
                        mb: 0.5
                      }}>
                        Wakilibot SMS
                      </Typography>
                      <Box sx={{
                        background: '#003300',
                        borderRadius: 1,
                        p: 0.5,
                        width: '90%',
                        mb: 0.5
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#00ff00', 
                          fontFamily: 'monospace',
                          fontSize: { xs: '6px', md: '8px' },
                          textAlign: 'left',
                          lineHeight: 1.2
                        }}>
                          Hello! I'm Wakilibot, your legal assistant. How can I help you today?
                        </Typography>
                      </Box>
                      <Box sx={{
                        background: '#001a00',
                        borderRadius: 1,
                        p: 0.5,
                        width: '90%',
                        alignSelf: 'flex-end'
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#00ff00', 
                          fontFamily: 'monospace',
                          fontSize: { xs: '6px', md: '8px' },
                          textAlign: 'right',
                          lineHeight: 1.2
                        }}>
                          I need legal help
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
                    p: 1
                  }}>
                    {/* Number Pad */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 0.5,
                      width: '90%',
                      mb: 1
                    }}>
                      {/* Numbers 1-9 */}
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                        <Box key={num} sx={{
                          width: { xs: 16, md: 20 },
                          height: { xs: 16, md: 20 },
                          background: '#444444',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': { background: '#555555' }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#ffffff', 
                            fontSize: { xs: '8px', md: '10px' },
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
                      width: '90%',
                      alignItems: 'center'
                    }}>
                      <Box sx={{
                        width: { xs: 16, md: 20 },
                        height: { xs: 16, md: 20 },
                        background: '#444444',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { background: '#555555' }
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#ffffff', 
                          fontSize: { xs: '6px', md: '8px' },
                          fontWeight: 'bold'
                        }}>
                          *
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: { xs: 16, md: 20 },
                        height: { xs: 16, md: 20 },
                        background: '#444444',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { background: '#555555' }
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#ffffff', 
                          fontSize: { xs: '8px', md: '10px' },
                          fontWeight: 'bold'
                        }}>
                          0
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: { xs: 16, md: 20 },
                        height: { xs: 16, md: 20 },
                        background: '#444444',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { background: '#555555' }
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#ffffff', 
                          fontSize: { xs: '6px', md: '8px' },
                          fontWeight: 'bold'
                        }}>
                          #
                        </Typography>
                      </Box>
                    </Box>

                    {/* Nokia Brand */}
                    <Typography variant="caption" sx={{ 
                      color: '#666666', 
                      fontSize: { xs: '5px', md: '6px' },
                      mt: 0.5,
                      fontWeight: 'bold'
                    }}>
                      NOKIA
                    </Typography>
                  </Box>
                </Box>

                {/* iPhone Chatbot Visual */}
                <Box sx={{ 
                      position: 'relative',
                  width: { xs: 160, sm: 200, md: 240 },
                  height: { xs: 280, sm: 350, md: 420 },
                  background: '#000000',
                  borderRadius: { xs: 3, md: 4 },
                  border: '8px solid #1a1a1a',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      overflow: 'hidden',
                  zIndex: 10
                }}>
                  {/* iPhone Screen */}
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    background: '#ffffff',
                    borderRadius: { xs: 2, md: 3 },
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {/* Status Bar */}
                    <Box sx={{
                      height: 30,
                      background: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 2,
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#000000'
                    }}>
                      <Box>9:41</Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ width: 15, height: 10, borderRadius: 1, background: '#000000' }} />
                        <Box sx={{ width: 20, height: 10, borderRadius: 1, background: '#000000' }} />
                      </Box>
                    </Box>

                    {/* Chat Header */}
                    <Box sx={{
                      height: 60,
                      background: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      gap: 2
                    }}>
                      <WakilibotLogo 
                        size={24}
                        showText={false}
                        variant="icon-only"
                      />
                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                        Wakilibot
                      </Typography>
                    </Box>

                    {/* Chat Messages */}
                    <Box sx={{
                      flex: 1,
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      height: 'calc(100% - 150px)',
                      overflow: 'hidden'
                    }}>
                      {/* Bot Message */}
                      <Box sx={{
                        alignSelf: 'flex-start',
                        maxWidth: '80%',
                        background: '#f5f5f5',
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5
                      }}>
                        <Typography variant="body2" sx={{ fontSize: '11px', lineHeight: 1.3 }}>
                          Hello! I'm Wakilibot, your legal assistant. How can I help you today?
                        </Typography>
                      </Box>

                      {/* User Message */}
                      <Box sx={{
                        alignSelf: 'flex-end',
                        maxWidth: '80%',
                        background: '#1976d2',
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5
                      }}>
                        <Typography variant="body2" sx={{ fontSize: '11px', lineHeight: 1.3, color: '#ffffff' }}>
                          I have a complaint about my mobile service provider
                        </Typography>
                      </Box>

                      {/* Bot Response */}
                      <Box sx={{
                        alignSelf: 'flex-start',
                        maxWidth: '80%',
                        background: '#f5f5f5',
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5
                      }}>
                        <Typography variant="body2" sx={{ fontSize: '11px', lineHeight: 1.3 }}>
                          I can help you with that! Let me gather some information about your complaint...
                        </Typography>
                      </Box>

                      {/* Typing Indicator */}
                      <Box sx={{
                        alignSelf: 'flex-start',
                        background: '#f5f5f5',
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <Box sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: '#666666',
                          animation: 'typing 1.4s infinite ease-in-out'
                        }} />
                        <Box sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: '#666666',
                          animation: 'typing 1.4s infinite ease-in-out 0.2s'
                        }} />
                        <Box sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: '#666666',
                          animation: 'typing 1.4s infinite ease-in-out 0.4s'
                        }} />
                      </Box>
                    </Box>

                    {/* Input Area */}
                    <Box sx={{
                      height: 45,
                      background: '#ffffff',
                      borderTop: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      gap: 1
                    }}>
                      <Box sx={{
                        flex: 1,
                        height: 30,
                        background: '#f5f5f5',
                        borderRadius: 15,
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        fontSize: '12px',
                        color: '#666666'
                      }}>
                        Type a message...
                      </Box>
                      <Box sx={{
                        width: 30,
                        height: 30,
                        background: '#1976d2',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}>
                        <ArrowIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                      </Box>
                    </Box>
                  </Box>

                  {/* iPhone Home Indicator */}
                  <Box sx={{
                        position: 'absolute',
                    bottom: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 40,
                    height: 4,
                    background: '#ffffff',
                    borderRadius: 2,
                    opacity: 0.3
                  }} />
                </Box>
              </Box>

              {/* Circular Features Row - Below Phones */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3, md: 4 },
                mt: { xs: 2, sm: 3, md: 4 }
              }}>
                {/* Voice-to-Voice Circle */}
                <Box sx={{
                  width: { xs: 60, sm: 70, md: 80 },
                  height: { xs: 60, sm: 70, md: 80 },
                          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 5
                }}>
                  <Box sx={{ fontSize: { xs: 16, md: 18 }, color: '#ffffff', mb: 0.5 }}>🎤</Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '7px', md: '9px' }, textAlign: 'center' }}>
                    Voice-to-Voice
                      </Typography>
                </Box>

                {/* IVR Circle */}
                <Box sx={{
                  width: { xs: 60, sm: 70, md: 80 },
                  height: { xs: 60, sm: 70, md: 80 },
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 5
                }}>
                  <Box sx={{ fontSize: { xs: 16, md: 18 }, color: '#ffffff', mb: 0.5 }}>📞</Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '7px', md: '9px' }, textAlign: 'center' }}>
                    IVR Support
                      </Typography>
                    </Box>

                {/* USSD Circle */}
                <Box sx={{
                  width: { xs: 60, sm: 70, md: 80 },
                  height: { xs: 60, sm: 70, md: 80 },
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 5
                }}>
                  <Box sx={{ fontSize: { xs: 16, md: 18 }, color: '#ffffff', mb: 0.5 }}>📱</Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '7px', md: '9px' }, textAlign: 'center' }}>
                    USSD Access
                  </Typography>
                  </Box>

                {/* Messaging Circle */}
                <Box sx={{
                  width: { xs: 60, sm: 70, md: 80 },
                  height: { xs: 60, sm: 70, md: 80 },
                  background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(156, 39, 176, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 5
                }}>
                  <Box sx={{ fontSize: { xs: 16, md: 18 }, color: '#ffffff', mb: 0.5 }}>💬</Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: { xs: '7px', md: '9px' }, textAlign: 'center' }}>
                    Messaging
                  </Typography>
                </Box>
              </Box>
            </Box>
            
          </Box>
        </Container>
        
        {/* Scroll Indicator */}
        <Box sx={{
          position: 'absolute',
          bottom: { xs: 25, md: 30 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          animation: 'bounce 2s infinite'
        }}>
          <Box sx={{
            width: 30,
            height: 30,
            border: '2px solid #ffffff',
            borderTop: 'none',
            borderRight: 'none',
            transform: 'rotate(-45deg)',
            opacity: 0.7
          }} />
        </Box>
      </Box>

      {/* Stats Section */}
      <Box sx={{
        py: { xs: 6, md: 8 },
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        borderTop: '1px solid #333333'
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 3, md: 4 },
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {stats.map((stat, index) => (
              <Box key={index} sx={{
                        display: 'flex',
                flexDirection: 'column',
                        alignItems: 'center',
                textAlign: 'center',
                minWidth: { xs: '150px', md: '200px' },
                p: 3,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                }
              }}>
                <Box sx={{ color: '#1976d2', mb: 2 }}>
                      {stat.icon}
                    </Box>
                <Typography variant="h3" sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 800,
                  color: '#ffffff',
                  mb: 1,
                  background: 'linear-gradient(45deg, #1976d2 30%, #ffffff 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                      {stat.number}
                    </Typography>
                <Typography variant="h6" sx={{
                  color: '#cccccc',
                  fontWeight: 500,
                  fontSize: { xs: '1rem', md: '1.2rem' }
                }}>
                      {stat.label}
                    </Typography>
                  </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        background: '#000000'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              mb: 3,
              background: 'linear-gradient(45deg, #ffffff 30%, #1976d2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Why Choose Wakilibot?
            </Typography>
            <Typography variant="h5" sx={{
              color: '#cccccc',
              fontWeight: 400,
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Advanced AI technology meets legal expertise to provide comprehensive consumer protection
            </Typography>
          </Box>
          
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 4, md: 6 },
            justifyContent: 'center'
          }}>
            {[
              {
                title: 'Instant Legal Guidance',
                description: 'Get immediate answers to your legal questions with our advanced AI system trained on consumer protection laws.',
                icon: '⚖️'
              },
              {
                title: 'Multi-Channel Support',
                description: 'Access Wakilibot through web chat, voice calls, IVR, and USSD - whatever works best for you.',
                icon: '📱'
              },
              {
                title: '24/7 Availability',
                description: 'Round-the-clock assistance ensures you never have to wait for legal help when you need it most.',
                icon: '🕒'
              },
              {
                title: 'CTDRU Backed',
                description: 'Powered by the Consumer Tribunal and Dispute Resolution Unit for authoritative legal guidance.',
                icon: '🏛️'
              }
            ].map((feature, index) => (
              <Box key={index} sx={{
                flex: '1 1 300px',
                maxWidth: '400px',
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                      border: '1px solid #333333',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                      '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 20px 40px rgba(25, 118, 210, 0.2)',
                  borderColor: '#1976d2'
                }
              }}>
                <Box sx={{ fontSize: '3rem', mb: 3 }}>
                        {feature.icon}
                      </Box>
                <Typography variant="h5" sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.3rem', md: '1.5rem' }
                }}>
                        {feature.title}
                      </Typography>
                <Typography variant="body1" sx={{
                  color: '#cccccc',
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}>
                      {feature.description}
                    </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        borderTop: '1px solid #333333'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              mb: 3,
              color: '#ffffff'
            }}>
              What Users Say
            </Typography>
            <Typography variant="h5" sx={{
              color: '#cccccc',
              fontWeight: 400,
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Real stories from people who found justice with Wakilibot
            </Typography>
          </Box>
          
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 4, md: 6 },
            justifyContent: 'center'
          }}>
            {[
              {
                name: 'Sarah M.',
                role: 'Consumer',
                content: 'Wakilibot helped me resolve my telecom dispute in just 2 days. The AI understood my complaint perfectly and guided me through the entire process.',
                rating: 5
              },
              {
                name: 'John K.',
                role: 'Small Business Owner',
                content: 'As a small business owner, I needed quick legal advice. Wakilibot provided instant guidance that saved me thousands in legal fees.',
                rating: 5
              },
              {
                name: 'Maria L.',
                role: 'Student',
                content: 'The USSD feature is amazing! I could access legal help even with my basic phone. Wakilibot made justice accessible to everyone.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Box key={index} sx={{
                flex: '1 1 350px',
                maxWidth: '450px',
                p: 4,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)'
                }
              }}>
                <Box sx={{ display: 'flex', mb: 3 }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Box key={i} sx={{ color: '#ffd700', fontSize: '1.2rem' }}>⭐</Box>
                  ))}
                </Box>
                <Typography variant="body1" sx={{
                  color: '#ffffff',
                  lineHeight: 1.6,
                  mb: 3,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontStyle: 'italic'
                }}>
                  "{testimonial.content}"
                </Typography>
                      <Box>
                  <Typography variant="h6" sx={{
                    color: '#1976d2',
                    fontWeight: 600,
                    mb: 0.5
                  }}>
                          {testimonial.name}
                        </Typography>
                  <Typography variant="body2" sx={{
                    color: '#cccccc',
                    fontWeight: 400
                  }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                      ))}
                    </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{
        py: { xs: 8, md: 12 },
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 800,
            color: '#ffffff',
            mb: 3
          }}>
            Ready to Get Started?
              </Typography>
          <Typography variant="h5" sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 400,
            mb: 5,
            lineHeight: 1.6
          }}>
            Join thousands of users who have found justice with Wakilibot
              </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={onSignup}
                sx={{
                background: '#ffffff',
                  color: '#1976d2',
                  textTransform: 'none',
                fontSize: '18px',
                px: 5,
                py: 2,
                borderRadius: 3,
                  fontWeight: 600,
                  '&:hover': {
                  background: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-2px)'
                  }
                }}
              >
              Start Free Trial
              </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={onFeatures}
                sx={{
                borderColor: '#ffffff',
                color: '#ffffff',
                textTransform: 'none',
                fontSize: '18px',
                px: 5,
                py: 2,
                borderRadius: 3,
                borderWidth: 2,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 2
                }
              }}
            >
              Learn More
              </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{
        py: { xs: 6, md: 8 },
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        borderTop: '1px solid #333333'
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: { xs: 4, md: 6 }
          }}>
            {/* Logo and Description */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: { xs: '100%', md: '300px' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 2 }}>
                <WakilibotLogo size={32} showText={true} variant="full" />
              </Box>
              <Typography variant="body2" sx={{
                color: '#cccccc',
                lineHeight: 1.6,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}>
                Your AI-powered legal assistant for consumer protection and dispute resolution.
              </Typography>
            </Box>

            {/* Quick Links */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 2,
                fontSize: { xs: '1.1rem', md: '1.2rem' }
              }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="text"
                  onClick={onFeatures}
                sx={{
                    color: '#cccccc',
                    textTransform: 'none',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    fontSize: '0.9rem',
                    '&:hover': { color: '#1976d2' }
                  }}
                >
                  Features
                </Button>
                <Button
                  variant="text"
                  onClick={onHowItWorks}
                  sx={{
                    color: '#cccccc',
                    textTransform: 'none',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    fontSize: '0.9rem',
                    '&:hover': { color: '#1976d2' }
                  }}
                >
                  How It Works
                </Button>
                <Button
                  variant="text"
                  onClick={onAboutUs}
                  sx={{
                    color: '#cccccc',
                    textTransform: 'none',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    fontSize: '0.9rem',
                    '&:hover': { color: '#1976d2' }
                  }}
                >
                  About Us
                </Button>
              </Box>
            </Box>

            {/* Contact Info */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 2,
                fontSize: { xs: '1.1rem', md: '1.2rem' }
              }}>
                Contact
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>
                  📧 support@wakilibot.com
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>
                  📱 *123# (USSD)
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>
                  🌐 www.wakilibot.com
              </Typography>
            </Box>
            </Box>
          </Box>

          {/* Bottom Bar */}
          <Box sx={{
            mt: 4,
            pt: 4,
            borderTop: '1px solid #333333',
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{
              color: '#888888',
              fontSize: '0.8rem'
            }}>
              © 2024 Wakilibot. Powered by CTDRU. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* CSS Animations */}
      <style jsx="true">{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Box>
  );
};

export default LandingPage;