import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Stack, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Claim, claimService, ClaimSituation } from '@/services/claimService';

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

const TIMELINE: ClaimSituation[] = ['PENDING', 'UNDER_ANALYSIS', 'APPROVED', 'PAID'];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function NdviBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(Math.max(value, 0), 1);
  return (
    <View style={styles.ndviRow}>
      <Text style={styles.ndviLabel}>{label}</Text>
      <View style={styles.ndviTrack}>
        <View style={[styles.ndviFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.ndviValue}>{value.toFixed(3)}</Text>
    </View>
  );
}

export default function ClaimDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await claimService.getById(id);
      setClaim(data);
    } catch {
      setError('Não foi possível carregar o sinistro.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState />;
  if (error || !claim) return <ErrorState message={error} onRetry={load} />;

  const currentIdx = TIMELINE.indexOf(claim.situation);

  return (
    <>
      <Stack.Screen options={{ title: 'Detalhe do Sinistro', headerShown: true }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.farmName}>{claim.farmName}</Text>
            <Text style={styles.plotName}>{claim.plotName}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: situationColor[claim.situation] + '20' },
            ]}
          >
            <Text style={[styles.badgeText, { color: situationColor[claim.situation] }]}>
              {situationLabel[claim.situation]}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Linha do Tempo</Text>
          <View style={styles.timeline}>
            {TIMELINE.map((step, idx) => (
              <View key={step} style={styles.timelineStep}>
                <View
                  style={[
                    styles.timelineDot,
                    idx <= currentIdx && styles.timelineDotActive,
                    claim.situation === 'REJECTED' && idx === currentIdx && styles.timelineDotRejected,
                  ]}
                />
                <Text
                  style={[
                    styles.timelineLabel,
                    idx <= currentIdx && styles.timelineLabelActive,
                  ]}
                >
                  {situationLabel[step]}
                </Text>
                {idx < TIMELINE.length - 1 && (
                  <View
                    style={[styles.timelineLine, idx < currentIdx && styles.timelineLineActive]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes do Evento</Text>
          <InfoRow label="Categoria" value={claim.category} />
          <InfoRow label="Subcategoria" value={claim.subcategory} />
          <InfoRow label="Descrição" value={claim.description} />
          <InfoRow label="Data" value={formatDate(claim.createdAt)} />
        </View>

        {(claim.ndviBefore != null || claim.ndviAfter != null) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Análise Satelital NDVI</Text>
            {claim.ndviBefore != null && (
              <NdviBar label="Antes" value={claim.ndviBefore} />
            )}
            {claim.ndviAfter != null && (
              <NdviBar label="Depois" value={claim.ndviAfter} />
            )}
            {claim.lossPercentage != null && (
              <View style={styles.lossRow}>
                <Text style={styles.lossLabel}>Perda estimada</Text>
                <Text style={styles.lossValue}>{claim.lossPercentage.toFixed(1)}%</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Indenização</Text>
          <InfoRow
            label="Valor aprovado"
            value={claim.approvedAmount != null ? formatCurrency(claim.approvedAmount) : '—'}
          />
          {claim.situation === 'PENDING' || claim.situation === 'UNDER_ANALYSIS' ? (
            <Text style={styles.waitingText}>Aguardando análise satelital</Text>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  farmName: { ...typography.label, fontSize: 16, color: colors.text },
  plotName: { ...typography.caption, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  badgeText: { fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { ...typography.subheading, color: colors.text },
  timeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timelineStep: { alignItems: 'center', flex: 1, position: 'relative' },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timelineDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timelineDotRejected: { backgroundColor: colors.danger, borderColor: colors.danger },
  timelineLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  timelineLabelActive: { color: colors.primary, fontWeight: '600' },
  timelineLine: {
    position: 'absolute',
    top: 7,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  timelineLineActive: { backgroundColor: colors.primary },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { ...typography.caption, color: colors.textMuted },
  infoValue: { ...typography.body, color: colors.text, fontSize: 14, flexShrink: 1, textAlign: 'right' },
  ndviRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ndviLabel: { width: 50, ...typography.caption },
  ndviTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  ndviFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
  ndviValue: { width: 40, ...typography.caption, textAlign: 'right' },
  lossRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  lossLabel: { ...typography.label, color: colors.text },
  lossValue: { fontSize: 20, fontWeight: '700', color: colors.danger },
  waitingText: { ...typography.caption, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
});
