import { Stack } from 'expo-router';

import { fonts } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

// Garante que a lista (`index`) seja sempre a base da pilha, mesmo quando o
// detalhe é aberto direto de outra aba — assim "voltar" retorna para a lista.
export const unstable_settings = {
  initialRouteName: 'index',
};

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
