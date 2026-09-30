import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Fade,
  Slide,
  Container,
  Stack,
  Avatar
} from '@mui/material';
import {
  Help as HelpIcon,
  Assignment as FormIcon,
  Description as DocumentIcon,
  QuestionAnswer as FAQIcon,
  Book as BookIcon,
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  AccessTime as TimeIcon,
  Support as SupportIcon,
  ContactSupport as ContactIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';

const Help = ({ onBack, onFileComplaint, onReportFraud }) => {
  const [activeTab, setActiveTab] = useState('forms');
  const [, setSelectedForm] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Enhanced complaint forms data
  const complaintForms = [
    {
      id: 1,
      title: 'Financial Service Complaint',
      description: 'Submit complaints against banks, mobile money providers, microfinance institutions, and other financial service providers.',
      category: 'financial',
      estimatedTime: '10-15 minutes',
      icon: <SecurityIcon />,
      features: ['Real-time processing', 'Secure submission', 'Instant confirmation'],
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
    },
    {
      id: 2,
      title: 'Product Safety Complaint',
      description: 'Report unsafe products, defective goods, misleading advertisements, or any consumer safety concerns.',
      category: 'product',
      estimatedTime: '5-10 minutes',
      icon: <AssignmentIcon />,
      features: ['Priority handling', 'Safety alerts', 'Product recall info'],
      color: '#d32f2f',
      gradient: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)'
    },
    {
      id: 3,
      title: 'Service Provider Complaint',
      description: 'Complain about poor service quality, billing issues, contract violations, or unfair business practices.',
      category: 'service',
      estimatedTime: '8-12 minutes',
      icon: <TrendingUpIcon />,
      features: ['Service monitoring', 'Resolution tracking', 'Follow-up support'],
      color: '#388e3c',
      gradient: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)'
    }
  ];

  // Enhanced guides data
  const guides = [
    {
      id: 1,
      title: 'How to Write a Legal Complaint Letter',
      category: 'legal-writing',
      difficulty: 'Intermediate',
      estimatedTime: '20-30 minutes',
      steps: [
        'Identify the issue clearly and concisely',
        'Gather all supporting documents and evidence',
        'Use formal, professional language throughout',
        'Include specific dates, amounts, and transaction details',
        'Request specific remedies or resolutions',
        'Submit within applicable time limits and deadlines'
      ],
      icon: <GavelIcon />,
      color: '#7b1fa2',
      tips: ['Keep it factual', 'Be specific', 'Include evidence', 'Follow up regularly']
    },
    {
      id: 2,
      title: 'Understanding Consumer Rights in Uganda',
      category: 'rights',
      difficulty: 'Beginner',
      estimatedTime: '15-20 minutes',
      steps: [
        'Right to safety - protection from hazardous products',
        'Right to information - clear product/service details',
        'Right to choose - freedom to select from alternatives',
        'Right to be heard - voice concerns and complaints',
        'Right to redress - seek compensation for damages',
        'Right to consumer education - learn about your rights'
      ],
      icon: <BookIcon />,
      color: '#1976d2',
      tips: ['Know your rights', 'Document everything', 'Act quickly', 'Seek help when needed']
    },
    {
      id: 3,
      title: 'Document Preparation Checklist',
      category: 'preparation',
      difficulty: 'Beginner',
      estimatedTime: '10-15 minutes',
      steps: [
        'Collect all relevant receipts and invoices',
        'Take clear photos of damaged products or issues',
        'Gather all correspondence and communication records',
        'Prepare witness statements if applicable',
        'Organize events in chronological timeline',
        'Review legal requirements and deadlines'
      ],
      icon: <DocumentIcon />,
      color: '#388e3c',
      tips: ['Keep originals', 'Make copies', 'Organize chronologically', 'Store securely']
    }
  ];

  // Enhanced FAQ data
  const faqs = [
    {
      question: 'How long does it take to process a complaint?',
      answer: 'Most complaints are processed within 30 days. Complex cases may take up to 90 days. You will receive regular updates on the progress via email and SMS.',
      category: 'processing',
      icon: <TimeIcon />
    },
    {
      question: 'What documents do I need to submit with my complaint?',
      answer: 'You need receipts, contracts, correspondence, photos of damaged products, bank statements, transaction records, and any other evidence supporting your complaint.',
      category: 'documents',
      icon: <DocumentIcon />
    },
    {
      question: 'Can I submit complaints anonymously?',
      answer: 'Yes, you can submit anonymous complaints, but providing contact information helps us follow up and provide better assistance. Anonymous complaints may have limited resolution options.',
      category: 'privacy',
      icon: <ShieldIcon />
    },
    {
      question: 'What remedies are available for my complaint?',
      answer: 'Available remedies include refunds, replacements, repairs, compensation for damages, service improvements, corrective actions by the service provider, and regulatory sanctions.',
      category: 'remedies',
      icon: <CheckIcon />
    },
    {
      question: 'How can I track the status of my complaint?',
      answer: 'You can track your complaint status through our online portal using your complaint reference number, or contact our support team directly for updates.',
      category: 'tracking',
      icon: <SpeedIcon />
    },
    {
      question: 'What if I\'m not satisfied with the resolution?',
      answer: 'If you\'re not satisfied with the initial resolution, you can request a review, escalate to higher authorities, or seek legal advice. CTDRU provides guidance on next steps.',
      category: 'escalation',
      icon: <SupportIcon />
    }
  ];

  const renderFormsTab = () => (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          File Your Complaint
        </Typography>
        <Typography variant="h6" sx={{ color: '#cccccc', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
          Choose the appropriate complaint form based on your issue. Our streamlined process ensures quick and efficient resolution.
        </Typography>
      </Box>

      {/* Forms Grid */}
      <Grid container spacing={4}>
        {complaintForms.map((form, index) => (
          <Grid item xs={12} md={4} key={form.id}>
            <Fade in timeout={300 + (index * 200)}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, #111111 0%, #1a1a1a 100%)`,
                  border: '1px solid #333333',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transform: hoveredCard === form.id ? 'translateY(-8px)' : 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: form.color,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${form.color}20`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: form.gradient,
                  }
                }}
                onMouseEnter={() => setHoveredCard(form.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        backgroundColor: form.color,
                        width: 48,
                        height: 48,
                        mr: 2,
                        background: form.gradient,
                      }}
                    >
                      {form.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff', mb: 0.5 }}>
                        {form.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: '#888888' }} />
                        <Typography variant="caption" sx={{ color: '#888888' }}>
                          {form.estimatedTime}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: '#cccccc', mb: 3, lineHeight: 1.6, flex: 1 }}>
                    {form.description}
                  </Typography>

                  {/* Features */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#888888', fontWeight: 600, mb: 1, display: 'block' }}>
                      FEATURES
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {form.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc',
                            fontSize: '11px',
                            height: 24,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      background: form.gradient,
                      color: '#ffffff',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '14px',
                      '&:hover': {
                        background: form.gradient,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 8px 16px ${form.color}40`,
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      setSelectedForm(form);
                      onFileComplaint?.();
                    }}
                  >
                    Start Complaint Form
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Stats Section */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#ffffff', mb: 3, fontWeight: 600 }}>
          Trusted by Thousands of Consumers
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700, mb: 1 }}>
                15K+
              </Typography>
              <Typography variant="body2" sx={{ color: '#cccccc' }}>
                Complaints Resolved
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 700, mb: 1 }}>
                95%
              </Typography>
              <Typography variant="body2" sx={{ color: '#cccccc' }}>
                Success Rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700, mb: 1 }}>
                24h
              </Typography>
              <Typography variant="body2" sx={{ color: '#cccccc' }}>
                Average Response
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700, mb: 1 }}>
                30d
              </Typography>
              <Typography variant="body2" sx={{ color: '#cccccc' }}>
                Resolution Time
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );

  const renderGuidesTab = () => (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          How-to Guides
        </Typography>
        <Typography variant="h6" sx={{ color: '#cccccc', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
          Step-by-step guides to help you navigate consumer protection processes and understand your rights.
        </Typography>
      </Box>

      {/* Guides Grid */}
      <Grid container spacing={4}>
        {guides.map((guide, index) => (
          <Grid item xs={12} md={6} key={guide.id}>
            <Fade in timeout={300 + (index * 200)}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, #111111 0%, #1a1a1a 100%)`,
                  border: '1px solid #333333',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    borderColor: guide.color,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${guide.color}20`,
                    transform: 'translateY(-4px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(135deg, ${guide.color} 0%, ${guide.color}CC 100%)`,
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        backgroundColor: guide.color,
                        width: 48,
                        height: 48,
                        mr: 2,
                        background: `linear-gradient(135deg, ${guide.color} 0%, ${guide.color}CC 100%)`,
                      }}
                    >
                      {guide.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff', mb: 0.5 }}>
                        {guide.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={guide.difficulty}
                          size="small"
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc',
                            fontSize: '11px',
                            height: 20,
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimeIcon sx={{ fontSize: 14, color: '#888888' }} />
                          <Typography variant="caption" sx={{ color: '#888888' }}>
                            {guide.estimatedTime}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Steps */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#888888', fontWeight: 600, mb: 2, display: 'block' }}>
                      STEPS
                    </Typography>
                    <List sx={{ pl: 0 }}>
                      {guide.steps.map((step, stepIndex) => (
                        <ListItem key={stepIndex} sx={{ pl: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: guide.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#ffffff'
                              }}
                            >
                              {stepIndex + 1}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={step}
                            primaryTypographyProps={{
                              fontSize: '13px',
                              color: '#cccccc',
                              lineHeight: 1.4
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Tips */}
                  <Box>
                    <Typography variant="caption" sx={{ color: '#888888', fontWeight: 600, mb: 1, display: 'block' }}>
                      QUICK TIPS
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {guide.tips.map((tip, tipIndex) => (
                        <Chip
                          key={tipIndex}
                          label={tip}
                          size="small"
                          sx={{
                            backgroundColor: '#333333',
                            color: '#cccccc',
                            fontSize: '10px',
                            height: 20,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  const renderFAQsTab = () => (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Frequently Asked Questions
        </Typography>
        <Typography variant="h6" sx={{ color: '#cccccc', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
          Find answers to common questions about complaint processes, consumer rights, and CTDRU services.
        </Typography>
      </Box>

      {/* FAQ Grid */}
      <Grid container spacing={3}>
        {faqs.map((faq, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Fade in timeout={300 + (index * 150)}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, #111111 0%, #1a1a1a 100%)`,
                  border: '1px solid #333333',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#444444',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Question Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: '#333333',
                        borderRadius: 1,
                        p: 1,
                        mr: 2,
                        color: '#ffffff',
                        flexShrink: 0
                      }}
                    >
                      {faq.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontSize: '16px', fontWeight: 600, lineHeight: 1.4 }}>
                      {faq.question}
                    </Typography>
                  </Box>

                  {/* Answer */}
                  <Typography variant="body2" sx={{ color: '#cccccc', lineHeight: 1.6, pl: 6 }}>
                    {faq.answer}
                  </Typography>

                  {/* Category Badge */}
                  <Box sx={{ mt: 2, pl: 6 }}>
                    <Chip
                      label={faq.category.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: '#333333',
                        color: '#888888',
                        fontSize: '10px',
                        height: 20,
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Contact Support Section */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Card
          sx={{
            background: `linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)`,
            border: '1px solid #444444',
            borderRadius: 3,
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Avatar
              sx={{
                backgroundColor: '#1976d2',
                width: 64,
                height: 64,
                mr: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              }}
            >
              <ContactIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 600, mb: 0.5 }}>
                Still Need Help?
              </Typography>
              <Typography variant="body2" sx={{ color: '#cccccc' }}>
                Our support team is here to assist you
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ color: '#cccccc', mb: 3, maxWidth: 500, mx: 'auto' }}>
            Can't find the answer you're looking for? Contact our dedicated support team for personalized assistance with your complaint or consumer rights questions.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: '#ffffff',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              Contact Support
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#444444',
                color: '#cccccc',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#666666',
                  backgroundColor: '#333333',
                  color: '#ffffff'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Call +256-41-4230060
            </Button>
          </Box>
        </Card>
      </Box>
    </Container>
  );

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Enhanced Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid #333333',
          background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent 0%, #444444 50%, transparent 100%)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                backgroundColor: '#1976d2',
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              }}
            >
              <HelpIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Help & Support
              </Typography>
              <Typography variant="body2" sx={{ color: '#888888' }}>
                CTDRU Consumer Protection Services
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onBack}
            sx={{
              color: '#cccccc',
              backgroundColor: '#333333',
              '&:hover': { 
                backgroundColor: '#444444',
                color: '#ffffff',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <BackIcon />
          </IconButton>
        </Box>

        {/* Enhanced Tabs */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {[
            { id: 'forms', label: 'Complaint Forms', icon: <FormIcon />, description: 'File complaints' },
            { id: 'guides', label: 'How-to Guides', icon: <BookIcon />, description: 'Learn processes' },
            { id: 'faq', label: 'FAQ', icon: <FAQIcon />, description: 'Get answers' }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              startIcon={tab.icon}
              sx={{
                backgroundColor: activeTab === tab.id ? '#1976d2' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#cccccc',
                border: activeTab === tab.id ? '1px solid #1976d2' : '1px solid #444444',
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                minWidth: 160,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: activeTab === tab.id ? '#1565c0' : '#333333',
                  color: '#ffffff',
                  borderColor: activeTab === tab.id ? '#1565c0' : '#666666',
                  transform: 'translateY(-1px)',
                },
                '&::before': activeTab === tab.id ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #4caf50 0%, #2196f3 100%)',
                } : {},
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {tab.icon}
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {tab.label}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: activeTab === tab.id ? '#e3f2fd' : '#888888', fontSize: '11px' }}>
                  {tab.description}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>

      {/* Content with smooth transitions */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Slide direction="up" in={activeTab === 'forms'} timeout={300}>
          <Box sx={{ display: activeTab === 'forms' ? 'block' : 'none' }}>
            {renderFormsTab()}
          </Box>
        </Slide>
        <Slide direction="up" in={activeTab === 'guides'} timeout={300}>
          <Box sx={{ display: activeTab === 'guides' ? 'block' : 'none' }}>
            {renderGuidesTab()}
          </Box>
        </Slide>
        <Slide direction="up" in={activeTab === 'faq'} timeout={300}>
          <Box sx={{ display: activeTab === 'faq' ? 'block' : 'none' }}>
            {renderFAQsTab()}
          </Box>
        </Slide>
      </Box>
    </Box>
  );
};

export default Help;
