import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Policy, POLICY_SITUATION, policyService } from '@/services/policyService';

const POLICY_SITUATION_COLOR: Record<number, string> = {
  1: '#00B131',
  2: '#EF6800',
  3: '#FF5449',
  4: '#8F8F8F',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function PoliciesScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      setPolicies(await policyService.list());
    } catch {
      setError('Não foi possível carregar as apólices.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <Stack.Screen options={{ title: 'Apólices', headerShown: true }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={policies.length === 0 ? styles.empty : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {policies.length === 0 ? (
          <EmptyState
            ionicon="shield-checkmark-outline"
            title="Nenhuma apólice vinculada"
            message="Suas apólices de seguro rural aparecem aqui quando vinculadas a um talhão cadastrado."
          />
        ) : (
          policies.map((item) => {
            const color = POLICY_SITUATION_COLOR[item.policySituationId] ?? colors.textMuted;
            const label = POLICY_SITUATION[item.policySituationId] ?? '—';
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                    <Text style={styles.policyNumber}>{item.policyNumber}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                    <Text style={[styles.badgeText, { color }]}>{label}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Valor segurado</Text>
                  <Text style={styles.infoValue}>{formatCurrency(item.insuredAmount)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Prêmio total</Text>
                  <Text style={styles.infoValue}>{formatCurrency(item.totalPremium)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Vigência</Text>
                  <Text style={styles.infoValue}>
                    {`${formatDate(item.startDate)} — ${formatDate(item.endDate)}`}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    list: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
    empty: { flexGrow: 1 },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadow.sm,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    policyNumber: { ...typography.bodyBold, color: c.text },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeText: { ...typography.micro },
    divider: { height: 1, backgroundColor: c.borderLight },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoLabel: { ...typography.caption, color: c.textMuted },
    infoValue: { ...typography.body, color: c.text, fontSize: 14 },
  });
}
