import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  useMediaQuery,
  useTheme,
  Slide
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import WakilibotLogo from './WakilibotLogo';

const TopNav = ({ 
  pageTitle = "Wakilibot",
  showAuthButtons = true,
  onHome,
  onFeatures,
  onHowItWorks,
  onAboutUs,
  onLogin,
  onSignup
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      {/* Professional Navigation Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            py: 2,
            px: { xs: 2, md: 0 }
          }}>
            
            {/* Logo Section - Extreme Left */}
            <WakilibotLogo 
              size={48}
              showText={true}
              variant="full"
              onClick={onHome}
            />

            {/* Desktop Navigation - Extreme Right */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Navigation Links */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 3 }}>
                  {onHome && (
                    <Button 
                      sx={{ 
                        color: '#ffffff', 
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#1976d2',
                          transform: 'translateY(-1px)'
                        }
                      }}
                      onClick={onHome}
                    >
                      Home
                    </Button>
                  )}
                  {onFeatures && (
                    <Button 
                      sx={{ 
                        color: '#ffffff', 
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#1976d2',
                          transform: 'translateY(-1px)'
                        }
                      }}
                      onClick={onFeatures}
                    >
                      Features
                    </Button>
                  )}
                  {onHowItWorks && (
                    <Button 
                      sx={{ 
                        color: '#ffffff', 
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#1976d2',
                          transform: 'translateY(-1px)'
                        }
                      }}
                      onClick={onHowItWorks}
                    >
                      How it Works
                    </Button>
                  )}
                  {onAboutUs && (
                    <Button 
                      sx={{ 
                        color: '#ffffff', 
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#1976d2',
                          transform: 'translateY(-1px)'
                        }
                      }}
                      onClick={onAboutUs}
                    >
                      About Us
                    </Button>
                  )}
                </Box>

                {/* Auth Buttons */}
                {showAuthButtons && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {onLogin && (
                      <Button
                        variant="outlined"
                        onClick={onLogin}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            color: '#1976d2',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.2)'
                          }
                        }}
                      >
                        Login
                      </Button>
                    )}
                    {onSignup && (
                      <Button
                        variant="contained"
                        onClick={onSignup}
                        sx={{
                          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                          color: '#ffffff',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 25px rgba(25, 118, 210, 0.4)'
                          }
                        }}
                      >
                        Sign Up
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{ 
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Box>
        </Container>
      </Box>

      {/* Professional Mobile Menu */}
      <Slide direction="down" in={isMobile && mobileMenuOpen} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            top: 88,
            left: 0,
            right: 0,
            zIndex: 999,
            background: 'rgba(0, 0, 0, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            py: 3
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {onHome && (
                <Button 
                  sx={{ 
                    color: '#ffffff', 
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#1976d2',
                      transform: 'translateX(8px)'
                    }
                  }}
                  onClick={() => {
                    onHome();
                    setMobileMenuOpen(false);
                  }}
                >
                  Home
                </Button>
              )}
              {onFeatures && (
                <Button 
                  sx={{ 
                    color: '#ffffff', 
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#1976d2',
                      transform: 'translateX(8px)'
                    }
                  }}
                  onClick={() => {
                    onFeatures();
                    setMobileMenuOpen(false);
                  }}
                >
                  Features
                </Button>
              )}
              {onHowItWorks && (
                <Button 
                  sx={{ 
                    color: '#ffffff', 
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#1976d2',
                      transform: 'translateX(8px)'
                    }
                  }}
                  onClick={() => {
                    onHowItWorks();
                    setMobileMenuOpen(false);
                  }}
                >
                  How it Works
                </Button>
              )}
              {onAboutUs && (
                <Button 
                  sx={{ 
                    color: '#ffffff', 
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#1976d2',
                      transform: 'translateX(8px)'
                    }
                  }}
                  onClick={() => {
                    onAboutUs();
                    setMobileMenuOpen(false);
                  }}
                >
                  About Us
                </Button>
              )}
              
              {/* Mobile Auth Buttons */}
              {showAuthButtons && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {onLogin && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        onLogin();
                        setMobileMenuOpen(false);
                      }}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3,
                        py: 2,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#1976d2',
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          color: '#1976d2'
                        }
                      }}
                    >
                      Login
                    </Button>
                  )}
                  {onSignup && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        onSignup();
                        setMobileMenuOpen(false);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 2,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                          boxShadow: '0 6px 25px rgba(25, 118, 210, 0.4)'
                        }
                      }}
                    >
                      Sign Up
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Container>
        </Box>
      </Slide>
    </>
  );
};

export default TopNav;
