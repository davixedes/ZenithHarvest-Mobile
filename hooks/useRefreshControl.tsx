import React from 'react';
import { Platform, RefreshControl } from 'react-native';

import { useColors } from '@/hooks/useColors';

/**
 * Devolve um <RefreshControl> tematizado para usar no prop `refreshControl`
 * de um ScrollView/FlatList.
 *
 * Na web retorna `undefined`: o pull-to-refresh do react-native-web é
 * inconsistente (dispara no gesto errado), então o gesto fica desabilitado
 * lá e a atualização acontece por botão ou ao reabrir a tela.
 */
export function useRefreshControl(refreshing: boolean, onRefresh: () => void) {
  const colors = useColors();

  if (Platform.OS === 'web') return undefined;

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary, colors.primaryDark]}
      progressBackgroundColor={colors.surface}
    />
  );
}
