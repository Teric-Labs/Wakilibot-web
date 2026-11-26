import React from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import { tokens, radii } from '../styles/theme';
import { PanelSectionLabel } from './PanelCard';

const USSD_CODE = process.env.REACT_APP_USSD_CODE || '*384*23530#';
const SMS_SHORTCODE = process.env.REACT_APP_SMS_SHORTCODE || '13276';

const Section = ({ title, children }) => (
  <Box
    sx={{
      mb: 3.5,
      p: { xs: 2.25, md: 2.75 },
      borderRadius: radii.card,
      border: `1px solid ${tokens.line}`,
      backgroundColor: '#FFFFFF',
    }}
  >
    <Typography
      sx={{
        fontFamily: '"Fraunces", Georgia, serif',
        fontWeight: 650,
        fontSize: '1.2rem',
        color: tokens.navy,
        mb: 1.25,
      }}
    >
      {title}
    </Typography>
    <Stack spacing={1.1}>{children}</Stack>
  </Box>
);

const Line = ({ children }) => (
  <Typography sx={{ color: tokens.ink, lineHeight: 1.6, fontSize: '0.98rem' }}>
    {children}
  </Typography>
);

const Code = ({ children }) => (
  <Box
    component="code"
    sx={{
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '0.9em',
      px: 0.75,
      py: 0.15,
      borderRadius: 1,
      backgroundColor: tokens.sand,
      color: tokens.navy,
      border: `1px solid ${tokens.line}`,
    }}
  >
    {children}
  </Box>
);

/**
 * In-app channel usage guide for web, SMS, USSD, and IVR.
 * Designed as a single readable panel (not a marketing landing page).
 */
const UserGuide = () => (
  <Box>
    <Typography sx={{ color: tokens.muted, mb: 3.5, maxWidth: 640, lineHeight: 1.6 }}>
      Use Wakilibot on the channel that fits your phone and data. Complaint filing,
      status checks, and fraud reports work across web, SMS, and USSD. Voice (IVR)
      follows the same CTDRU intake rules.
    </Typography>

    <PanelSectionLabel>Channels</PanelSectionLabel>

    <Section title="Web chat">
      <Line>Open this site on a smartphone or computer. Sign in is optional for guidance.</Line>
      <Line>1. Pick a topic (complaint, status, fraud, rights) or type freely.</Line>
      <Line>2. Answer the assistant’s questions. Attach evidence when asked (PDF or image).</Line>
      <Line>3. Use the mic for voice messages, or Voice mode for hands-free turns.</Line>
      <Line>4. Change language from the header — replies follow your selection.</Line>
      <Line>5. Documents in the sidebar are CTDRU reference materials you can open or download.</Line>
    </Section>

    <Section title="SMS">
      <Line>
        Text the shortcode <Code>{SMS_SHORTCODE}</Code> (Africa’s Talking).
      </Line>
      <Line>
        First message returns a menu: <Code>1</Code> complaint, <Code>2</Code> status,{' '}
        <Code>3</Code> fraud, <Code>4</Code> rights.
      </Line>
      <Line>
        Language (default English): start with a code, then a dash — e.g.{' '}
        <Code>lug-Njagala okuteeka complaint</Code>, <Code>swa: habari</Code>,{' '}
        <Code>en-hello</Code>.
      </Line>
      <Line>
        Codes: <Code>lug</Code> Luganda, <Code>swa</Code> Swahili, <Code>nyn</Code> Runyankole,{' '}
        <Code>ach</Code> Acholi, <Code>teo</Code> Ateso, <Code>en</Code> English.
      </Line>
      <Line>
        Send <Code>MENU</Code> or <Code>HELP</Code> anytime to see the menu again.
      </Line>
    </Section>

    <Section title="USSD">
      <Line>
        Dial <Code>{USSD_CODE}</Code> on any feature phone or smartphone.
      </Line>
      <Line>1. Choose language (English, Luganda, Swahili, Runyankole, Acholi, Ateso).</Line>
      <Line>2. Then choose: 1 Complaint · 2 Status · 3 Fraud · 4 Rights.</Line>
      <Line>3. Follow the prompts. Screens are short — keep answers brief.</Line>
      <Line>
        Later dials remember your language. Press <Code>0</Code> on the home menu to change it.
      </Line>
    </Section>

    <Section title="IVR (voice call)">
      <Line>Call the published CTDRU / Wakilibot voice line when available on your network.</Line>
      <Line>Speak clearly after the prompt. You can ask to file a complaint, check status, or report fraud.</Line>
      <Line>Have your phone number and any transaction or case ID ready.</Line>
      <Line>If the line is busy, use USSD or SMS — the same case register receives the intake.</Line>
    </Section>

    <Divider sx={{ my: 2, borderColor: tokens.line }} />

    <PanelSectionLabel>Tips</PanelSectionLabel>
    <Box
      sx={{
        p: { xs: 2.25, md: 2.75 },
        borderRadius: radii.card,
        border: `1px solid ${tokens.line}`,
        backgroundColor: tokens.sand,
      }}
    >
      <Stack spacing={1}>
        <Line>Keep transaction IDs, SMS confirmations, and amounts ready before you start.</Line>
        <Line>Guidance is informational — CTDRU officers handle formal resolution.</Line>
        <Line>For urgent fraud (PIN theft, SIM-swap), use Report fraud on web or USSD/SMS option 3.</Line>
      </Stack>
    </Box>
  </Box>
);

export default UserGuide;
