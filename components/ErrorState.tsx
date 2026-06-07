import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useColors } from '@/hooks/useColors';
import { fonts, radius, spacing, typography } from '@/constants/theme';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Algo deu errado.', onRetry }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }, Platform.OS === 'web' && styles.webContainer]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.dangerBg }]}>
        <Ionicons name="alert-circle" size={32} color={colors.danger} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Ops!</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          accessibilityLabel="Tentar novamente"
        >
          <Ionicons name="refresh" size={16} color={colors.textOnPrimary} />
          <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  webContainer: StyleSheet.absoluteFillObject,
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  title: { ...typography.title },
  message: { ...typography.body, textAlign: 'center' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  buttonText: { fontFamily: fonts.semiBold, fontSize: 14 },
});
