import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

const SPECTRUM: [string, string, string, string, string] = [
  '#FF5449',
  '#EF6800',
  '#EAB308',
  '#85C820',
  '#00B131',
];

interface NdviHealthStripProps {
  value: number | null | undefined;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function NdviHealthStrip({ value }: NdviHealthStripProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (value == null) {
    return (
      <View style={styles.pending} accessibilityLabel="NDVI aguardando análise">
        <Text style={styles.pendingText}>NDVI —</Text>
      </View>
    );
  }

  const pct = clamp(value, 0, 1);

  return (
    <View style={styles.container} accessibilityLabel={`Saúde NDVI ${value.toFixed(2)}`}>
      <Text style={styles.label}>NDVI</Text>
      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary }]}>
        <LinearGradient colors={SPECTRUM} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient} />
        <View style={[styles.mask, { width: `${(1 - pct) * 100}%` }]} />
        <View style={[styles.marker, { left: `${pct * 100}%`, borderColor: colors.primary }]} />
      </View>
      <Text style={styles.value}>{value.toFixed(2)}</Text>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 },
    label: { ...typography.micro, color: c.textMuted, width: 32 },
    track: {
      flex: 1,
      height: 6,
      borderRadius: radius.full,
      overflow: 'hidden',
      position: 'relative',
    },
    gradient: { ...StyleSheet.absoluteFill },
    mask: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.background,
      opacity: 0.75,
    },
    marker: {
      position: 'absolute',
      top: -3,
      width: 10,
      height: 10,
      marginLeft: -5,
      borderRadius: 5,
      borderWidth: 2,
      backgroundColor: c.surface,
    },
    value: { ...typography.micro, color: c.textMuted, width: 36, textAlign: 'right' },
    pending: { marginTop: 4 },
    pendingText: { ...typography.micro, color: c.textLight },
  });
}
