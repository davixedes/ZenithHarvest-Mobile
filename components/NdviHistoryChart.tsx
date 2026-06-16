import React, { useEffect, useMemo, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { NdviHistorico } from '@/services/plotService';

const CHART_HEIGHT = 160;
const PADDING = { top: 12, right: 8, bottom: 28, left: 36 };

interface NdviHistoryChartProps {
  data: NdviHistorico[];
  loading?: boolean;
  emptyMessage?: string;
}

interface ChartPoint {
  key: string;
  x: number;
  y: number;
  label: string;
  value: number;
}

function buildPoints(
  data: NdviHistorico[],
  width: number
): ChartPoint[] {
  if (data.length === 0 || width <= 0) return [];

  const sorted = [...data].sort(
    (a, b) => new Date(a.imageDate).getTime() - new Date(b.imageDate).getTime()
  );
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  return sorted.map((item, idx) => {
    const value = item.meanNdvi;
    const x = PADDING.left + (sorted.length === 1 ? innerW / 2 : (idx / (sorted.length - 1)) * innerW);
    const y = PADDING.top + (1 - Math.min(Math.max(value, 0), 1)) * innerH;
    const label = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
      new Date(item.imageDate)
    );
    return { key: `${item.imageDate}-${idx}`, x, y, label, value };
  });
}

function Segment({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  return (
    <View
      style={{
        position: 'absolute',
        left: x1,
        top: y1 - 1.5,
        width: length,
        height: 3,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
}

export function NdviHistoryChart({
  data,
  loading = false,
  emptyMessage = 'Sem histórico NDVI disponível.',
}: NdviHistoryChartProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  const [reveal] = useState(() => new Animated.Value(0));

  const points = useMemo(() => buildPoints(data, width), [data, width]);

  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, [data, reveal]);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  if (loading) {
    return (
      <View style={[styles.card, { height: CHART_HEIGHT + spacing.lg }]}>
        <Text style={styles.title}>Histórico NDVI</Text>
        <View style={[styles.placeholder, { backgroundColor: colors.surfaceSecondary }]} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Histórico NDVI</Text>
        <Text style={styles.empty}>{emptyMessage}</Text>
      </View>
    );
  }

  const latest = points[points.length - 1]?.value ?? 0;
  const first = points[0]?.value ?? 0;
  const delta = latest - first;

  return (
    <View style={styles.card} onLayout={onLayout}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico NDVI</Text>
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Sentinel-2</Text>
        </View>
      </View>

      <View style={{ height: CHART_HEIGHT, position: 'relative' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = PADDING.top + (1 - tick) * (CHART_HEIGHT - PADDING.top - PADDING.bottom);
          return (
            <View key={tick} style={[styles.gridRow, { top: y }]}>
              <Text style={styles.axisLabel}>{tick.toFixed(2)}</Text>
              <View style={[styles.gridLine, { backgroundColor: colors.borderLight }]} />
            </View>
          );
        })}

        {points.slice(0, -1).map((point, idx) => {
          const next = points[idx + 1];
          return (
            <Segment
              key={`seg-${point.key}`}
              x1={point.x}
              y1={point.y}
              x2={next.x}
              y2={next.y}
              color={colors.primary}
            />
          );
        })}

        {points.map((point) => (
          <View
            key={`dot-${point.key}`}
            style={[
              styles.dot,
              {
                left: point.x - 5,
                top: point.y - 5,
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}
          >
            <View style={[styles.dotInner, { backgroundColor: colors.primary }]} />
          </View>
        ))}

        {points.map((point) => (
          <Text
            key={`label-${point.key}`}
            style={[styles.xLabel, { left: point.x - 18, top: CHART_HEIGHT - 20 }]}
          >
            {point.label}
          </Text>
        ))}

        <Animated.View
          style={[
            styles.revealMask,
            {
              backgroundColor: colors.surface,
              width: reveal.interpolate({
                inputRange: [0, 1],
                outputRange: [width, 0],
              }),
            },
          ]}
        />
      </View>

      <LinearGradient
        colors={[colors.primary + '22', colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summary}
      >
        <Text style={styles.summaryLabel}>Última leitura</Text>
        <Text style={[styles.summaryValue, { color: colors.primary }]}>{latest.toFixed(3)}</Text>
        <Text style={[styles.summaryDelta, { color: delta >= 0 ? colors.success : colors.danger }]}>
          {delta >= 0 ? '+' : ''}
          {(delta * 100).toFixed(1)}% no período
        </Text>
      </LinearGradient>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { ...typography.bodyBold, color: c.text },
    legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { ...typography.micro, color: c.textMuted },
    placeholder: { flex: 1, borderRadius: radius.sm },
    empty: { ...typography.caption, color: c.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
    gridRow: {
      position: 'absolute',
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    axisLabel: {
      width: PADDING.left - 4,
      ...typography.micro,
      color: c.textMuted,
      textAlign: 'right',
      fontSize: 10,
    },
    gridLine: { flex: 1, height: 1 },
    dot: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotInner: { width: 4, height: 4, borderRadius: 2 },
    xLabel: {
      position: 'absolute',
      width: 36,
      textAlign: 'center',
      ...typography.micro,
      color: c.textMuted,
      fontSize: 9,
    },
    revealMask: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
    },
    summary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.sm,
    },
    summaryLabel: { ...typography.caption, color: c.textMuted, flex: 1 },
    summaryValue: { ...typography.bodyBold, fontSize: 16 },
    summaryDelta: { ...typography.micro },
  });
}
