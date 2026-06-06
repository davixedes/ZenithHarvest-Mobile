import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { spacing, typography } from '@/constants/theme';

interface Props {
  message?: string;
}

export function LoadingState({ message = 'Carregando...' }: Props) {
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
