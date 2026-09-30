import React from 'react';
import { Box, Button, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { TopicArrowIcon, ChangeTopicIcon, topicGlyph } from './icons';
import { PanelGlyphBadge } from './PanelCard';
import { tokens, radii } from '../styles/theme';
import { useLanguage } from '../hooks/useLanguage';

const AUTO_INTENT = 'auto';

// Glyphs are chosen by the `icon` name the agent publishes at GET /intents; the mapping (and
// the older Material names it still accepts) lives with the rest of the icon set in ./icons.
const IntentGlyph = ({ name, size = 19, color }) => {
  const Glyph = topicGlyph(name);
  return <Glyph size={size} style={color ? { color } : undefined} />;
};

const splitIntents = (intents = []) => ({
  topics: intents.filter((intent) => intent.id !== AUTO_INTENT),
  auto: intents.find((intent) => intent.id === AUTO_INTENT) || null,
});

// Same boxed glyph the History / Documents / Help cards use (PanelCard.jsx), so the topic menu and
// the panels behind the sidebar are built from one recipe.
const TopicIconBadge = ({ icon, tone = 'paper' }) => (
  <PanelGlyphBadge glyph={topicGlyph(icon)} tone={tone} />
);

/** Inline text button, used for the few escape hatches the screens need. */
const InlineAction = ({ children, onClick, disabled = false }) => (
  <Box
    component="button"
    type="button"
    onClick={() => !disabled && onClick?.()}
    disabled={disabled}
    sx={{
      border: 'none',
      backgroundColor: 'transparent',
      color: tokens.navyMid,
      font: 'inherit',
      fontWeight: 600,
      cursor: disabled ? 'default' : 'pointer',
      p: 0,
      px: 0.25,
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      '&:hover': { color: tokens.navy },
      '&:focus-visible': { outline: `2px solid ${tokens.gold}`, outlineOffset: 2, borderRadius: '4px' },
    }}
  >
    {children}
  </Box>
);

/**
 * Topic name pinned to the top of the chat screen while a topic is selected, so the
 * user can always see which conversation the agent is routing to.
 */
export const TopicHeader = ({ topic, onClear, disabled = false }) => {
  const { t } = useLanguage();
  if (!topic) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.25,
          py: 0.6,
          minWidth: 0,
          flexShrink: 1,
          overflow: 'hidden',
          borderRadius: radii.pill,
          backgroundColor: tokens.navy,
          color: '#FFFFFF',
          boxShadow: '0 6px 16px -10px rgba(11,31,58,0.7)',
        }}
      >
        <IntentGlyph name={topic.icon} size={16} color={tokens.gold} />
        <Typography
          noWrap
          sx={{
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: '"Fraunces", Georgia, serif',
            letterSpacing: '0.01em',
          }}
        >
          {topic.label}
        </Typography>
      </Box>

      <Typography
        noWrap
        sx={{
          color: tokens.muted,
          fontSize: '0.78rem',
          display: { xs: 'none', xl: 'block' },
          minWidth: 0,
        }}
      >
        {topic.description}
      </Typography>

      <Button
        size="small"
        disabled={disabled}
        onClick={() => onClear?.()}
        startIcon={<ChangeTopicIcon />}
        sx={{
          flexShrink: 0,
          color: tokens.navy,
          textTransform: 'none',
          fontSize: '0.78rem',
          fontWeight: 600,
          px: 1,
          py: 0.25,
        }}
      >
        {t('topicHeader', 'changeTopic')}
      </Button>
    </Box>
  );
};

/**
 * The first screen: choose what the conversation is about. There is deliberately no
 * message box here - a topic is picked first, and the composer appears on the clean
 * screen that follows.
 */
