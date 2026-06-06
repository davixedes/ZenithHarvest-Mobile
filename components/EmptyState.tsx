import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useColors } from '@/hooks/useColors';
import { spacing, typography } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  message?: string;
  ionicon?: IoniconsName;
}

export function EmptyState({
  message = 'Nenhum resultado encontrado.',
  ionicon = 'file-tray-outline',
}: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name={ionicon} size={32} color={colors.textLight} />
      </View>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  message: { ...typography.body, textAlign: 'center' },
});
