import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  ionicon?: IoniconsName;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  ionicon = 'file-tray-outline',
  title,
  message = 'Nenhum resultado encontrado.',
  actionLabel,
  onAction,
}: Props) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name={ionicon} size={36} color={colors.textLight} />
      </View>

      {title ? (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      ) : null}

      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>

      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primaryLight }]}
          onPress={onAction}
          accessibilityLabel={actionLabel}
        >
          <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.btnText, { color: colors.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  btnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
