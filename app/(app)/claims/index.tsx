import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Claim, CLAIM_CATEGORY, CLAIM_SITUATION, CLAIM_SITUATION_COLOR, claimService } from '@/services/claimService';

export default function ClaimsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
      <Stack.Screen
        options={{
          title: 'Sinistros',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(app)/claims/new')}
              style={{ marginRight: spacing.sm, padding: 4 }}
              accessibilityLabel="Adicionar novo sinistro"
            >
              <Ionicons name="add-circle-outline" size={26} color={colors.textOnPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        style={{ flex: 1, backgroundColor: colors.background }}
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
        ListEmptyComponent={<EmptyState message="Nenhum sinistro registrado." ionicon="document-text-outline" />}
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
              <View style={[styles.statusAccent, { backgroundColor: color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.claimNumber}</Text>
                  <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                    <Text style={[styles.badgeText, { color }]}>{label}</Text>
                  </View>
                </View>
                <Text style={styles.cardSub}>{category}</Text>
                <Text style={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          );
        }}
      />
    </>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    list: { padding: spacing.md, gap: spacing.sm },
    listEmpty: { flex: 1 },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      gap: spacing.sm,
      ...shadow.sm,
    },
    statusAccent: { width: 4, alignSelf: 'stretch' },
    cardBody: { flex: 1, paddingVertical: spacing.md, gap: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { ...typography.bodyBold, color: c.text },
    cardSub: { ...typography.caption, color: c.textMuted },
    cardDate: { ...typography.micro, color: c.textLight, marginTop: 2 },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeText: { ...typography.micro },
  });
}
