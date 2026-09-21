import React from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import {
  Shield as ShieldIcon,
  SmartToy as SmartToyIcon,
  AccessibilityNew as AccessIcon,
  Translate as LanguageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import TopNav from './TopNav';
import { tokens } from '../styles/theme';

const asset = (name) => `${process.env.PUBLIC_URL || ''}/topics/${name}`;

const values = [
  {
    icon: <ShieldIcon />,
    title: 'Complaint capture',
    body: 'Structured intake for MoMo, banking, and telecom disputes—so CTDRU receives clear, actionable cases.',
  },
  {
    icon: <SmartToyIcon />,
    title: 'Fraud response',
    body: 'Urgent guidance for phishing, SIM-swap, PIN theft, and unauthorized wallet or card activity.',
  },
  {
    icon: <AccessIcon />,
    title: 'Accessible channels',
    body: 'Web chat, SMS, USSD, and feature phones—so help reaches people beyond smartphones.',
  },
  {
    icon: <LanguageIcon />,
    title: 'Local languages',
    body: 'Support for English and Ugandan languages so more households can file and follow up.',
  },
];

const contacts = [
  {
    icon: <PhoneIcon />,
    title: 'Phone',
    detail: '+256-41-4230060',
    note: 'CTDRU consumer support line',
  },
  {
    icon: <EmailIcon />,
    title: 'Email',
    detail: 'ctdru@bou.or.ug',
    note: 'Detailed inquiries and follow-up',
  },
  {
    icon: <PublicIcon />,
    title: 'Website',
    detail: 'www.bou.or.ug',
    note: 'Bank of Uganda · Consumer Affairs',
  },
];

const AboutUsPage = ({ onBack, onLogin, onSignup, onHowItWorks, onStartChat }) => (
  <Box sx={{ minHeight: '100vh', background: tokens.paper, color: tokens.navy }}>
    <TopNav
      onHome={onBack}
      onHowItWorks={onHowItWorks}
      onAboutUs={onBack}
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
          About Wakilibot
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: { xs: '1.05rem', md: '1.15rem' },
            maxWidth: 560,
            lineHeight: 1.65,
          }}
        >
          Wakilibot is CTDRU’s AI assistant for financial consumer protection in Uganda—
          focused on capturing complaints and helping people respond to fraud.
        </Typography>
      </Container>
    </Box>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
        background: tokens.sand,
      }}
    >
      <Box
        component="img"
        src={asset('file-complaint.jpg')}
        alt="Preparing a financial consumer complaint with phone and form"
        loading="lazy"
        sx={{
          width: '100%',
          height: { xs: 260, md: '100%' },
          minHeight: { md: 360 },
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 5, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.1rem' }, mb: 1.5 }}>
          Our mission
        </Typography>
        <Typography sx={{ color: tokens.muted, lineHeight: 1.7, maxWidth: 440 }}>
          Make complaint filing and fraud reporting practical—on smartphone, feature phone,
          SMS, or USSD—with Uganda’s financial context in mind.
        </Typography>
      </Box>
    </Box>

    <Box sx={{ py: { xs: 7, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: '1.7rem', md: '2.1rem' }, mb: 1.5, maxWidth: 480 }}
        >
          What we focus on
        </Typography>
        <Typography sx={{ color: tokens.muted, mb: 5, maxWidth: 600, lineHeight: 1.7 }}>
          Every conversation is built to turn a messy incident into a clear complaint or a
          fast fraud response.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 5 },
          }}
        >
          {values.map((item) => (
            <Box key={item.title} sx={{ borderTop: `2px solid ${tokens.gold}`, pt: 2.5 }}>
              <Box sx={{ color: tokens.navy, mb: 1.5, '& svg': { fontSize: 28 } }}>
                {item.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  mb: 1,
                }}
              >
                {item.title}
              </Typography>
              <Typography sx={{ color: tokens.muted, lineHeight: 1.65 }}>
                {item.body}
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
          Contact CTDRU
        </Typography>
        <Typography sx={{ color: tokens.muted, mb: 4, maxWidth: 520 }}>
          For urgent or complex matters, reach Consumer Affairs directly.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {contacts.map((c) => (
            <Box
              key={c.title}
              sx={{
                background: tokens.paperElevated,
                border: `1px solid ${tokens.line}`,
                borderRadius: 3,
                p: 3,
              }}
            >
              <Box sx={{ color: tokens.gold, mb: 1.5, '& svg': { fontSize: 26 } }}>
                {c.icon}
              </Box>
              <Typography sx={{ fontWeight: 650, mb: 0.5 }}>{c.title}</Typography>
              <Typography sx={{ fontWeight: 600, color: tokens.navy, mb: 0.75 }}>
                {c.detail}
              </Typography>
              <Typography sx={{ color: tokens.muted, fontSize: '0.92rem' }}>
                {c.note}
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
            maxWidth: 520,
          }}
        >
          Ready to file or report?
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 3.5, maxWidth: 480 }}>
          Start as a guest, or sign in if you already have an account.
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

export default AboutUsPage;
