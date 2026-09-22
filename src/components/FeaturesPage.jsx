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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import TopNav from './TopNav';
import {
  SmartToy as SmartToyIcon,
  VoiceChat as VoiceIcon,
  Phone as PhoneIcon,
  Sms as SmsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Analytics as AnalyticsIcon,
  Support as SupportIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Public as PublicIcon,
  AccountBalance as BankIcon,
  Settings as SettingsIcon,
  Link as IntegrationIcon,
  Notifications as NotificationsIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

const FeaturesPage = ({ onBack, onLogin, onSignup, onHowItWorks, onAboutUs }) => {

  const coreFeatures = [
    {
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
      title: 'Advanced AI Conversation Engine',
      description: 'GPT-4 powered intelligent responses with context awareness and multi-turn conversation management.',
      highlights: ['Natural Language Processing', 'Intent Detection', 'Context Awareness', 'Learning Capabilities'],
      color: '#1976d2',
      category: 'AI Technology'
    },
    {
      icon: <VoiceIcon sx={{ fontSize: 40 }} />,
      title: 'Voice-to-Voice AI Interaction',
      description: 'Revolutionary voice AI that understands and responds in natural speech with emotion detection.',
      highlights: ['Real-time Voice Processing', 'Emotion Recognition', 'Natural Speech Synthesis', 'Multi-language Voice'],
      color: '#4caf50',
      category: 'Voice Technology'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: 'Voice Call Support',
      description: 'Call Wakilibot directly for voice assistance. Dial *256# and follow the prompts.',
      highlights: ['Call *256#', 'Voice Commands', 'Automated Routing', 'Live Agent Escalation'],
      color: '#ff9800',
      category: 'Telephony'
    },
    {
      icon: <SmsIcon sx={{ fontSize: 40 }} />,
      title: 'USSD Access',
      description: 'Access Wakilibot via USSD on any mobile phone. Dial *256# for instant consumer protection.',
      highlights: ['Dial *256#', 'No Internet Required', 'Works on All Phones', 'Instant Access'],
      color: '#9c27b0',
      category: 'Mobile Technology'
    }
  ];

  const platformFeatures = [
    {
      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
      title: 'Secure & Private',
      description: 'Your conversations and personal information are protected with bank-grade security.',
      features: ['End-to-End Encryption', 'Privacy Protection', 'Secure Data Storage', 'Anonymous Options']
    },
    {
      icon: <LanguageIcon sx={{ fontSize: 32 }} />,
      title: 'Multi-Language Support',
      description: 'Chat with Wakilibot in your preferred language including local Ugandan dialects.',
      features: ['English', 'Luganda', 'Ateso', 'Acholi', 'Runyakore', 'Lusoga', 'Lumasaba', 'Swahili']
    },
    {
      icon: <SupportIcon sx={{ fontSize: 32 }} />,
      title: '24/7 Availability',
      description: 'Get help anytime, anywhere. Wakilibot is always ready to assist you.',
      features: ['Round-the-Clock', 'No Waiting', 'Instant Response', 'Always Online']
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 32 }} />,
      title: 'Smart Assistance',
      description: 'AI-powered responses that understand your needs and provide accurate guidance.',
      features: ['Context Awareness', 'Learning Capabilities', 'Accurate Responses', 'Personalized Help']
    }
  ];

  const industrySolutions = [
    {
      icon: <BankIcon sx={{ fontSize: 32 }} />,
      title: 'Financial Services',
      description: 'Get help with banking, mobile money, and financial service complaints.',
      useCases: ['Mobile Money Issues', 'Banking Complaints', 'Fraud Reporting', 'Transaction Problems']
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 32 }} />,
      title: 'Telecommunications',
      description: 'Resolve telecom service issues and billing disputes with ease.',
      useCases: ['Service Quality', 'Billing Disputes', 'Network Issues', 'Data Problems']
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F7F4EF', color: '#0B1F3A' }}>
      <TopNav
        pageTitle="Wakilibot Features"
        onHome={onBack}
        onFeatures={onBack}
        onHowItWorks={onHowItWorks}
        onAboutUs={onAboutUs}
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
              World-Class Features
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
              Advanced AI Consumer Protection Platform
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
              Experience the future of consumer protection with cutting-edge AI technology, 
              voice interactions, IVR systems, and USSD integration designed for global markets.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip
                label="AI-Powered"
                sx={{
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              />
              <Chip
                label="Voice-to-Voice"
                sx={{
                  backgroundColor: '#4caf50',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              />
              <Chip
                label="IVR Integration"
                sx={{
                  backgroundColor: '#ff9800',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              />
              <Chip
                label="USSD Support"
                sx={{
                  backgroundColor: '#9c27b0',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              />
              <Chip
                label="Global Ready"
                sx={{
                  backgroundColor: '#f44336',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Core Features Section */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Core Technology Features
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Revolutionary AI technology combined with advanced telephony and mobile integration.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {coreFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                    border: '1px solid #333333',
                    borderRadius: 3,
                    p: 3,
                    '&:hover': {
                      borderColor: feature.color,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${feature.color}20`
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        backgroundColor: feature.color,
                        borderRadius: 2,
                        p: 2,
                        mr: 3,
                        color: '#ffffff'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Chip
                        label={feature.category}
                        size="small"
                        sx={{
                          backgroundColor: feature.color,
                          color: '#ffffff',
                          fontSize: '10px'
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cccccc', mb: 3, lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                  <List dense>
                    {feature.highlights.map((highlight, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon sx={{ color: feature.color, fontSize: 16 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={highlight}
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

      {/* Platform Features */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Why Choose Wakilibot?
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Experience consumer protection that's fast, secure, and always available when you need it.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {platformFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    border: '1px solid #444444',
                    borderRadius: 3,
                    p: 3
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        backgroundColor: '#1976d2',
                        borderRadius: 2,
                        p: 2,
                        mr: 3,
                        color: '#ffffff'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cccccc', mb: 3, lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {feature.features.map((item, idx) => (
                      <Chip
                        key={idx}
                        label={item}
                        size="small"
                        sx={{
                          backgroundColor: '#333333',
                          color: '#ffffff',
                          fontSize: '11px'
                        }}
                      />
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Industry Solutions */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Services We Help With
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Wakilibot helps you resolve issues with financial and telecom services.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {industrySolutions.map((solution, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                    border: '1px solid #333333',
                    borderRadius: 3,
                    p: 3,
                    '&:hover': {
                      borderColor: '#1976d2',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        backgroundColor: '#1976d2',
                        borderRadius: 2,
                        p: 2,
                        mr: 3,
                        color: '#ffffff'
                      }}
                    >
                      {solution.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {solution.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cccccc', mb: 3, lineHeight: 1.6 }}>
                    {solution.description}
                  </Typography>
                  <Divider sx={{ borderColor: '#333333', mb: 2 }} />
                  <Typography variant="subtitle2" sx={{ color: '#1976d2', mb: 2, fontWeight: 600 }}>
                    Use Cases:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {solution.useCases.map((useCase, idx) => (
                      <Chip
                        key={idx}
                        label={useCase}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#444444',
                          color: '#cccccc',
                          fontSize: '11px'
                        }}
                      />
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How to Access Wakilibot */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              How to Access Wakilibot
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Multiple ways to get help with your consumer protection needs.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  border: '1px solid #444444',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center'
                }}
              >
                <ComputerIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                  Web Chat
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', mb: 3 }}>
                  Chat with Wakilibot directly on our website
                </Typography>
                <Button
                  variant="contained"
                  onClick={onSignup}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: '#ffffff',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  Sign Up to Chat
                </Button>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  border: '1px solid #444444',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center'
                }}
              >
                <PhoneIcon sx={{ fontSize: 60, color: '#ff9800', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ff9800' }}>
                  Voice Call
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#ffffff' }}>
                  *256#
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', mb: 3 }}>
                  Call Wakilibot for voice assistance
                </Typography>
                <Typography variant="caption" sx={{ color: '#888888' }}>
                  Available 24/7 on all networks
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  border: '1px solid #444444',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center'
                }}
              >
                <PhoneAndroidIcon sx={{ fontSize: 60, color: '#9c27b0', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                  USSD Menu
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#ffffff' }}>
                  *256#
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', mb: 3 }}>
                  Access Wakilibot via USSD on any phone
                </Typography>
                <Typography variant="caption" sx={{ color: '#888888' }}>
                  No internet required
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Integration Capabilities */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Integration Capabilities
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Seamless integration with existing systems and platforms.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                  border: '1px solid #333333',
                  borderRadius: 3,
                  p: 4
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                  Communication Channels
                </Typography>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <ComputerIcon sx={{ color: '#1976d2' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Web Interface"
                      secondary="React-based responsive web application"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PhoneAndroidIcon sx={{ color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mobile App"
                      secondary="Native iOS and Android applications"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PhoneIcon sx={{ color: '#ff9800' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Voice Calls"
                      secondary="Voice-to-voice AI interaction"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <SmsIcon sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="USSD"
                      secondary="Universal Service Description integration"
                    />
                  </ListItem>
                </List>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                  border: '1px solid #333333',
                  borderRadius: 3,
                  p: 4
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                  API & Integration
                </Typography>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <IntegrationIcon sx={{ color: '#1976d2' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="REST APIs"
                      secondary="50+ comprehensive API endpoints"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <NotificationsIcon sx={{ color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Webhooks"
                      secondary="Real-time event notifications"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <SettingsIcon sx={{ color: '#ff9800' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="SDKs"
                      secondary="Python, JavaScript, Java, C# SDKs"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PublicIcon sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Third-party"
                      secondary="100+ pre-built integrations"
                    />
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8 }}>
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
                Ready to Get Help with Wakilibot?
              </Typography>
              <Typography variant="h6" sx={{ color: '#e3f2fd', mb: 4, maxWidth: 600, mx: 'auto' }}>
                Start chatting with Wakilibot now or call *256# for instant consumer protection assistance.
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
                  Sign Up to Chat
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
                  Call *256#
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#F7F4EF', borderTop: '1px solid #333333' }}>
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
              <Typography variant="body2" sx={{ color: '#888888' }}>Contact</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesPage;
