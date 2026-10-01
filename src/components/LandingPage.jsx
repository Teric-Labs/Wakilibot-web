import React from 'react';
import { Box, Typography, Button, Container, Stack, Link } from '@mui/material';
import TopNav from './TopNav';
import ChannelAccess from './ChannelAccess';
import WakilibotLogo from './WakilibotLogo';
import { tokens } from '../styles/theme';

const footerLinkSx = {
  color: 'rgba(255,255,255,0.72)',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
  lineHeight: 1.5,
  transition: 'color 0.2s ease',
  '&:hover': { color: '#FFFFFF' },
};

const FooterLabel = ({ children }) => (
  <Typography
    component="p"
    sx={{
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: tokens.goldSoft,
      mb: 1.25,
    }}
  >
    {children}
  </Typography>
);

const asset = (name) => `${process.env.PUBLIC_URL || ''}/topics/${name}`;

const focusAreas = [
  {
    title: 'File a complaint',
    body: 'Capture the facts of a MoMo, bank, or telecom dispute and submit a CTDRU complaint with a clear reference trail.',
    image: asset('file-complaint.jpg'),
    alt: 'Person preparing details to file a financial consumer complaint',
  },
  {
    title: 'Report fraud & scams',
    body: 'Flag phishing, SIM-swap, PIN theft, and unauthorized wallet activity—and get urgent next steps to protect your money.',
    image: asset('fraud-report.jpg'),
    alt: 'Person checking a smartphone for a possible financial fraud alert',
  },
  {
    title: 'Mobile money disputes',
    body: 'Wrong transfers, missing deposits, and agent issues on MTN MoMo and Airtel Money—documented for follow-up.',
    image: asset('momo-dispute.jpg'),
    alt: 'Hands reviewing a mobile money transfer dispute on a phone',
  },
];

const steps = [
  {
    number: '01',
    title: 'Describe the incident',
    body: 'Share what went wrong—wrong transfer, unauthorized charge, or suspected fraud—in your language.',
  },
  {
    number: '02',
    title: 'Capture the evidence',
    body: 'Wakilibot helps you gather transaction IDs, dates, amounts, and screenshots that matter for CTDRU.',
  },
  {
    number: '03',
    title: 'File, track, or escalate',
    body: 'Submit a complaint, check status, or escalate when a human officer or urgent fraud response is needed.',
  },
];

