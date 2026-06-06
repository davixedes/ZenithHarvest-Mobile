import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Payment, paymentService, PAYMENT_SITUATION, PAYMENT_SITUATION_COLOR } from '@/services/paymentService';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await paymentService.list();
      setPayments(data);
    } catch {
      setError('Não foi possível carregar os pagamentos.');
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

  const total = payments
    .filter((p) => p.paymentSituationId === 3)
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <Stack.Screen options={{ title: 'Pagamentos', headerShown: true }} />
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, payments.length === 0 && styles.listEmpty]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          payments.length > 0 ? (
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total recebido</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={<EmptyState message="Nenhum pagamento registrado." icon="💸" />}
        renderItem={({ item }) => {
          const color = PAYMENT_SITUATION_COLOR[item.paymentSituationId] ?? colors.textMuted;
          const label = PAYMENT_SITUATION[item.paymentSituationId] ?? 'Desconhecido';
          return (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.badgeText, { color }]}>{label}</Text>
                </View>
              </View>
              {item.paymentDate ? (
                <Text style={styles.date}>Pago em {formatDate(item.paymentDate)}</Text>
              ) : (
                <Text style={styles.date}>Criado em {formatDate(item.createdAt)}</Text>
              )}
              {item.pixKey && <Text style={styles.pix}>PIX: {item.pixKey}</Text>}
            </View>
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm },
  listEmpty: { flex: 1 },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  totalLabel: { color: colors.textOnPrimary + 'CC', fontSize: 13 },
  totalValue: { color: colors.textOnPrimary, fontSize: 28, fontWeight: '700' },
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
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 18, fontWeight: '700', color: colors.text },
  date: { ...typography.caption },
  pix: { ...typography.caption, color: colors.textMuted },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '600' },
});
