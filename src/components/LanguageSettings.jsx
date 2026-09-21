import React, { useState } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { tokens } from '../styles/theme';
import { useLanguage } from '../hooks/useLanguage';

const sharp = {
  borderRadius: 0,
};

const LanguageSettings = () => {
  const { selectedLanguage, updateLanguage, languageOptions, getCurrentLanguageInfo } =
    useLanguage();
  const [savedCode, setSavedCode] = useState(null);
  const current = getCurrentLanguageInfo();

  const handleSelect = (code) => {
    if (code === selectedLanguage) return;
    updateLanguage(code);
    setSavedCode(code);
    setTimeout(() => setSavedCode(null), 2200);
  };

  return (
    <Box sx={{ maxWidth: 520 }}>
      <Typography
        sx={{
          color: tokens.muted,
          mb: 3,
          lineHeight: 1.65,
          fontSize: '0.95rem',
        }}
      >
        Choose the language Wakilibot should prefer for guidance and replies.
      </Typography>

      <Box
        sx={{
          ...sharp,
          border: `1px solid ${tokens.line}`,
          backgroundColor: '#FFFFFF',
          mb: 3,
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: `1px solid ${tokens.line}`,
            backgroundColor: tokens.paper,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: tokens.muted,
              fontWeight: 600,
            }}
          >
            Preferred language
          </Typography>
        </Box>

        <Stack spacing={0}>
          {languageOptions.map((language, index) => {
            const selected = language.code === selectedLanguage;
            return (
              <Button
                key={language.code}
                onClick={() => handleSelect(language.code)}
                disableElevation
                sx={{
                  ...sharp,
                  justifyContent: 'space-between',
                  textTransform: 'none',
                  px: 2,
                  py: 1.5,
                  color: tokens.navy,
                  backgroundColor: selected ? 'rgba(11,31,58,0.04)' : '#FFFFFF',
                  borderBottom:
                    index < languageOptions.length - 1
                      ? `1px solid ${tokens.line}`
                      : 'none',
                  '&:hover': {
                    backgroundColor: selected
                      ? 'rgba(11,31,58,0.06)'
                      : tokens.paper,
                  },
                }}
              >
                <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: selected ? 650 : 500,
                      fontSize: '0.95rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {language.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: tokens.muted,
                      fontSize: '0.75rem',
                      mt: 0.25,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {language.code}
                  </Typography>
                </Box>
                {selected && (
                  <CheckIcon sx={{ fontSize: 18, color: tokens.navy, flexShrink: 0 }} />
                )}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {savedCode && (
        <Box
          sx={{
            ...sharp,
            mb: 3,
            px: 2,
            py: 1.25,
            border: `1px solid ${tokens.line}`,
            borderLeft: `3px solid ${tokens.gold}`,
            backgroundColor: tokens.paper,
          }}
        >
          <Typography sx={{ fontSize: '0.88rem', color: tokens.navy }}>
            Language updated to {current?.name || 'English'}.
          </Typography>
        </Box>
      )}

      <Typography sx={{ color: tokens.muted, fontSize: '0.85rem', lineHeight: 1.6 }}>
        You can still describe issues in other Ugandan languages during chat. This setting
        guides default replies.
      </Typography>
    </Box>
  );
};

export default LanguageSettings;
