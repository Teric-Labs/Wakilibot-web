import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { tokens } from '../styles/theme';
import ComplaintForm from './ComplaintForm';

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

const Help = ({ onBack, onFileComplaint, onReportFraud }) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <ComplaintForm onBack={() => setShowForm(false)} />;
  }

  return (
    <Box>
      <Typography sx={{ color: tokens.muted, mb: 3, lineHeight: 1.6, maxWidth: 560 }}>
        Guides for filing complaints, reporting fraud, and understanding CTDRU consumer protection.
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={onFileComplaint || (() => setShowForm(true))}
          sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.4 }}
        >
          File a complaint
        </Button>
        <Button
          variant="outlined"
          onClick={onReportFraud}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            py: 1.4,
            borderColor: 'rgba(11,31,58,0.2)',
            color: tokens.navy,
          }}
        >
          Report fraud
        </Button>
      </Stack>

      <Typography
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
          fontSize: '1.15rem',
          mb: 1.5,
        }}
      >
        Frequently asked questions
      </Typography>

      {FAQ.map((item) => (
        <Accordion
          key={item.q}
          disableGutters
          elevation={0}
          sx={{
            borderBottom: '1px solid rgba(11,31,58,0.1)',
            '&:before': { display: 'none' },
            background: 'transparent',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: tokens.muted }} />}>
            <Typography sx={{ fontWeight: 560, color: tokens.navy, fontSize: '0.95rem' }}>
              {item.q}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: tokens.muted, lineHeight: 1.65, fontSize: '0.92rem' }}>
              {item.a}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box
        sx={{
          mt: 4,
          p: 2.5,
          borderRadius: 2,
          background: tokens.paper,
          border: '1px solid rgba(11,31,58,0.08)',
        }}
      >
        <Typography sx={{ fontWeight: 600, mb: 0.75 }}>Need a person?</Typography>
        <Typography sx={{ color: tokens.muted, fontSize: '0.9rem', mb: 0.5 }}>
          CTDRU consumer line: +256-41-4230060
        </Typography>
        <Typography sx={{ color: tokens.muted, fontSize: '0.9rem' }}>
          Email: ctdru@bou.or.ug
        </Typography>
      </Box>
    </Box>
  );
};

export default Help;
