import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  DashboardSkeleton,
  DetailSkeleton,
  ListSkeleton,
} from '@/components/SkeletonScreens';
import { useColors } from '@/hooks/useColors';
import { spacing, typography } from '@/constants/theme';

export type LoadingVariant = 'default' | 'dashboard' | 'list' | 'detail';

interface Props {
  message?: string;
  variant?: LoadingVariant;
  rows?: number;
}

export function LoadingState({ message = 'Carregando...', variant = 'default', rows }: Props) {
  if (variant === 'dashboard') return <DashboardSkeleton />;
  if (variant === 'list') return <ListSkeleton rows={rows} />;
  if (variant === 'detail') return <DetailSkeleton />;

  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  text: { ...typography.caption, marginTop: spacing.xs },
});
