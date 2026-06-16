import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

// Full spectrum gradient stops (red → orange → yellow → lime → green)
const SPECTRUM: [string, string, string, string, string] = [
  '#FF5449',
  '#EF6800',
  '#EAB308',
  '#85C820',
  '#00B131',
];

const MARKER_SIZE = 18;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function ndviHealthLabel(value: number): string {
  if (value < 0.2) return 'Crítico';
  if (value < 0.4) return 'Baixo';
  if (value < 0.6) return 'Moderado';
  if (value < 0.8) return 'Bom';
  return 'Excelente';
}

function ndviHealthColor(
  value: number,
  colors: ReturnType<typeof useColors>
): string {
  if (value < 0.2) return colors.danger;
  if (value < 0.4) return colors.warning;
  if (value < 0.6) return '#EAB308';
  return colors.success;
}

interface GaugeLineProps {
  label: string;
  value: number;
}

function GaugeLine({ label, value }: GaugeLineProps) {
  const colors = useColors();
  const [trackWidth, setTrackWidth] = useState(0);
  const [animPct] = useState(() => new Animated.Value(0));
  const pct = clamp(value, 0, 1);
  const healthColor = ndviHealthColor(value, colors);
  const healthLabel = ndviHealthLabel(value);

  useEffect(() => {
    Animated.spring(animPct, {
      toValue: pct,
      useNativeDriver: false,
      tension: 50,
      friction: 9,
    }).start();
  }, [pct, animPct]);

  const markerTranslateX =
    trackWidth > 0
      ? animPct.interpolate({
          inputRange: [0, 1],
          outputRange: [0, trackWidth - MARKER_SIZE],
          extrapolate: 'clamp',
        })
      : animPct;

  return (
    <View style={styles.gaugeLine}>
      <View style={styles.gaugeHeader}>
        <Text style={[styles.gaugeLabel, { color: colors.textMuted }]}>{label}</Text>
        <View style={styles.gaugeValueRow}>
          <Text style={[styles.gaugeValue, { color: healthColor }]}>
            {value.toFixed(3)}
          </Text>
          <View style={[styles.healthBadge, { backgroundColor: healthColor + '22', borderColor: healthColor }]}>
            <Text style={[styles.healthText, { color: healthColor }]}>{healthLabel}</Text>
          </View>
        </View>
      </View>

      <View
        style={[styles.track, { backgroundColor: colors.surfaceSecondary }]}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={SPECTRUM}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {trackWidth > 0 ? (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: animPct.interpolate({
                inputRange: [0, 1],
                outputRange: [0, trackWidth],
              }),
              right: 0,
              backgroundColor: colors.background,
              opacity: 0.72,
            }}
          />
        ) : null}
        {/* Animated marker */}
        {trackWidth > 0 && (
          <Animated.View
            style={[
              styles.marker,
              {
                borderColor: healthColor,
                backgroundColor: colors.surface,
                transform: [{ translateX: markerTranslateX }],
              },
            ]}
          />
        )}
      </View>
    </View>
  );
}

interface NdviGaugeProps {
  before: number | null;
  after: number | null;
}

export function NdviGauge({ before, after }: NdviGaugeProps) {
  const colors = useColors();

  const delta = before != null && after != null ? after - before : null;

  return (
    <View style={styles.container}>
      {before != null && <GaugeLine label="Antes" value={before} />}
      {after != null && <GaugeLine label="Depois" value={after} />}

      {delta != null && (
        <View
          style={[
            styles.deltaRow,
            {
              backgroundColor: (delta >= 0 ? colors.successBg : colors.dangerBg),
              borderColor: (delta >= 0 ? colors.success : colors.danger),
            },
          ]}
        >
          <Ionicons
            name={delta >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={delta >= 0 ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.deltaValue,
              { color: delta >= 0 ? colors.success : colors.danger },
            ]}
          >
            {delta >= 0 ? '+' : ''}
            {(delta * 100).toFixed(1)}%
          </Text>
          <Text style={[styles.deltaDesc, { color: colors.textMuted }]}>
            variação NDVI
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },

  gaugeLine: { gap: spacing.xs },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gaugeLabel: { ...typography.label },
  gaugeValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  gaugeValue: { ...typography.bodyBold, fontSize: 16 },
  healthBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  healthText: { ...typography.micro },

  track: {
    height: 12,
    borderRadius: radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    top: -3,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  deltaValue: { ...typography.bodyBold, fontSize: 15 },
  deltaDesc: { ...typography.caption },
});
