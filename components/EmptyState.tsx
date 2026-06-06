import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

interface Props {
  message?: string;
  icon?: string;
}

export function EmptyState({ message = 'Nenhum resultado encontrado.', icon = '📭' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  icon: { fontSize: 48 },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
