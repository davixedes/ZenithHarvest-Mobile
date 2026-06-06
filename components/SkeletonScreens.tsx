import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SkeletonBox } from '@/components/SkeletonBox';
import { spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

function CardSkeleton({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {children}
    </View>
  );
}

export function DashboardSkeleton() {
  const colors = useColors();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <SkeletonBox width="70%" height={28} borderRadius={8} />
      <SkeletonBox width="50%" height={16} />

      <View style={styles.statsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <SkeletonBox width={34} height={34} borderRadius={10} />
            <SkeletonBox width={40} height={26} />
            <SkeletonBox width={56} height={10} />
          </View>
        ))}
      </View>

      <CardSkeleton>
        <SkeletonBox width={140} height={18} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.listRow}>
            <SkeletonBox width={36} height={36} borderRadius={10} />
            <View style={styles.listBody}>
              <SkeletonBox width="60%" height={14} />
              <SkeletonBox width="40%" height={12} />
            </View>
          </View>
        ))}
      </CardSkeleton>
    </ScrollView>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  const colors = useColors();
  return (
    <View style={[styles.listContainer, { backgroundColor: colors.background }]}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.listCard, { backgroundColor: colors.surface }]}>
          <SkeletonBox width={4} height={56} borderRadius={2} />
          <View style={styles.listBody}>
            <SkeletonBox width="55%" height={14} />
            <SkeletonBox width="35%" height={12} />
            <SkeletonBox width="25%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function DetailSkeleton() {
  const colors = useColors();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          <SkeletonBox width="65%" height={22} />
          <SkeletonBox width="45%" height={12} />
        </View>
        <SkeletonBox width={72} height={24} borderRadius={999} />
      </View>

      <CardSkeleton>
        <SkeletonBox width={120} height={18} />
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.timelineRow}>
            <SkeletonBox width={24} height={24} borderRadius={12} />
            <View style={styles.listBody}>
              <SkeletonBox width="50%" height={14} />
              <SkeletonBox width="30%" height={10} />
            </View>
          </View>
        ))}
      </CardSkeleton>

      <CardSkeleton>
        <SkeletonBox width={100} height={18} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.infoRow}>
            <SkeletonBox width="35%" height={12} />
            <SkeletonBox width="30%" height={12} />
          </View>
        ))}
      </CardSkeleton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  card: { borderRadius: 14, padding: spacing.md, gap: spacing.sm },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  listBody: { flex: 1, gap: spacing.xs },
  listContainer: { flex: 1, padding: spacing.md, gap: spacing.sm },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 14,
    padding: spacing.md,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: 14,
    padding: spacing.md,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 56 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
});
