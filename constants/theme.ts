export const colors = {
  primary: '#1D9E75',
  secondary: '#0F6E56',
  danger: '#D85A30',
  warning: '#EF9F27',
  success: '#1D9E75',
  background: '#F9F9F7',
  surface: '#FFFFFF',
  border: '#E8E8E5',
  text: '#2C2C2A',
  textMuted: '#888780',
  textOnPrimary: '#FFFFFF',
};

export const typography = {
  heading: { fontSize: 22, fontWeight: '600' as const },
  subheading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, color: colors.textMuted },
  label: { fontSize: 14, fontWeight: '500' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  full: 999,
};
