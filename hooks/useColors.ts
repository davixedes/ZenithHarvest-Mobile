import { useThemeContext } from '@/store/themeContext';
import { colors, darkColors, gradients } from '@/constants/theme';

export function useColors() {
  const { isDark } = useThemeContext();
  return isDark ? darkColors : colors;
}

export function useGradient() {
  const { isDark } = useThemeContext();
  return isDark ? gradients.primaryDark : gradients.primary;
}
