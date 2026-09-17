import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from '@mui/material';
import TopNav from './TopNav';
import {
  SmartToy as SmartToyIcon,
  Phone as PhoneIcon,
  Sms as SmsIcon,
  Computer as ComputerIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Language as LanguageIcon,
  Support as SupportIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Headset as HeadsetIcon,
  Timer as TimerIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Lock as LockIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Accessibility as AccessibilityIcon,
  Public as PublicIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Gavel as GavelIcon,
  Shield as ShieldIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Help as HelpIcon,
  ContactSupport as ContactSupportIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Call as CallIcon,
  TouchApp as TouchAppIcon,
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
  Keyboard as KeyboardIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const HowItWorksPage = ({ onBack, onLogin, onSignup, onFeatures, onAboutUs }) => {
  const [expandedStep, setExpandedStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const communicationModes = [
    {
      icon: <ComputerIcon sx={{ fontSize: 60 }} />,
      title: 'Web Chat',
      description: 'Chat with Wakilibot directly on our website',
      color: '#1976d2',
      steps: [
        'Sign up or login to Wakilibot',
        'Click "Start Chatting" button',
        'Describe your issue in the chat',
        'AI guides you through the process',
        'Get your complaint ID and follow-up'
      ],
      features: ['AI-powered responses', 'File attachments', 'Chat history', 'Multi-language support'],
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 60 }} />,
      title: 'Voice Call',
      description: 'Call Wakilibot for voice assistance',
      color: '#ff9800',
      code: '*256#',
      steps: [
        'Dial *256# from any phone',
        'Listen to IVR menu options',
        'Choose your issue type',
        'Speak your issue to AI',
        'Get voice confirmation and ID'
      ],
      features: ['Voice commands', 'Automated routing', 'Live agent escalation', '24/7 availability'],
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: <PhoneAndroidIcon sx={{ fontSize: 60 }} />,
      title: 'USSD Menu',
      description: 'Access Wakilibot via USSD on any phone',
      color: '#9c27b0',
      code: '*256#',
      steps: [
        'Dial *256# from any mobile',
        'Navigate USSD menu',
        'Select issue category',
        'Enter details via prompts',
        'Receive SMS confirmation'
      ],
      features: ['No internet required', 'Works on all phones', 'Offline capability', 'SMS notifications'],
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop&crop=center'
    }
  ];

  const issueTypes = [
    {
      icon: <BankIcon sx={{ fontSize: 40 }} />,
      title: 'Financial Services',
      description: 'Mobile money, banking, and financial service issues',
      examples: ['Mobile money problems', 'Banking complaints', 'Transaction disputes', 'Fraud reporting'],
      process: ['Complaint filing', 'Investigation', 'Resolution', 'Follow-up'],
      timeline: '24-48 hours initial response, 7-30 days resolution',
      color: '#1976d2'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: 'Telecommunications',
      description: 'Telecom service quality and billing issues',
      examples: ['Service quality problems', 'Billing disputes', 'Network issues', 'Data problems'],
      process: ['Issue reporting', 'Technical review', 'Service restoration', 'Confirmation'],
      timeline: 'Immediate acknowledgment, 24-72 hours resolution',
      color: '#ff9800'
    }
  ];

  const processSteps = [
    {
      title: 'Contact Wakilibot',
      description: 'Choose your preferred method: Web Chat, Voice Call (*256#), or USSD (*256#)',
      icon: <TouchAppIcon sx={{ fontSize: 32 }} />,
      details: 'Multiple access methods ensure everyone can reach Wakilibot regardless of device or internet access.'
    },
    {
      title: 'Describe Your Issue',
      description: 'Tell Wakilibot about your problem in detail',
      icon: <MicIcon sx={{ fontSize: 32 }} />,
      details: 'AI understands natural language and will ask clarifying questions to get all necessary information.'
    },
    {
      title: 'AI Processing',
      description: 'Wakilibot analyzes your issue and determines the best course of action',
      icon: <SmartToyIcon sx={{ fontSize: 32 }} />,
      details: 'Advanced AI categorizes your issue, extracts relevant details, and routes to appropriate departments.'
    },
    {
      title: 'Complaint Filing',
      description: 'Your issue is officially filed with CTDRU',
      icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
      details: 'You receive a unique complaint ID for tracking and follow-up purposes.'
    },
    {
      title: 'Investigation',
      description: 'CTDRU investigates your complaint',
      icon: <SearchIcon sx={{ fontSize: 32 }} />,
      details: 'Professional investigators review your case and work with relevant service providers.'
    },
    {
      title: 'Resolution',
      description: 'You receive updates and resolution',
      icon: <CheckIcon sx={{ fontSize: 32 }} />,
      details: 'Regular updates via SMS/email, and final resolution with confirmation.'
    }
  ];

  const faqItems = [
    {
      question: 'How long does it take to resolve my complaint?',
      answer: 'Most complaints are acknowledged within 24 hours and resolved within 7-30 days, depending on complexity.'
    },
    {
      question: 'Do I need internet to use Wakilibot?',
      answer: 'No! You can use USSD (*256#) or voice calls without internet. Web chat requires internet connection.'
    },
    {
      question: 'Is my information secure?',
      answer: 'Yes, all your data is encrypted and protected. CTDRU follows strict privacy and security protocols.'
    },
    {
      question: 'Can I check my complaint status?',
      answer: 'Yes, use your complaint ID to check status via *256# or web chat anytime.'
    },
    {
      question: 'What if Wakilibot can\'t help with my issue?',
      answer: 'Wakilibot will escalate complex issues to human agents or direct you to appropriate CTDRU departments.'
    }
  ];

  const handleStepExpand = (step) => (event, isExpanded) => {
    setExpandedStep(isExpanded ? step : false);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}>
      <TopNav
        pageTitle="How Wakilibot Works"
        onHome={onBack}
        onFeatures={onFeatures}
        onHowItWorks={onBack}
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
              How Wakilibot Works
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
              Multiple Ways to Get Consumer Protection Help
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
              Learn how to use Wakilibot through web chat, voice calls, or USSD to get help with your consumer protection needs.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Communication Modes */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Choose Your Preferred Method
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Three convenient ways to access Wakilibot's consumer protection services.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {communicationModes.map((mode, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                    border: '1px solid #333333',
                    borderRadius: 3,
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: mode.color,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${mode.color}20`
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${mode.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${mode.color}20 0%, rgba(0,0,0,0.7) 100%)`
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1, p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <Box
                        sx={{
                          backgroundColor: mode.color,
                          borderRadius: 2,
                          p: 2,
                          mb: 2,
                          color: '#ffffff'
                        }}
                      >
                        {mode.icon}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', color: '#ffffff' }}>
                        {mode.title}
                      </Typography>
                      {mode.code && (
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#ffffff', mt: 1 }}>
                          {mode.code}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ color: '#cccccc', mb: 3, lineHeight: 1.6 }}>
                      {mode.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" sx={{ color: mode.color, mb: 2, fontWeight: 600 }}>
                      How it works:
                    </Typography>
                    <List dense>
                      {mode.steps.map((step, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Typography variant="body2" sx={{ color: mode.color, fontWeight: 600 }}>
                              {idx + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={step}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: '#cccccc'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Divider sx={{ borderColor: '#333333', my: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {mode.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc',
                            fontSize: '11px'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Process Steps */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              The Complete Process
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              From contacting Wakilibot to getting your issue resolved.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {processSteps.map((step, index) => (
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
                      {step.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#cccccc' }}>
                        {step.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cccccc', lineHeight: 1.6 }}>
                    {step.details}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Issue Types */}
      <Box sx={{ py: 8, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Types of Issues We Handle
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Wakilibot helps with various consumer protection issues.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {issueTypes.map((issue, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                    border: '1px solid #333333',
                    borderRadius: 3,
                    p: 3,
                    '&:hover': {
                      borderColor: issue.color,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        backgroundColor: issue.color,
                        borderRadius: 2,
                        p: 2,
                        mr: 3,
                        color: '#ffffff'
                      }}
                    >
                      {issue.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {issue.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cccccc', mb: 3, lineHeight: 1.6 }}>
                    {issue.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ color: issue.color, mb: 2, fontWeight: 600 }}>
                    Examples:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {issue.examples.map((example, idx) => (
                      <Chip
                        key={idx}
                        label={example}
                        size="small"
                        sx={{
                          backgroundColor: '#333333',
                          color: '#cccccc',
                          fontSize: '11px'
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ color: issue.color, mb: 2, fontWeight: 600 }}>
                    Process:
                  </Typography>
                  <List dense>
                    {issue.process.map((processStep, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon sx={{ color: issue.color, fontSize: 16 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={processStep}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: '#cccccc'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ borderColor: '#333333', my: 2 }} />
                  <Typography variant="caption" sx={{ color: '#888888' }}>
                    Timeline: {issue.timeline}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" sx={{ color: '#cccccc', maxWidth: 600, mx: 'auto' }}>
              Common questions about using Wakilibot.
            </Typography>
          </Box>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {faqItems.map((faq, index) => (
              <Accordion
                key={index}
                expanded={expandedStep === index}
                onChange={handleStepExpand(index)}
                sx={{
                  backgroundColor: '#111111',
                  border: '1px solid #333333',
                  borderRadius: 2,
                  mb: 2,
                  '&:before': {
                    display: 'none'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      margin: '12px 0'
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: '#cccccc', lineHeight: 1.6 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
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
                Ready to Get Help?
              </Typography>
              <Typography variant="h6" sx={{ color: '#e3f2fd', mb: 4, maxWidth: 600, mx: 'auto' }}>
                Choose your preferred method and start getting help with your consumer protection needs.
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
                  Start Web Chat
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
              <Typography variant="body2" sx={{ color: '#888888' }}>Contact</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HowItWorksPage;
