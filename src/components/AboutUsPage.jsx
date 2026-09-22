import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import TopNav from './TopNav';
import {
  SmartToy as SmartToyIcon,
  Language as LanguageIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
  Shield as ShieldIcon,
  Star as StarIcon,
  Timer as TimerIcon,
  Verified as VerifiedIcon,
  Accessibility as AccessibilityIcon,
  Public as PublicIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';

const AboutUsPage = ({ onBack, onLogin, onSignup, onFeatures, onHowItWorks }) => {
  const missionValues = [
    {
      icon: <ShieldIcon sx={{ fontSize: 40 }} />,
      title: 'Consumer Protection',
      description: 'We are committed to protecting consumer rights and ensuring fair treatment in financial and telecom services.',
      color: '#1976d2'
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
      title: 'AI Innovation',
      description: 'Leveraging cutting-edge AI technology to make consumer protection accessible to everyone.',
      color: '#4caf50'
    },
    {
      icon: <AccessibilityIcon sx={{ fontSize: 40 }} />,
      title: 'Accessibility',
      description: 'Ensuring consumer protection is available through multiple channels - web, voice, and USSD.',
      color: '#ff9800'
    },
    {
      icon: <LanguageIcon sx={{ fontSize: 40 }} />,
      title: 'Inclusivity',
      description: 'Supporting multiple languages and dialects to serve all Ugandan consumers.',
      color: '#9c27b0'
    }
  ];

  const contactInfo = [
    {
      icon: <PhoneIcon sx={{ fontSize: 32 }} />,
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      details: ['+256-41-4230060', 'Available 24/7', 'Emergency Support'],
      color: '#1976d2'
    },
    {
      icon: <EmailIcon sx={{ fontSize: 32 }} />,
      title: 'Email Support',
      description: 'Send us your detailed inquiries',
      details: ['ctdru@bou.or.ug', 'Response within 24 hours', 'Detailed Documentation'],
      color: '#4caf50'
    },
    {
      icon: <PublicIcon sx={{ fontSize: 32 }} />,
      title: 'Website',
      description: 'Visit our official website',
      details: ['www.bou.or.ug', 'Consumer Affairs Section', 'Online Resources'],
      color: '#ff9800'
    },
    {
      icon: <MessageIcon sx={{ fontSize: 32 }} />,
      title: 'Wakilibot Chat',
      description: 'AI-powered instant support',
      details: ['Web Chat Available', 'Voice Call *256#', 'USSD *256#'],
      color: '#9c27b0'
    }
  ];

  const achievements = [
    {
      year: '2024',
      title: 'Wakilibot Launch',
      description: 'Successfully launched AI-powered consumer protection platform',
      icon: <EmojiEventsIcon sx={{ color: '#1976d2' }} />
    },
    {
      year: '2024',
      title: '15K+ Conversations',
      description: 'Helped over 15,000 consumers with their protection needs',
      icon: <PeopleIcon sx={{ color: '#4caf50' }} />
    },
    {
      year: '2024',
      title: '95% Satisfaction',
      description: 'Achieved 95% user satisfaction rate',
      icon: <StarIcon sx={{ color: '#ff9800' }} />
    },
    {
      year: '2024',
      title: 'Multi-Channel Access',
      description: 'Launched web, voice, and USSD access methods',
      icon: <PublicIcon sx={{ color: '#9c27b0' }} />
    }
  ];

  const statistics = [
    { number: '15K+', label: 'Consumers Helped', icon: <PeopleIcon /> },
    { number: '95%', label: 'Satisfaction Rate', icon: <StarIcon /> },
    { number: '2s', label: 'Average Response', icon: <TimerIcon /> },
    { number: '24/7', label: 'Always Available', icon: <VerifiedIcon /> }
  ];


  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}>
      <TopNav
        pageTitle="About Wakilibot"
        onHome={onBack}
        onFeatures={onFeatures}
        onHowItWorks={onHowItWorks}
        onAboutUs={onBack}
        onLogin={onLogin}
        onSignup={onSignup}
        showAuthButtons={true}
      />

      {/* Hero Section */}
      <Box sx={{ pt: 15, pb: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #1976d2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2
              }}
            >
              About Wakilibot
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: '#1976d2',
                mb: 4,
                fontWeight: 600,
                lineHeight: 1.3
              }}
            >
              AI-Powered Consumer Protection by CTDRU
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#cccccc',
                mb: 6,
                fontWeight: 400,
                lineHeight: 1.5,
                maxWidth: 800,
                mx: 'auto'
              }}
            >
              Wakilibot is Uganda's first AI-powered consumer protection platform, 
              developed by CTDRU (Consumer Affairs Department of Bank of Uganda) 
              to make consumer rights accessible to everyone.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mission & Values */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Our Mission & Values
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Committed to protecting consumer rights through innovative AI technology.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {missionValues.map((value, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                    border: '1px solid #333333',
                    borderRadius: 3,
                    p: 3,
                    '&:hover': {
                      borderColor: value.color,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${value.color}20`
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        backgroundColor: value.color,
                        borderRadius: 2,
                        p: 2,
                        mr: 3,
                        color: '#ffffff'
                      }}
                    >
                      {value.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {value.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cccccc', lineHeight: 1.6 }}>
                    {value.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Our Impact
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Numbers that reflect our commitment to consumer protection.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {statistics.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: '#1976d2',
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#ffffff' }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Contact Us
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Get in touch with CTDRU for consumer protection assistance.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {contactInfo.map((contact, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                    border: '1px solid #333333',
                    borderRadius: 3,
                    p: 3,
                    '&:hover': {
                      borderColor: contact.color,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${contact.color}20`
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        backgroundColor: contact.color,
                        borderRadius: 2,
                        p: 2,
                        mr: 3,
                        color: '#ffffff'
                      }}
                    >
                      {contact.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {contact.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cccccc', mb: 3, lineHeight: 1.6 }}>
                    {contact.description}
                  </Typography>
                  <List dense>
                    {contact.details.map((detail, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon sx={{ color: contact.color, fontSize: 16 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={detail}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: '#cccccc'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Achievements Timeline */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Our Journey
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Key milestones in our mission to protect consumer rights.
            </Typography>
          </Box>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                sx={{
                  mb: 3,
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  border: '1px solid #444444',
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#1976d2',
                    borderRadius: 2,
                    p: 2,
                    color: '#ffffff',
                    minWidth: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {achievement.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {achievement.title}
                    </Typography>
                    <Chip
                      label={achievement.year}
                      size="small"
                      sx={{
                        backgroundColor: '#1976d2',
                        color: '#ffffff',
                        fontSize: '11px'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cccccc', lineHeight: 1.6 }}>
                    {achievement.description}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: 4
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: '#ffffff' }}>
                Join Our Mission
              </Typography>
              <Typography variant="h6" sx={{ color: '#e3f2fd', mb: 4, maxWidth: 600, mx: 'auto' }}>
                Experience the future of consumer protection with Wakilibot's AI-powered assistance.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowIcon />}
                  onClick={onSignup}
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#1976d2',
                    textTransform: 'none',
                    fontSize: '16px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#ffffff',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontSize: '16px',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#000000', borderTop: '1px solid #333333' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  backgroundColor: '#1976d2',
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                }}
              >
                <SmartToyIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#888888' }}>
                © 2024 Wakilibot by CTDRU. All rights reserved.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography variant="body2" sx={{ color: '#888888' }}>Privacy Policy</Typography>
              <Typography variant="body2" sx={{ color: '#888888' }}>Terms of Service</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUsPage;
