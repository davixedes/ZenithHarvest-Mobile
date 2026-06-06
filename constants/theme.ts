// ── Light (Mottu AI Reports — light mode) ────────────────────────────────────
export const colors = {
  primary: '#00B131',
  primaryDark: '#006E1B',
  primaryLight: '#E0FFCC',
  primaryAlt: '#05AF31',

  secondary: '#A2FF00',
  secondaryDark: '#65A100',

  success: '#00B131',
  successBg: '#E0FFCC',
  warning: '#EF6800',
  warningBg: '#FFDBCB',
  danger: '#FF5449',
  dangerBg: '#FFDAD6',
  info: '#0063F7',
  infoBg: '#C2DAFF',

  background: '#F7F7F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEEEEE',
  border: '#E0E0E0',
  borderStrong: '#C4C4C4',
  borderLight: 'rgba(0, 0, 0, 0.05)',

  text: '#121212',
  textSecondary: '#4F4F4F',
  textMuted: '#8F8F8F',
  textLight: '#C4C4C4',
  textOnPrimary: '#FFFFFF',
  textOnGradient: '#000000',
};

// ── Dark (Mottu AI Reports — dark mode) ──────────────────────────────────────
export const darkColors: typeof colors = {
  primary: '#1BD60B',
  primaryDark: '#008A24',
  primaryLight: 'rgba(27, 214, 11, 0.2)',
  primaryAlt: '#1BD60B',

  secondary: '#A2FF00',
  secondaryDark: '#65A100',

  success: '#1BD60B',
  successBg: 'rgba(0, 177, 49, 0.18)',
  warning: '#EF6800',
  warningBg: 'rgba(239, 104, 0, 0.18)',
  danger: '#FF5449',
  dangerBg: 'rgba(255, 84, 73, 0.15)',
  info: '#0063F7',
  infoBg: 'rgba(0, 99, 247, 0.15)',

  background: '#121212',
  surface: '#272727',
  surfaceSecondary: '#4F4F4F',
  border: '#4F4F4F',
  borderStrong: '#616161',
  borderLight: 'rgba(255, 255, 255, 0.06)',

  text: '#F7F7F7',
  textSecondary: '#C4C4C4',
  textMuted: '#8F8F8F',
  textLight: '#616161',
  textOnPrimary: '#121212',
  textOnGradient: '#121212',
};

// ── Gradients ─────────────────────────────────────────────────────────────────
export const gradients = {
  primary: ['#05AF31', '#5CB526'] as [string, string],
  primaryDark: ['#1BD60B', '#A2FF00'] as [string, string],
};

// ── Typography ────────────────────────────────────────────────────────────────
export const typography = {
  display: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  heading: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  title: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  label: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0.1 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
  subheading: { fontSize: 18, fontWeight: '600' as const },
};

// ── Spacing ───────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ── Radius ────────────────────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 25,
  full: 999,
};

// ── Shadows ───────────────────────────────────────────────────────────────────
export const shadow = {
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};
