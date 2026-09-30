import React from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import {
  Chat as ChatIcon,
  PhoneAndroid as SmartphoneIcon,
  Sms as SmsIcon,
  Dialpad as UssdIcon,
  Phone as FeaturePhoneIcon,
} from '@mui/icons-material';
import TopNav from './TopNav';
import { tokens } from '../styles/theme';

const asset = (name) => `${process.env.PUBLIC_URL || ''}/topics/${name}`;

const steps = [
  {
    number: '01',
    title: 'Describe the incident',
    body: 'Tell Wakilibot about the MoMo transfer, bank charge, fraud alert, or service failure—in English or a Ugandan language.',
    image: asset('momo-dispute.jpg'),
  },
  {
    number: '02',
    title: 'Capture evidence & next steps',
    body: 'Gather transaction IDs, dates, and amounts. Receive practical guidance grounded in CTDRU processes.',
    image: asset('file-complaint.jpg'),
  },
  {
    number: '03',
    title: 'File, track, or escalate fraud',
    body: 'Submit a complaint, check status, or escalate when a human officer or urgent fraud response is needed.',
    image: asset('fraud-report.jpg'),
  },
];

const channels = [
  {
    icon: <ChatIcon />,
    title: 'Web chat',
    body: 'Full conversation on smartphone or computer—best for detailed issues and documents.',
  },
  {
    icon: <SmartphoneIcon />,
    title: 'Smartphone',
    body: 'Use Wakilibot in the browser wherever you have data or Wi‑Fi.',
  },
  {
    icon: <SmsIcon />,
    title: 'SMS',
    body: 'Short questions and updates when mobile data is limited.',
  },
  {
    icon: <UssdIcon />,
    title: 'USSD',
    body: 'Menu-driven help and status checks from any mobile network handset.',
  },
  {
    icon: <FeaturePhoneIcon />,
    title: 'Feature phone',
    body: 'Access pathways designed for basic handsets common across Uganda.',
  },
];

const HowItWorksPage = ({ onBack, onLogin, onSignup, onAboutUs, onStartChat }) => (
  <Box sx={{ minHeight: '100vh', background: tokens.paper, color: tokens.navy }}>
    <TopNav
      onHome={onBack}
      onHowItWorks={onBack}
      onAboutUs={onAboutUs}
      onLogin={onLogin}
      onSignup={onSignup}
      onStartChat={onStartChat}
    />

    <Box
      sx={{
        pt: { xs: 14, md: 16 },
        pb: { xs: 7, md: 9 },
        background: `linear-gradient(160deg, ${tokens.navy} 0%, ${tokens.navyMid} 55%, #1a3a5c 100%)`,
        color: '#fff',
      }}
    >
      <Container maxWidth="lg" className="wakili-fade-up">
        <Typography
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: { xs: '2.2rem', md: '3rem' },
            fontWeight: 600,
            letterSpacing: '-0.02em',
            mb: 1.5,
            maxWidth: 640,
          }}
        >
          How Wakilibot works
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: { xs: '1.05rem', md: '1.15rem' },
            maxWidth: 560,
            lineHeight: 1.65,
          }}
        >
          From incident to CTDRU-ready complaint—or urgent fraud escalation—using a
          standard legal intake method on web, SMS, USSD, or a basic phone.
        </Typography>
      </Container>
    </Box>

    <Box sx={{ py: { xs: 7, md: 10 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 4, md: 4 },
          }}
        >
          {steps.map((step) => (
            <Box key={step.number}>
              <Box
                sx={{
                  mb: 2.5,
                  height: 180,
                  overflow: 'hidden',
                  borderRadius: 2,
                }}
              >
                <Box
                  component="img"
                  src={step.image}
                  alt=""
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  color: tokens.gold,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 1.5,
                  letterSpacing: '0.06em',
                }}
              >
                {step.number}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: '1.35rem',
                  mb: 1,
                }}
              >
                {step.title}
              </Typography>
              <Typography sx={{ color: tokens.muted, lineHeight: 1.65 }}>
                {step.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>

    <Box sx={{ py: { xs: 7, md: 9 }, background: tokens.sand }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: '1.7rem', md: '2.1rem' }, mb: 1.5 }}
        >
          Choose how you reach us
        </Typography>
        <Typography sx={{ color: tokens.muted, mb: 4.5, maxWidth: 540 }}>
          The same consumer-protection help—delivered through channels people already use.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {channels.map((ch) => (
            <Box
              key={ch.title}
              sx={{
                background: tokens.paperElevated,
                border: `1px solid ${tokens.line}`,
                borderRadius: 3,
                p: 3,
                borderTop: `3px solid ${tokens.gold}`,
              }}
            >
              <Box sx={{ color: tokens.navy, mb: 1.5, '& svg': { fontSize: 28 } }}>
                {ch.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: '1.15rem',
                  mb: 0.75,
                }}
              >
                {ch.title}
              </Typography>
              <Typography sx={{ color: tokens.muted, lineHeight: 1.6, fontSize: '0.95rem' }}>
                {ch.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>

    <Box sx={{ py: { xs: 7, md: 8 }, background: tokens.navy, color: '#fff' }}>
      <Container maxWidth="lg">
        <Typography
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 600,
            mb: 1.5,
          }}
        >
          Start a complaint
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 3.5, maxWidth: 480 }}>
          Chat as a guest now, or sign in to save your case history.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={onStartChat || onSignup}
          >
            Start chatting
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={onLogin}
            sx={{
              borderColor: 'rgba(255,255,255,0.35)',
              color: '#fff',
              '&:hover': {
                borderColor: '#fff',
                background: 'rgba(255,255,255,0.06)',
              },
            }}
          >
            Sign in
          </Button>
        </Stack>
      </Container>
    </Box>
  </Box>
);

export default HowItWorksPage;
