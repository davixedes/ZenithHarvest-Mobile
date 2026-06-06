import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

interface KpiStatCardProps {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  progress?: number;
}

export function KpiStatCard({ label, value, icon, color, progress }: KpiStatCardProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const barPct = progress != null ? Math.min(Math.max(progress, 0), 1) : null;

  return (
    <View style={[styles.card, { borderTopColor: color }]} accessibilityLabel={`${label}: ${value}`}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {barPct != null ? (
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={[styles.progressFill, { width: `${barPct * 100}%`, backgroundColor: color }]} />
        </View>
      ) : null}
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.xs,
      borderTopWidth: 3,
      ...shadow.sm,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: { ...typography.heading, color: c.text, fontSize: 26 },
    label: { ...typography.micro, color: c.textMuted, textTransform: 'uppercase', textAlign: 'center' },
    progressTrack: {
      width: '100%',
      height: 4,
      borderRadius: radius.full,
      overflow: 'hidden',
      marginTop: 2,
    },
    progressFill: { height: '100%', borderRadius: radius.full },
  });
}
