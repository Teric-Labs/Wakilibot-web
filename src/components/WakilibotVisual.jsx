import React from 'react';
import { Box, Typography } from '@mui/material';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';
import WakilibotLogo from './WakilibotLogo';

const WakilibotVisual = ({ size = 'medium' }) => {
  const sizeMultiplier = size === 'small' ? 0.7 : size === 'large' ? 1.2 : 1;
  
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: { xs: 2, sm: 3, md: 4 },
      flex: 1,
      minWidth: 0
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
          width: { xs: 100 * sizeMultiplier, sm: 125 * sizeMultiplier, md: 150 * sizeMultiplier },
          height: { xs: 210 * sizeMultiplier, sm: 262 * sizeMultiplier, md: 315 * sizeMultiplier },
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
          width: { xs: 160 * sizeMultiplier, sm: 200 * sizeMultiplier, md: 240 * sizeMultiplier },
          height: { xs: 280 * sizeMultiplier, sm: 350 * sizeMultiplier, md: 420 * sizeMultiplier },
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
          width: { xs: 60 * sizeMultiplier, sm: 70 * sizeMultiplier, md: 80 * sizeMultiplier },
          height: { xs: 60 * sizeMultiplier, sm: 70 * sizeMultiplier, md: 80 * sizeMultiplier },
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
          width: { xs: 60 * sizeMultiplier, sm: 70 * sizeMultiplier, md: 80 * sizeMultiplier },
          height: { xs: 60 * sizeMultiplier, sm: 70 * sizeMultiplier, md: 80 * sizeMultiplier },
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
          width: { xs: 60 * sizeMultiplier, sm: 70 * sizeMultiplier, md: 80 * sizeMultiplier },
          height: { xs: 60 * sizeMultiplier, sm: 70 * sizeMultiplier, md: 80 * sizeMultiplier },
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
          width: { xs: 60 * sizeMultiplier, sm: 70 * sizeMultiplier, md: 80 * sizeMultiplier },
          height: { xs: 60 * sizeMultiplier, sm: 70 * sizeMultiplier, md: 80 * sizeMultiplier },
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
  );
};

export default WakilibotVisual;
