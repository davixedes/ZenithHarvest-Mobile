import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

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

function LoadingShell({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.shell, { backgroundColor: colors.background }, Platform.OS === 'web' && styles.webShell]}>
      {children}
    </View>
  );
}

export function LoadingState({ message = 'Carregando...', variant = 'default', rows }: Props) {
  const colors = useColors();

  if (variant === 'dashboard') {
    return (
      <LoadingShell>
        <DashboardSkeleton />
      </LoadingShell>
    );
  }
  if (variant === 'list') {
    return (
      <LoadingShell>
        <ListSkeleton rows={rows} />
      </LoadingShell>
    );
  }
  if (variant === 'detail') {
    return (
      <LoadingShell>
        <DetailSkeleton />
      </LoadingShell>
    );
  }

  return (
    <LoadingShell>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>
      </View>
    </LoadingShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  webShell: StyleSheet.absoluteFill,
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  text: { ...typography.caption, marginTop: spacing.xs },
});
