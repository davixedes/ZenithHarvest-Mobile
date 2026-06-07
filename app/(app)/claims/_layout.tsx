import { Stack } from 'expo-router';

import { fonts } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

export default function ClaimsLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
        headerShadowVisible: false,
        contentStyle: { flex: 1, backgroundColor: colors.background },
      }}
    />
  );
}
