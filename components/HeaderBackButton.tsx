import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, router, useNavigation } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

interface HeaderBackButtonProps {
  /**
   * Rota pai usada quando a tela é a raiz da pilha atual — ex.: aberta
   * diretamente de outra aba via `router.navigate`, sem a lista por baixo.
   */
  fallback: Href;
}

export function HeaderBackButton({ fallback }: HeaderBackButtonProps) {
  const colors = useColors();
  // `useNavigation().canGoBack()` consulta a pilha do navegador atual (a Stack
  // desta seção), e não o histórico global como `router.canGoBack()`. Assim o
  // "voltar" sempre retorna para a lista da seção, não para a aba de origem.
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          router.replace(fallback);
        }
      }}
      style={{ marginRight: spacing.sm, padding: 4 }}
      accessibilityLabel="Voltar"
    >
      <Ionicons name="chevron-back" size={26} color={colors.text} />
    </TouchableOpacity>
  );
}
