import { createTheme } from '@mui/material/styles';

export const tokens = {
  navy: '#0B1F3A',
  navyMid: '#14345C',
  ink: '#15202B',
  inkSoft: '#1C2A37',
  paper: '#F7F4EF',
  paperElevated: '#FFFcf8',
  sand: '#E8E1D5',
  gold: '#B8860B',
  goldSoft: '#D4A84B',
  success: '#2F6B4F',
  danger: '#9B2C2C',
  muted: '#5C6B7A',
  line: 'rgba(11, 31, 58, 0.12)',
  chatBg: '#121A22',
  chatPanel: '#1A242F',
  chatBubbleBot: '#243140',
  chatBubbleUser: '#1E4D7B',
};

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.navy,
      dark: '#061426',
      light: tokens.navyMid,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: tokens.gold,
      dark: '#8A6508',
      light: tokens.goldSoft,
      contrastText: tokens.navy,
    },
    success: {
      main: tokens.success,
    },
    error: {
      main: tokens.danger,
    },
    background: {
      default: tokens.paper,
      paper: tokens.paperElevated,
    },
    text: {
      primary: tokens.navy,
      secondary: tokens.muted,
    },
    divider: tokens.line,
  },
  typography: {
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    h2: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    h3: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 560,
    },
    h6: {
      fontFamily: '"Source Sans 3", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Source Sans 3", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1.05rem',
      lineHeight: 1.65,
    },
    body2: {
      fontSize: '0.95rem',
      lineHeight: 1.55,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(11, 31, 58, 0.04)',
    '0 4px 16px rgba(11, 31, 58, 0.06)',
    '0 8px 28px rgba(11, 31, 58, 0.08)',
    '0 12px 40px rgba(11, 31, 58, 0.1)',
    ...Array(20).fill('0 12px 40px rgba(11, 31, 58, 0.1)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--navy': tokens.navy,
          '--navy-mid': tokens.navyMid,
          '--ink': tokens.ink,
          '--paper': tokens.paper,
          '--sand': tokens.sand,
          '--gold': tokens.gold,
          '--success': tokens.success,
          '--muted': tokens.muted,
          '--line': tokens.line,
        },
        body: {
          backgroundColor: tokens.paper,
          color: tokens.navy,
        },
        '::selection': {
          background: 'rgba(184, 134, 11, 0.25)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 22,
          paddingBlock: 10,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: `2px solid ${tokens.gold}`,
            outlineOffset: 2,
          },
        },
        containedPrimary: {
          backgroundColor: tokens.navy,
          '&:hover': {
            backgroundColor: tokens.navyMid,
          },
        },
        containedSecondary: {
          backgroundColor: tokens.gold,
          color: tokens.navy,
          '&:hover': {
            backgroundColor: tokens.goldSoft,
          },
        },
        outlined: {
          borderColor: tokens.line,
          color: tokens.navy,
          '&:hover': {
            borderColor: tokens.navy,
            backgroundColor: 'rgba(11, 31, 58, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: tokens.paperElevated,
            borderRadius: 12,
            '& fieldset': {
              borderColor: tokens.line,
            },
            '&:hover fieldset': {
              borderColor: tokens.navyMid,
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.navy,
              borderWidth: 1.5,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default baseTheme;