export const TopicPicker = ({
  intents = [],
  onSelectTopic,
  onChatFreely,
  greeting = null,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const { topics, auto } = splitIntents(intents);
  if (topics.length === 0) return null;

  return (
    <Box sx={{ maxWidth: 820, mx: 'auto', py: { xs: 2, md: 5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
        <Box sx={{ width: 26, height: '1px', backgroundColor: tokens.gold }} />
        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: tokens.muted,
          }}
        >
          {t('welcome', 'ctdruHelp')}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
          fontSize: { xs: '1.6rem', md: '2rem' },
          letterSpacing: '-0.02em',
          color: tokens.navy,
          lineHeight: 1.15,
        }}
      >
        {t('welcome', 'whatHelp')}
      </Typography>
      <Typography sx={{ color: tokens.muted, fontSize: '0.9rem', mt: 1, mb: 3.5, maxWidth: 560 }}>
        {greeting ||
          t('welcome', 'text')}{' '}
        <Box component="span" sx={{ color: tokens.navyMid }}>
          {t('welcome', 'pickTopicNote')}
        </Box>
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {topics.map((topic) => (
          <Paper
            key={topic.id}
            component="button"
            type="button"
            elevation={0}
            onClick={() => !disabled && onSelectTopic?.(topic.id)}
            disabled={disabled}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.75,
              p: 2.25,
              textAlign: 'left',
              fontFamily: 'inherit',
              cursor: disabled ? 'default' : 'pointer',
              position: 'relative',
              border: `1px solid ${tokens.line}`,
              borderRadius: radii.card,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(11,31,58,0.03)',
              transition: 'border-color .18s ease, box-shadow .18s ease, transform .18s ease',
              '&:hover': {
                borderColor: 'rgba(11,31,58,0.28)',
                transform: 'translateY(-2px)',
                boxShadow: '0 18px 34px -24px rgba(11,31,58,0.45)',
                '& [data-topic-arrow]': { opacity: 1, transform: 'none' },
              },
              '&:focus-visible': { outline: `2px solid ${tokens.gold}`, outlineOffset: 2 },
            }}
          >
            <TopicIconBadge icon={topic.icon} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: tokens.navy,
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {topic.label}
              </Typography>
              {topic.description && (
                <Typography sx={{ color: tokens.muted, fontSize: '0.82rem', lineHeight: 1.5, mt: 0.6 }}>
                  {topic.description}
                </Typography>
              )}
            </Box>
            <Box
              data-topic-arrow=""
              sx={{
                position: 'absolute',
                top: 18,
                right: 18,
                opacity: 0,
                transform: 'translateY(4px)',
                transition: 'opacity .18s ease, transform .18s ease',
                color: tokens.navyMid,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <TopicArrowIcon />
            </Box>
          </Paper>
        ))}
      </Box>

      {auto && (
        <Typography sx={{ color: tokens.muted, fontSize: '0.8rem', mt: 3 }}>
          {t('welcome', 'notSureWhich')}
          <InlineAction onClick={() => onChatFreely?.()} disabled={disabled}>
            {auto.label ? auto.label.toLowerCase() : t('welcome', 'chatFreely')}
          </InlineAction>
          {t('welcome', 'andDescribe')}
        </Typography>
      )}
    </Box>
  );
};

/**
 * The topic's own screen, shown before the first message: what it covers, example openers,
 * and the way back to the full menu. The composer sits below it.
 */
export const TopicBrief = ({ topic, disabled = false, onUseExample, onChangeTopic }) => {
  const { t } = useLanguage();
  if (!topic) return null;
  const examples = Array.isArray(topic.examples) ? topic.examples : [];

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2.5,
        border: `1px solid ${tokens.line}`,
        borderRadius: radii.card,
        backgroundColor: '#FFFFFF',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
        <TopicIconBadge icon={topic.icon} tone="gold" />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: tokens.navy,
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.15rem',
              letterSpacing: '-0.01em',
            }}
          >
            {topic.label}
          </Typography>
          {topic.description && (
            <Typography sx={{ color: tokens.muted, fontSize: '0.85rem', lineHeight: 1.55, mt: 0.5 }}>
              {topic.description}
            </Typography>
          )}
        </Box>
      </Box>

      {examples.length > 0 && (
        <Box sx={{ mt: 2.25 }}>
          <Typography
            sx={{
              color: tokens.muted,
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            {t('topicBrief', 'startWith')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {examples.map((example) => (
              <Tooltip key={example} title={example} placement="top">
                <Chip
                  label={example}
                  size="small"
                  disabled={disabled}
                  onClick={() => !disabled && onUseExample?.(example)}
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    py: 0.75,
                    px: 0.5,
                    borderRadius: radii.pill,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${tokens.line}`,
                    color: tokens.ink,
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    whiteSpace: 'normal',
                    textAlign: 'left',
                    '& .MuiChip-label': { px: 1.25, whiteSpace: 'normal' },
                    '&:hover': { borderColor: tokens.navyMid, backgroundColor: tokens.paperElevated },
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Box>
      )}

      <Typography sx={{ color: tokens.muted, fontSize: '0.76rem', mt: 2.25 }}>
        {t('topicBrief', 'everythingGoesHere')}
        <InlineAction onClick={() => onChangeTopic?.()} disabled={disabled}>
          {t('topicBrief', 'changeTopic')}
        </InlineAction>
      </Typography>
    </Paper>
  );
};
