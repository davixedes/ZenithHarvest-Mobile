import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import { Payment, paymentService, PAYMENT_SITUATION, PAYMENT_SITUATION_COLOR } from '@/services/paymentService';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      setPayments(await paymentService.list());
    } catch {
      setError('Não foi possível carregar os pagamentos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const total = payments.filter((p) => p.paymentSituationId === 3).reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <Stack.Screen options={{ title: 'Pagamentos', headerShown: true }} />
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, payments.length === 0 && styles.listEmpty]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          payments.length > 0 ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total recebido</Text>
              <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
              <View style={styles.summaryRow}>
                <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.summaryNote}>{payments.filter((p) => p.paymentSituationId === 3).length} pagamentos concluídos</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={<EmptyState message="Nenhum pagamento registrado." ionicon="card-outline" />}
        renderItem={({ item }) => {
          const color = PAYMENT_SITUATION_COLOR[item.paymentSituationId] ?? colors.textMuted;
          const label = PAYMENT_SITUATION[item.paymentSituationId] ?? '—';
          return (
            <View style={styles.card}>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                  <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                    <Text style={[styles.badgeText, { color }]}>{label}</Text>
                  </View>
                </View>
                <Text style={styles.date}>
                  {item.paymentDate ? `Pago em ${formatDate(item.paymentDate)}` : `Criado em ${formatDate(item.createdAt)}`}
                </Text>
                {item.pixKey ? (
                  <View style={styles.pixRow}>
                    <Ionicons name="flash" size={12} color={colors.textLight} />
                    <Text style={styles.pixKey}>{item.pixKey}</Text>
                  </View>
                ) : null}
              </View>
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
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
    ...shadow.md,
  },
  summaryLabel: { ...typography.label, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 32, fontWeight: '800', color: colors.textOnPrimary, letterSpacing: -1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  summaryNote: { ...typography.caption, color: 'rgba(255,255,255,0.75)' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, alignSelf: 'flex-start', marginTop: 6 },
  cardBody: { flex: 1, gap: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 18, fontWeight: '700', color: colors.text },
  date: { ...typography.caption, color: colors.textMuted },
  pixRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pixKey: { ...typography.caption, color: colors.textLight },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { ...typography.micro },
});
