import React, { useState } from 'react';
import { Box, Divider, IconButton, Menu, MenuItem, Paper, Typography } from '@mui/material';
import { CardMenuIcon } from './icons';
import { tokens, radii } from '../styles/theme';

/**
 * The one card used by every panel behind the sidebar - History, Documents and Help - so the
 * three of them read as the same product as the topic menu on the chat screen.
 *
 * The recipe is deliberately the topic card's recipe: white, square (`radii.card`), one hairline
 * of `tokens.line`, a boxed glyph on the left, a Fraunces title, and a lift with a deeper hairline
 * on hover. Anything that used to be a rounded tinted box with a shadow is now this.
 */

/** The one small-caps label used inside panels - card meta lines, section titles, field rows. */
export const uppercaseLabelSx = {
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: tokens.muted,
};

/**
 * The one menu look in the workspace: square, a single hairline, one soft shadow underneath.
 * Spread into MUI's `slotProps.paper` - used by the card action menus and the chat's options menu.
 */
export const menuPaperProps = {
  elevation: 0,
  sx: {
    mt: 0.5,
    minWidth: 210,
    border: `1px solid ${tokens.line}`,
    borderRadius: radii.card,
    boxShadow: '0 22px 44px -26px rgba(11,31,58,0.5)',
  },
};

/** Boxed glyph on the left of a card. Same 38px square as the topic cards' badge. */
export const PanelGlyphBadge = ({ glyph: Glyph, tone = 'paper', size = 19 }) => {
  if (!Glyph) return null;
  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: radii.card,
        border: '1px solid',
        borderColor: tone === 'gold' ? 'rgba(184,134,11,0.4)' : tokens.line,
        backgroundColor: tone === 'gold' ? 'rgba(184,134,11,0.08)' : tokens.paper,
        color: tone === 'gold' ? tokens.gold : tokens.navyMid,
      }}
    >
      <Glyph size={size} />
    </Box>
  );
};

const PanelCard = ({
  glyph,
  tone = 'paper',
  title,
  meta,
  description,
  footer,
  trailing,
  actions,
  onClick,
  selected = false,
  disabled = false,
  sx,
}) => {
  const interactive = typeof onClick === 'function';

  // The card is a div with role="button" rather than a real <button> because it carries its own
  // action menu inside it - a <button> may not nest another one.
  const handleKeyDown = (event) => {
    if (!interactive || disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <Paper
      component="div"
      role={interactive ? 'button' : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      aria-disabled={interactive && disabled ? true : undefined}
      onClick={interactive && !disabled ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.75,
        width: '100%',
        p: 2.25,
        textAlign: 'left',
        fontFamily: 'inherit',
        border: '1px solid',
        borderColor: selected ? tokens.navy : tokens.line,
        borderRadius: radii.card,
        backgroundColor: selected ? tokens.paper : '#FFFFFF',
        boxShadow: '0 1px 2px rgba(11,31,58,0.03)',
        transition: 'border-color .18s ease, box-shadow .18s ease, transform .18s ease',
        ...(interactive && {
          cursor: disabled ? 'default' : 'pointer',
          '&:hover': disabled
            ? undefined
            : {
                borderColor: 'rgba(11,31,58,0.28)',
                transform: 'translateY(-2px)',
                boxShadow: '0 18px 34px -24px rgba(11,31,58,0.45)',
                '& [data-card-arrow]': { opacity: 1, transform: 'none' },
              },
          '&:focus-visible': { outline: `2px solid ${tokens.gold}`, outlineOffset: 2 },
        }),
        ...sx,
      }}
    >
      <PanelGlyphBadge glyph={glyph} tone={tone} />

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            color: tokens.navy,
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '-0.01em',
            lineHeight: 1.35,
          }}
        >
          {title}
        </Typography>

        {meta && (
          <Typography sx={{ ...uppercaseLabelSx, mt: 0.6 }}>{meta}</Typography>
        )}

        {description && (
          <Typography sx={{ color: tokens.muted, fontSize: '0.85rem', lineHeight: 1.55, mt: 0.7 }}>
            {description}
          </Typography>
        )}

        {footer && <Box sx={{ mt: 1.25 }}>{footer}</Box>}
      </Box>

      {trailing}

      {actions && actions.length > 0 && <PanelCardActions actions={actions} />}
    </Paper>
  );
};

/**
 * The vertical dots pinned to the top-right of a card, holding everything that is not the card's
 * own reason for existing. Keeping "View", "Download" and "Copy link" out of the card body is what
 * lets a Documents row, a History row and a topic card all share one shape.
 *
 * `actions`: [{ id, label, icon: IconComponent, onClick, disabled, danger, divider }]
 */
export const PanelCardActions = ({ actions, label = 'Card actions' }) => {
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);

  return (
    <Box sx={{ marginLeft: 'auto', alignSelf: 'flex-start', flexShrink: 0, mr: -1, mt: -1.25 }}>
      <IconButton
        size="small"
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          setAnchor(event.currentTarget);
        }}
        sx={{
          color: tokens.muted,
          borderRadius: radii.card,
          border: '1px solid transparent',
          '&:hover': {
            color: tokens.navy,
            backgroundColor: '#FFFFFF',
            borderColor: tokens.line,
          },
          '&:focus-visible': { outline: `2px solid ${tokens.gold}`, outlineOffset: 1 },
        }}
      >
        <CardMenuIcon />
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: menuPaperProps }}
      >
        {actions.map((action, index) =>
          action.divider ? (
            <Divider key={`rule-${index}`} sx={{ borderColor: tokens.line }} />
          ) : (
            <MenuItem
              key={action.id || action.label || index}
              disabled={action.disabled}
              onClick={() => {
                close();
                action.onClick?.();
              }}
              sx={action.danger ? { ...menuItemSx, color: 'error.main' } : menuItemSx}
            >
              {action.icon ? <action.icon size={15} /> : <Box sx={{ width: 15 }} />}
              {action.label}
            </MenuItem>
          ),
        )}
      </Menu>
    </Box>
  );
};

/** Row styling inside any workspace menu: a 15px glyph, a short gap, no text transforms. */
export const menuItemSx = {
  gap: 1.25,
  py: 1.1,
  fontSize: '0.88rem',
  color: tokens.navy,
  '&:hover': { backgroundColor: tokens.paper },
  '&.Mui-disabled': { color: 'rgba(11,31,58,0.32)' },
};

/** Uppercase section label, the same one the chat screen uses above example openers. */
export const PanelSectionLabel = ({ children, sx }) => (
  <Typography
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      mb: 1.5,
      ...uppercaseLabelSx,
      letterSpacing: '0.14em',
      ...sx,
    }}
  >
    <Box sx={{ width: 22, height: '1px', backgroundColor: tokens.gold, flexShrink: 0 }} />
    {children}
  </Typography>
);

/** The empty list, said properly instead of a line of grey text. */
export const PanelEmptyState = ({ glyph, title, note }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.75,
      p: 2.25,
      border: `1px solid ${tokens.line}`,
      borderRadius: radii.card,
      backgroundColor: tokens.paper,
    }}
  >
    <PanelGlyphBadge glyph={glyph} />
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          color: tokens.navy,
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}
      >
        {title}
      </Typography>
      {note && (
        <Typography sx={{ color: tokens.muted, fontSize: '0.84rem', mt: 0.4, lineHeight: 1.5 }}>
          {note}
        </Typography>
      )}
    </Box>
  </Box>
);

export default PanelCard;
