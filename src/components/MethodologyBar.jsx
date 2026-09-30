import React from 'react';
import { Box, Typography } from '@mui/material';
import { FlowArrowIcon } from './icons';
import { tokens, radii } from '../styles/theme';

const STEPS = [
  { label: 'Issue', hint: 'What went wrong' },
  { label: 'Facts', hint: 'Who, when, amount' },
  { label: 'Evidence', hint: 'SMS, receipts' },
  { label: 'Options', hint: 'Rights & remedies' },
  { label: 'Action', hint: 'File or escalate' },
];

/** The intake method as one quiet line, so it explains the product without competing
 *  with the topic cards above it. */
const MethodologyBar = () => (
  <Box
    sx={{
      mt: 5,
      pt: 2.5,
      borderTop: `1px solid ${tokens.line}`,
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 1,
    }}
  >
    <Typography
      sx={{
        color: tokens.muted,
        fontSize: '0.66rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        mr: 0.5,
      }}
    >
      How intake works
    </Typography>

    {STEPS.map((step, index) => (
      <Box key={step.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {index > 0 && (
          <FlowArrowIcon style={{ color: 'rgba(11,31,58,0.28)' }} />
        )}
        <Typography
          title={step.hint}
          sx={{
            px: 1.1,
            py: 0.35,
            borderRadius: radii.pill,
            backgroundColor: tokens.paper,
            border: `1px solid ${tokens.line}`,
            color: tokens.navy,
            fontSize: '0.76rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            cursor: 'default',
          }}
        >
          {step.label}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default MethodologyBar;
