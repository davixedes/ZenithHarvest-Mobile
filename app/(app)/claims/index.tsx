import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router, Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Claim, CLAIM_CATEGORY, CLAIM_SITUATION, CLAIM_SITUATION_COLOR, claimService } from '@/services/claimService';

export default function ClaimsScreen() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await claimService.list();
      setClaims(data);
    } catch {
      setError('Não foi possível carregar os sinistros.');
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

  return (
    <>
      <Stack.Screen options={{ title: 'Sinistros', headerShown: true }} />
      <FlatList
        data={claims}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, claims.length === 0 && styles.listEmpty]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={<EmptyState message="Nenhum sinistro registrado." icon="📋" />}
        renderItem={({ item }) => {
          const color = CLAIM_SITUATION_COLOR[item.claimSituationId] ?? colors.textMuted;
          const label = CLAIM_SITUATION[item.claimSituationId] ?? 'Desconhecido';
          const category = CLAIM_CATEGORY[item.categoryId] ?? `Cat. ${item.categoryId}`;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/claims/${item.id}`)}
              accessibilityLabel={`Sinistro ${item.claimNumber}`}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.claimNumber}</Text>
                <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.badgeText, { color }]}>{label}</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>{category}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm },
  listEmpty: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.label, fontSize: 15, color: colors.text },
  cardSub: { ...typography.caption },
  cardDate: { ...typography.caption, fontSize: 12 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '600' },
});
