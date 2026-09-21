import React from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../styles/theme';

// Public folder URLs so images always resolve in the browser
const featurePhone = `${process.env.PUBLIC_URL || ''}/channels/channel-feature-phone.png`;
const smartphone = `${process.env.PUBLIC_URL || ''}/channels/channel-smartphone.png`;
const smsArt = `${process.env.PUBLIC_URL || ''}/channels/channel-sms.png`;
const ussdArt = `${process.env.PUBLIC_URL || ''}/channels/channel-ussd.png`;

const channels = [
  {
    id: 'feature',
    title: 'Feature phone',
    body: 'Access guidance on basic handsets used across Uganda—no smartphone required.',
    image: featurePhone,
  },
  {
    id: 'smart',
    title: 'Smartphone app',
    body: 'Chat with Wakilibot on the web for richer conversation and document support.',
    image: smartphone,
  },
  {
    id: 'sms',
    title: 'SMS',
    body: 'Short-message support for quick questions when data is limited.',
    image: smsArt,
  },
  {
    id: 'ussd',
    title: 'USSD',
    body: 'Menu-driven access for complaint status and essential help on any network.',
    image: ussdArt,
  },
];

const ChannelAccess = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 11 }, background: tokens.paperElevated }}>
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 4 } }}>
      <Typography
        variant="h2"
        sx={{ fontSize: { xs: '1.85rem', md: '2.35rem' }, mb: 1.5, maxWidth: 520 }}
      >
        Reach us on every phone
      </Typography>
      <Typography sx={{ color: tokens.muted, mb: 5, maxWidth: 560, fontSize: '1.05rem' }}>
        From village feature phones to smartphones—SMS, USSD, and chat—so complaint
        capture and fraud reporting stay accessible across Uganda.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: { xs: 3, md: 3.5 },
        }}
      >
        {channels.map((channel) => (
          <Box key={channel.id} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: tokens.sand,
                mb: 2,
                border: `1px solid ${tokens.line}`,
                height: { xs: 220, md: 260 },
              }}
            >
              <Box
                component="img"
                src={channel.image}
                alt={channel.title}
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
            <Typography
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: '1.2rem',
                mb: 0.75,
                color: tokens.navy,
              }}
            >
              {channel.title}
            </Typography>
            <Typography sx={{ color: tokens.muted, lineHeight: 1.55, fontSize: '0.95rem' }}>
              {channel.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

export default ChannelAccess;
