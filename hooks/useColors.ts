import { useColorScheme } from 'react-native';

import { colors, darkColors, gradients } from '@/constants/theme';

export function useColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : colors;
}

export function useGradient() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? gradients.primaryDark : gradients.primary;
}
