import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { claimService, Claim, ClaimSituation } from '@/services/claimService';
import { farmService, Farm } from '@/services/farmService';
import { useAuthContext } from '@/store/authContext';

const situationLabel: Record<ClaimSituation, string> = {
  PENDING: 'Pendente',
  UNDER_ANALYSIS: 'Em análise',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
  PAID: 'Pago',
};

const situationColor: Record<ClaimSituation, string> = {
  PENDING: colors.warning,
  UNDER_ANALYSIS: '#3B82F6',
  APPROVED: colors.success,
  REJECTED: colors.danger,
  PAID: colors.primary,
};

export default function DashboardScreen() {
  const { user } = useAuthContext();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const [f, c] = await Promise.all([farmService.list(), claimService.list()]);
      setFarms(f);
      setClaims(c);
    } catch {
      setError('Não foi possível carregar o painel.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const recentClaims = claims.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.welcomeSub}>Acompanhe sua lavoura</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Fazendas" value={String(farms.length)} emoji="🌾" />
        <StatCard label="Sinistros" value={String(claims.length)} emoji="📋" />
        <StatCard
          label="Pendentes"
          value={String(claims.filter((c) => c.situation === 'PENDING').length)}
          emoji="⏳"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas Fazendas</Text>
          <TouchableOpacity
            onPress={() => router.push('/(app)/farms')}
            accessibilityLabel="Ver todas as fazendas"
          >
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {farms.length === 0 ? (
          <EmptyState message="Nenhuma fazenda cadastrada." icon="🌾" />
        ) : (
          farms.slice(0, 3).map((farm) => (
            <TouchableOpacity
              key={farm.id}
              style={styles.card}
              onPress={() => router.push(`/(app)/farms/${farm.id}`)}
              accessibilityLabel={`Fazenda ${farm.name}`}
            >
              <Text style={styles.cardTitle}>{farm.name}</Text>
              <Text style={styles.cardSub}>
                {farm.area} ha · {farm.city}, {farm.state}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sinistros Recentes</Text>
          <TouchableOpacity
            onPress={() => router.push('/(app)/claims')}
            accessibilityLabel="Ver todos os sinistros"
          >
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {recentClaims.length === 0 ? (
          <EmptyState message="Nenhum sinistro registrado." icon="📋" />
        ) : (
          recentClaims.map((claim) => (
            <TouchableOpacity
              key={claim.id}
              style={styles.card}
              onPress={() => router.push(`/(app)/claims/${claim.id}`)}
              accessibilityLabel={`Sinistro ${claim.id}`}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{claim.plotName}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: situationColor[claim.situation] + '20' },
                  ]}
                >
                  <Text
                    style={[styles.badgeText, { color: situationColor[claim.situation] }]}
                  >
                    {situationLabel[claim.situation]}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSub}>{claim.category} · {claim.farmName}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/claims/new')}
        accessibilityLabel="Abrir novo sinistro"
      >
        <Text style={styles.fabText}>＋ Abrir Sinistro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxl },
  welcome: { gap: spacing.xs },
  welcomeText: { ...typography.heading, color: colors.text },
  welcomeSub: { ...typography.body, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statEmoji: { fontSize: 24 },
  statValue: { ...typography.heading, color: colors.text },
  statLabel: { ...typography.caption },
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { ...typography.subheading, color: colors.text },
  seeAll: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.label, color: colors.text, fontSize: 15 },
  cardSub: { ...typography.caption },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '600' },
  fab: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  fabText: { color: colors.textOnPrimary, fontWeight: '600', fontSize: 16 },
});
