import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

interface NdviHealthStripProps {
  value: number | null | undefined;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function healthColor(value: number, colors: ReturnType<typeof useColors>): string {
  if (value < 0.2) return colors.danger;
  if (value < 0.4) return colors.warning;
  if (value < 0.6) return '#EAB308';
  return colors.success;
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
  const fillColor = healthColor(value, colors);

  return (
    <View style={styles.container} accessibilityLabel={`Saúde NDVI ${value.toFixed(2)}`}>
      <Text style={styles.label}>NDVI</Text>
      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: fillColor }]} />
      </View>
      <Text style={styles.value}>{value.toFixed(2)}</Text>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    label: { ...typography.micro, color: c.textMuted, width: 32 },
    track: {
      flex: 1,
      height: 6,
      borderRadius: radius.full,
      overflow: 'hidden',
      marginHorizontal: spacing.xs,
    },
    fill: { height: '100%', borderRadius: radius.full },
    value: { ...typography.micro, color: c.textMuted, width: 36, textAlign: 'right' },
    pending: { marginTop: 4 },
    pendingText: { ...typography.micro, color: c.textLight },
  });
}