const LandingPage = ({
  onSignup,
  onLogin,
  onStartChat,
  onHowItWorks,
  onAboutUs,
  onHome,
}) => {
  return (
    <Box sx={{ backgroundColor: tokens.paper, color: tokens.navy, minHeight: '100vh' }}>
      <TopNav
        onHome={onHome}
        onHowItWorks={onHowItWorks}
        onAboutUs={onAboutUs}
        onLogin={onLogin}
        onSignup={onSignup}
        onStartChat={onStartChat}
      />

      {/* Hero — full-bleed complaint capture visual */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          pt: { xs: 12, md: 10 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Box
          component="img"
          src={asset('hero-complaint-capture.jpg')}
          alt=""
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(105deg, rgba(11,31,58,0.92) 0%, rgba(11,31,58,0.78) 48%, rgba(26,58,92,0.55) 100%)
            `,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box className="wakili-fade-up" sx={{ maxWidth: 560 }}>
            <Typography
              component="p"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: { xs: '2.6rem', sm: '3.4rem', md: '4rem' },
                fontWeight: 600,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                mb: 1,
              }}
            >
              Wakilibot
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: { xs: '1.55rem', md: '2rem' },
                fontWeight: 500,
                color: tokens.goldSoft,
                lineHeight: 1.25,
                mb: 2.5,
                maxWidth: 520,
              }}
            >
              Capture complaints. Report fraud. Protect your money.
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: { xs: '1.05rem', md: '1.15rem' },
                lineHeight: 1.65,
                mb: 4,
                maxWidth: 480,
              }}
            >
              CTDRU’s AI assistant for Uganda—file financial complaints, track
              status, and get urgent guidance when scams or unauthorized
              transactions hit your MoMo or bank account.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={onStartChat || onSignup}
                sx={{ px: 3.5, py: 1.35, fontSize: '1rem' }}
              >
                Start chatting
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={onLogin}
                sx={{
                  px: 3.5,
                  py: 1.35,
                  fontSize: '1rem',
                  borderColor: 'rgba(255,255,255,0.35)',
                  color: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  },
                }}
              >
                Sign in
              </Button>
            </Stack>
            <Typography
              sx={{
                mt: 2,
                color: 'rgba(255,255,255,0.55)',
                fontSize: '0.88rem',
              }}
            >
              No account needed to begin — sign in later to save your case.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Core business: complaints & fraud */}
      <Box component="section" sx={{ py: { xs: 8, md: 11 }, background: tokens.paper }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.85rem', md: '2.35rem' },
              mb: 1.5,
              maxWidth: 520,
            }}
          >
            Built to capture complaints and stop fraud
          </Typography>
          <Typography
            sx={{ color: tokens.muted, mb: 5, maxWidth: 560, fontSize: '1.05rem' }}
          >
            Wakilibot’s job is practical: gather what happened, protect your funds,
            and move your case into CTDRU’s consumer-protection process.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 4, md: 4 },
            }}
          >
            {focusAreas.map((topic) => (
              <Box key={topic.title}>
                <Box
                  sx={{
                    mb: 2.5,
                    height: { xs: 220, md: 240 },
                    overflow: 'hidden',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={topic.image}
                    alt={topic.alt}
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                </Box>
                <Box sx={{ borderTop: `2px solid ${tokens.gold}`, pt: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      mb: 1,
                    }}
                  >
                    {topic.title}
                  </Typography>
                  <Typography sx={{ color: tokens.muted, lineHeight: 1.6 }}>
                    {topic.body}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Uganda MoMo context band */}
      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          minHeight: { md: 420 },
          background: tokens.sand,
        }}
      >
        <Box
          component="img"
          src={asset('uganda-momo-kiosk.jpg')}
          alt="Mobile money transaction at a kiosk in Uganda"
          loading="lazy"
          sx={{
            width: '100%',
            height: { xs: 280, md: '100%' },
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 3, md: 6 },
            py: { xs: 5, md: 6 },
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: '1.7rem', md: '2.1rem' }, mb: 1.5 }}
          >
            From MoMo counters to your phone
          </Typography>
          <Typography sx={{ color: tokens.muted, mb: 3, lineHeight: 1.7, maxWidth: 440 }}>
            Whether the issue started at an agent, on Airtel Money, or in a bank app,
            Wakilibot helps you turn the story into a structured complaint—and flags
            fraud patterns early so you can act fast.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStartChat || onSignup}
            sx={{ alignSelf: 'flex-start' }}
          >
            Start chatting
          </Button>
        </Box>
      </Box>

      <ChannelAccess />

      {/* How it works */}
      <Box component="section" sx={{ py: { xs: 8, md: 11 }, background: tokens.sand }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: '1.85rem', md: '2.35rem' }, mb: 1.5 }}
          >
            How complaint capture works
          </Typography>
          <Typography sx={{ color: tokens.muted, mb: 5, maxWidth: 520 }}>
            Three steps from incident to a CTDRU-ready case—including fraud escalation.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 4, md: 4 },
            }}
          >
            {steps.map((step) => (
              <Box key={step.number}>
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
                    fontSize: '1.3rem',
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
          {onHowItWorks && (
            <Button
              onClick={onHowItWorks}
              sx={{ mt: 5, color: tokens.navy, fontWeight: 600, px: 0 }}
            >
              Learn more about the process →
            </Button>
          )}
        </Container>
      </Box>

      {/* Trust */}
      <Box
        component="section"
        sx={{
          py: { xs: 7, md: 9 },
          background: tokens.navy,
          color: '#FFFFFF',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: { xs: '1.6rem', md: '2rem' },
                  fontWeight: 600,
                  mb: 1.5,
                  maxWidth: 480,
                }}
              >
                CTDRU consumer protection for disputes and fraud
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  maxWidth: 480,
                  mb: 4,
                  lineHeight: 1.65,
                }}
              >
                Secure intake for complaints, clear status tracking, and guidance when
                unauthorized transactions or scams put your money at risk.
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
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                height: 280,
                overflow: 'hidden',
                borderRadius: 2,
              }}
            >
              <Box
                component="img"
                src={asset('secure-banking.jpg')}
                alt="Secure digital banking and payment protection"
                loading="lazy"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          position: 'relative',
          color: '#FFFFFF',
          background: `
            radial-gradient(120% 90% at 0% 0%, rgba(212,168,75,0.12) 0%, transparent 42%),
            linear-gradient(165deg, ${tokens.navy} 0%, #081628 55%, #06101c 100%)
          `,
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${tokens.gold} 28%, ${tokens.goldSoft} 50%, ${tokens.gold} 72%, transparent 100%)`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 5 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 1fr', md: '1.4fr 1fr 1fr 0.9fr' },
              gap: { xs: 4.5, md: 5 },
              alignItems: 'start',
            }}
          >
            <Box sx={{ maxWidth: 320 }}>
              <WakilibotLogo size={44} showText inverted onClick={onHome} />
              <Typography
                sx={{
                  mt: 2.25,
                  color: 'rgba(255,255,255,0.68)',
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                }}
              >
                CTDRU’s assistant for filing complaints and reporting fraud across banking,
                mobile money, and credit.
              </Typography>
            </Box>

            <Box>
              <FooterLabel>Visit</FooterLabel>
              <Typography sx={{ ...footerLinkSx, display: 'block', maxWidth: 220 }}>
                Plot 29-37 Ntinda Road
                <br />
                Kampala, Uganda
              </Typography>
            </Box>

            <Box>
              <FooterLabel>Contact</FooterLabel>
              <Stack spacing={1}>
                <Link href="tel:+256760345027" sx={footerLinkSx}>
                  +256 760 345 027
                </Link>
                <Link href="tel:+256784101593" sx={footerLinkSx}>
                  +256 784 101 593
                </Link>
                <Link href="mailto:hello@ctdrug.org" sx={footerLinkSx}>
                  hello@ctdrug.org
                </Link>
              </Stack>
            </Box>

            <Box>
              <FooterLabel>Explore</FooterLabel>
              <Stack spacing={1} alignItems="flex-start">
                <Box
                  component="button"
                  type="button"
                  onClick={onHowItWorks}
                  sx={{
                    ...footerLinkSx,
                    border: 'none',
                    background: 'transparent',
                    p: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  How it works
                </Box>
                <Box
                  component="button"
                  type="button"
                  onClick={onAboutUs}
                  sx={{
                    ...footerLinkSx,
                    border: 'none',
                    background: 'transparent',
                    p: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  About CTDRU
                </Box>
                <Box
                  component="button"
                  type="button"
                  onClick={onStartChat || onSignup}
                  sx={{
                    ...footerLinkSx,
                    border: 'none',
                    background: 'transparent',
                    p: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                    textAlign: 'left',
                    color: tokens.goldSoft,
                    '&:hover': { color: '#FFFFFF' },
                  }}
                >
                  Start chatting
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              mt: { xs: 5, md: 6.5 },
              pt: 2.5,
              borderTop: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>
              © {new Date().getFullYear()} Wakilibot · Centre for Technology Disputes Resolution — Uganda
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.38)',
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
              }}
            >
              Consumer protection · Uganda
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
