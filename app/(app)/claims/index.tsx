import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { NdviHealthStrip } from '@/components/NdviHealthStrip';
import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useClaims } from '@/hooks/useClaims';
import { useColors } from '@/hooks/useColors';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { CLAIM_CATEGORY, CLAIM_SITUATION, CLAIM_SITUATION_COLOR } from '@/services/claimService';

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function ClaimsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { claims, loading, error, refetch } = useClaims();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const refreshControl = useRefreshControl(refreshing, onRefresh);

  if (loading) return <LoadingState variant="list" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sinistros',
          headerShown: true,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm }}>
              <TouchableOpacity
                onPress={onRefresh}
                disabled={refreshing}
                style={{ padding: 4, marginRight: spacing.xs }}
                accessibilityLabel="Atualizar lista de sinistros"
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="refresh-outline" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(app)/claims/new')}
                style={{ padding: 4 }}
                accessibilityLabel="Adicionar novo sinistro"
              >
                <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={claims.length === 0 ? styles.empty : styles.list}
        refreshControl={refreshControl}
      >
        {claims.length === 0 ? (
          <EmptyState
            ionicon="document-text-outline"
            title="Nenhum sinistro registrado"
            message="Abra um sinistro quando ocorrer perda na lavoura por geada, seca, granizo ou outra causa coberta."
            actionLabel="Abrir sinistro"
            onAction={() => router.push('/(app)/claims/new')}
          />
        ) : (
          claims.map((item) => {
            const color = CLAIM_SITUATION_COLOR[item.claimSituationId] ?? colors.textMuted;
            const label = CLAIM_SITUATION[item.claimSituationId] ?? 'Desconhecido';
            const category = CLAIM_CATEGORY[item.categoryId] ?? `Cat. ${item.categoryId}`;
            const title = item.plotIdentifier ?? item.claimNumber;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => router.push(`/(app)/claims/${item.id}`)}
                accessibilityLabel={`Sinistro do talhão ${title}${
                  item.farmName ? `, fazenda ${item.farmName}` : ''
                }`}
              >
                <View style={[styles.statusAccent, { backgroundColor: color }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                      <Text style={[styles.badgeText, { color }]}>{label}</Text>
                    </View>
                  </View>
                  <View style={styles.farmRow}>
                    <Ionicons name="leaf-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {item.farmName ?? 'Fazenda não identificada'}
                    </Text>
                  </View>
                  <Text style={styles.cardSub}>{category}</Text>
                  <NdviHealthStrip value={item.ndviAfter ?? item.ndviBefore ?? null} />
                  <View style={styles.cardFooter}>
                    <View style={styles.dateRow}>
                      <Ionicons name="time-outline" size={12} color={colors.textLight} />
                      <Text style={styles.cardDate}>{formatDateTime(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.cardRef}>{item.claimNumber}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    list: { padding: spacing.md, paddingBottom: spacing.lg },
    empty: { flexGrow: 1 },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      marginBottom: spacing.sm,
      ...shadow.sm,
    },
    statusAccent: { width: 4, alignSelf: 'stretch' },
    cardBody: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { ...typography.bodyBold, color: c.text, flex: 1, marginRight: spacing.sm },
    farmRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    cardSub: { ...typography.caption, color: c.textMuted, marginBottom: 2 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardDate: { ...typography.micro, color: c.textLight },
    cardRef: { ...typography.micro, color: c.textLight },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeText: { ...typography.micro },
  });
}
