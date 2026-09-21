import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { tokens } from '../styles/theme';

const STEPS = [
  { label: 'Issue', hint: 'What went wrong' },
  { label: 'Facts', hint: 'Who, when, amount' },
  { label: 'Evidence', hint: 'SMS, receipts' },
  { label: 'Options', hint: 'Rights & remedies' },
  { label: 'Action', hint: 'File or escalate' },
];

const MethodologyBar = () => (
  <Box
    sx={{
      mb: 3,
      py: 1.5,
      borderBottom: '1px solid rgba(11,31,58,0.1)',
    }}
  >
    <Typography
      sx={{
        color: tokens.muted,
        fontSize: '0.7rem',
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        mb: 1.25,
      }}
    >
      Intake method
    </Typography>
    <Stack direction="row" spacing={0} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
      {STEPS.map((step, index) => (
        <Box
          key={step.label}
          sx={{
            flex: '1 1 auto',
            minWidth: 90,
            pr: 2,
          }}
        >
          <Typography
            sx={{
              color: tokens.navy,
              fontWeight: 600,
              fontSize: '0.8rem',
              mb: 0.25,
            }}
          >
            {index + 1}. {step.label}
          </Typography>
          <Typography
            sx={{
              color: tokens.muted,
              fontSize: '0.72rem',
              lineHeight: 1.3,
            }}
          >
            {step.hint}
          </Typography>
        </Box>
      ))}
    </Stack>
  </Box>
);

export default MethodologyBar;
