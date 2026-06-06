import React, { useMemo } from 'react';
import { Platform, RefreshControl, RefreshControlProps } from 'react-native';

import { useColors } from '@/hooks/useColors';

interface ZenithRefreshControlProps extends Pick<RefreshControlProps, 'refreshing' | 'onRefresh'> {}

export function ZenithRefreshControl({ refreshing, onRefresh }: ZenithRefreshControlProps) {
  const colors = useColors();
  const androidColors = useMemo(() => [colors.primary, colors.primaryDark], [colors.primary, colors.primaryDark]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={androidColors}
      progressBackgroundColor={colors.surface}
      title={refreshing ? 'Atualizando...' : undefined}
      titleColor={colors.textMuted}
      progressViewOffset={Platform.OS === 'android' ? 8 : 0}
    />
  );
}
