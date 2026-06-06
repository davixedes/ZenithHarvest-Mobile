import { Stack } from 'expo-router';

import { useColors } from '@/hooks/useColors';

export default function ClaimsLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17, color: colors.text },
        headerShadowVisible: false,
      }}
    />
  );
}
