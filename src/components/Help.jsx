import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
} from '@mui/material';
import {
  ExpandSectionIcon,
  ComplaintTopicIcon,
  FraudTopicIcon,
  PhoneIcon,
  EmailIcon,
  TopicArrowIcon,
} from './icons';
import PanelCard, { PanelSectionLabel } from './PanelCard';
import { tokens, radii } from '../styles/theme';

const FAQ = [
  {
    q: 'How long does a complaint take?',
    a: 'Most CTDRU complaints are reviewed within 30 days. Complex cases may take longer. You will receive updates by email or SMS.',
  },
  {
    q: 'What evidence should I attach?',
    a: 'Transaction IDs, SMS confirmations, bank statements, receipts, screenshots, and any correspondence with the provider.',
  },
  {
    q: 'Can I report fraud urgently?',
    a: 'Yes. Use Report fraud for PIN theft, phishing, SIM-swap, or unauthorized transfers. Act quickly and keep evidence.',
  },
  {
    q: 'Do I need an account?',
    a: 'You can start as a guest. Sign in to save case history and track complaint status more easily.',
  },
];

// Both action cards hand off to the chat with the matching topic already selected, so the
// agent's intake flow is the only form a user ever fills in.
const Help = ({ onFileComplaint, onReportFraud }) => {
  const arrow = (
    <Box
      component="span"
      data-card-arrow
      sx={{
        alignSelf: 'center',
        display: { xs: 'none', sm: 'grid' },
        placeItems: 'center',
        color: tokens.muted,
        opacity: 0,
        transform: 'translateX(-4px)',
        transition: 'opacity .18s ease, transform .18s ease',
      }}
    >
      <TopicArrowIcon />
    </Box>
  );

  return (
    <Box>
      <Stack spacing={1.5} sx={{ mb: 4.5 }}>
        <PanelCard
          glyph={ComplaintTopicIcon}
          title="File a complaint"
          meta="Takes about 4 minutes"
          description="Unresolved transaction, unfair charge, or a service the provider keeps ignoring. We collect the details and give you a reference."
          onClick={onFileComplaint}
          trailing={arrow}
        />
        <PanelCard
          glyph={FraudTopicIcon}
          tone="gold"
          title="Report fraud"
          meta="Urgent - PIN theft, phishing, SIM-swap"
          description="Something moved out of your account without you, or someone is asking for your PIN or OTP. Say it plainly and we escalate."
          onClick={onReportFraud}
          trailing={arrow}
        />
      </Stack>

      <PanelSectionLabel>Frequently asked questions</PanelSectionLabel>
      <Paper
        elevation={0}
        sx={{
          mb: 4.5,
          border: `1px solid ${tokens.line}`,
          borderRadius: radii.card,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {FAQ.map((item) => (
          <Accordion
            key={item.q}
            disableGutters
            elevation={0}
            sx={{
              '&:not(:last-child)': { borderBottom: `1px solid ${tokens.line}` },
              '&:before': { display: 'none' },
              backgroundColor: 'transparent',
              transition: 'background-color .14s ease',
              '&:hover': { backgroundColor: tokens.paper },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandSectionIcon style={{ color: tokens.muted }} />}
              sx={{ '& .MuiAccordionSummary-content': { m: 0 } }}
            >
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  color: tokens.navy,
                  fontSize: '0.97rem',
                }}
              >
                {item.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: 2.25, pb: 2.25 }}>
              <Typography sx={{ color: tokens.muted, lineHeight: 1.65, fontSize: '0.9rem' }}>
                {item.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <PanelCard
        glyph={PhoneIcon}
        title="Need a person?"
        meta="CTDRU consumer line"
        description="If you would rather speak to someone, or your matter is urgent, the directorate's line and email are here."
        footer={
          <Stack spacing={0.75}>
            <Box
              component="a"
              href="tel:+256414230060"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: tokens.navy,
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <PhoneIcon size={14} />
              +256 41 423 0060
            </Box>
            <Box
              component="a"
              href="mailto:ctdru@bou.or.ug"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: tokens.navy,
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <EmailIcon size={14} />
              ctdru@bou.or.ug
            </Box>
          </Stack>
        }
      />
    </Box>
  );
};

export default Help;
