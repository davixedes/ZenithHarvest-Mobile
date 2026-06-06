import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { KpiStatCard } from '@/components/KpiStatCard';
import { LoadingState } from '@/components/LoadingState';
import { ZenithRefreshControl } from '@/components/ZenithRefreshControl';
import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Claim, CLAIM_CATEGORY, CLAIM_SITUATION, CLAIM_SITUATION_COLOR, claimService } from '@/services/claimService';
import { Farm, farmService } from '@/services/farmService';
import { useAuthContext } from '@/store/authContext';

export default function DashboardScreen() {
  const { user } = useAuthContext();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState variant="dashboard" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const openClaims = claims.filter((c) => c.claimSituationId === 1).length;
  const recentClaims = claims.slice(0, 3);
  const totalArea = farms.reduce((sum, farm) => sum + farm.totalAreaHectares, 0);
  const openRatio = claims.length > 0 ? openClaims / claims.length : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <ZenithRefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
    >
      {/* Header */}
      <View style={styles.hero}>
        <Text style={styles.greeting}>Olá, {user?.name ?? 'Produtor'} 👋</Text>
        <Text style={styles.heroSub}>Acompanhe sua lavoura</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <KpiStatCard label="Fazendas" value={farms.length} icon="leaf" color={colors.primary} />
        <KpiStatCard
          label="Sinistros"
          value={claims.length}
          icon="document-text"
          color={colors.info}
          progress={claims.length > 0 ? 1 - openRatio : undefined}
        />
        <KpiStatCard
          label="Em aberto"
          value={openClaims}
          icon="time"
          color={colors.warning}
          progress={openRatio}
        />
      </View>

      {totalArea > 0 ? (
        <View style={[styles.areaBanner, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="map-outline" size={16} color={colors.primary} />
          <Text style={[styles.areaBannerText, { color: colors.primaryDark }]}>
            {totalArea.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ha monitorados
          </Text>
        </View>
      ) : null}

      {/* Farms */}
      <Section
        title="Minhas Fazendas"
        onSeeAll={() => router.push('/(app)/farms')}
      >
        {farms.length === 0 ? (
          <EmptyState message="Nenhuma fazenda cadastrada." ionicon="leaf-outline" />
        ) : (
          farms.slice(0, 3).map((farm) => (
            <TouchableOpacity
              key={farm.id}
              style={styles.listCard}
              onPress={() => router.push(`/(app)/farms/${farm.id}`)}
              accessibilityLabel={`Fazenda ${farm.name}`}
            >
              <View style={styles.listCardIcon}>
                <Ionicons name="leaf" size={18} color={colors.primary} />
              </View>
              <View style={styles.listCardBody}>
                <Text style={styles.listCardTitle}>{farm.name}</Text>
                <Text style={styles.listCardSub}>{farm.totalAreaHectares} ha · {farm.state}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          ))
        )}
      </Section>

      {/* Claims */}
      <Section title="Sinistros Recentes" onSeeAll={() => router.push('/(app)/claims')}>
        {recentClaims.length === 0 ? (
          <EmptyState message="Nenhum sinistro registrado." ionicon="document-text-outline" />
        ) : (
          recentClaims.map((claim) => {
            const color = CLAIM_SITUATION_COLOR[claim.claimSituationId] ?? colors.textMuted;
            const label = CLAIM_SITUATION[claim.claimSituationId] ?? '—';
            return (
              <TouchableOpacity
                key={claim.id}
                style={styles.listCard}
                onPress={() => router.push(`/(app)/claims/${claim.id}`)}
                accessibilityLabel={`Sinistro ${claim.claimNumber}`}
              >
                <View style={[styles.statusBar, { backgroundColor: color }]} />
                <View style={styles.listCardBody}>
                  <Text style={styles.listCardTitle}>{claim.claimNumber}</Text>
                  <Text style={styles.listCardSub}>{CLAIM_CATEGORY[claim.categoryId] ?? '—'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.badgeText, { color }]}>{label}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  onSeeAll,
  children,
}: {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} accessibilityLabel="Ver todos">
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { gap: spacing.lg, paddingBottom: spacing.xxl },

    hero: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.xs,
    },
    greeting: { ...typography.heading, color: c.text },
    heroSub: { ...typography.body, color: c.textMuted, fontSize: 14 },

    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    areaBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.full,
    },
    areaBannerText: { ...typography.label, fontWeight: '600' },

    section: { paddingHorizontal: spacing.md, gap: spacing.sm },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { ...typography.title, color: c.text },
    seeAll: { ...typography.label, color: c.primary },
    sectionContent: { gap: spacing.sm },

    listCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadow.sm,
    },
    listCardIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listCardBody: { flex: 1, gap: 2 },
    listCardTitle: { ...typography.bodyBold, color: c.text },
    listCardSub: { ...typography.caption, color: c.textMuted },
    statusBar: { width: 4, height: '100%', borderRadius: 2, alignSelf: 'stretch' },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeText: { ...typography.micro },
  });
}
