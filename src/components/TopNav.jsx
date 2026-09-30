import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer,
  Stack,
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import WakilibotLogo from './WakilibotLogo';
import { tokens } from '../styles/theme';

const navLinkSx = {
  color: tokens.navy,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.98rem',
  px: 1.5,
  minWidth: 0,
  '&:hover': {
    backgroundColor: 'transparent',
    color: tokens.navyMid,
  },
};

const TopNav = ({
  showAuthButtons = true,
  onHome,
  onHowItWorks,
  onAboutUs,
  onLogin,
  onSignup,
  onStartChat,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const closeMobile = () => setMobileOpen(false);

  const links = [
    { label: 'How it works', onClick: onHowItWorks },
    { label: 'About', onClick: onAboutUs },
  ].filter((item) => item.onClick);

  return (
    <>
      <Box
        component="header"
        className="wakili-nav-in"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          background: 'rgba(247, 244, 239, 0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${tokens.line}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 72,
              py: 1,
            }}
          >
            <WakilibotLogo size={42} showText onClick={onHome} />

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {links.map((link) => (
                  <Button key={link.label} sx={navLinkSx} onClick={link.onClick}>
                    {link.label}
                  </Button>
                ))}
                {showAuthButtons && onLogin && (
                  <Button sx={{ ...navLinkSx, ml: 1 }} onClick={onLogin}>
                    Sign in
                  </Button>
                )}
                {showAuthButtons && (onStartChat || onSignup) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onStartChat || onSignup}
                    sx={{ ml: 1.5 }}
                  >
                    Start chatting
                  </Button>
                )}
              </Box>
            )}

            {isMobile && (
              <IconButton
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                sx={{ color: tokens.navy }}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Box>
        </Container>
      </Box>

      <Drawer
        anchor="top"
        open={isMobile && mobileOpen}
        onClose={closeMobile}
        PaperProps={{
          sx: {
            mt: '72px',
            background: tokens.paperElevated,
            borderBottom: `1px solid ${tokens.line}`,
            boxShadow: '0 12px 32px rgba(11,31,58,0.08)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2.5 }}>
          <Stack spacing={1}>
            {links.map((link) => (
              <Button
                key={link.label}
                fullWidth
                sx={{ ...navLinkSx, justifyContent: 'flex-start', py: 1.5 }}
                onClick={() => {
                  link.onClick();
                  closeMobile();
                }}
              >
                {link.label}
              </Button>
            ))}
            {showAuthButtons && onLogin && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  onLogin();
                  closeMobile();
                }}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Sign in
              </Button>
            )}
            {showAuthButtons && (onStartChat || onSignup) && (
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  (onStartChat || onSignup)();
                  closeMobile();
                }}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Start chatting
              </Button>
            )}
          </Stack>
        </Container>
      </Drawer>
    </>
  );
};

export default TopNav;
