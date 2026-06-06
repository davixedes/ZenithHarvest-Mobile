import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import {
  Claim,
  CLAIM_CATEGORY,
  CLAIM_SITUATION,
  CLAIM_SITUATION_COLOR,
  CLAIM_SUBCATEGORY,
  claimService,
} from '@/services/claimService';

const TIMELINE_IDS = [1, 2, 3, 5]; // Aberto → Em análise → Aprovado → Pago

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
        <View style={[styles.ndviFill, { width: `${pct * 100}%` as any }]} />
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

  async function handleDelete() {
    Alert.alert('Remover sinistro', 'Deseja remover este sinistro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await claimService.delete(id);
            router.back();
          } catch {
            Alert.alert('Erro', 'Não foi possível remover o sinistro.');
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingState />;
  if (error || !claim) return <ErrorState message={error} onRetry={load} />;

  const situationColor = CLAIM_SITUATION_COLOR[claim.claimSituationId] ?? colors.textMuted;
  const situationLabel = CLAIM_SITUATION[claim.claimSituationId] ?? 'Desconhecido';
  const currentTimelineIdx = TIMELINE_IDS.indexOf(claim.claimSituationId);

  return (
    <>
      <Stack.Screen options={{ title: 'Detalhe do Sinistro', headerShown: true }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.claimNumber}>{claim.claimNumber}</Text>
            <Text style={styles.claimDate}>Aberto em {formatDate(claim.createdAt)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: situationColor + '20' }]}>
            <Text style={[styles.badgeText, { color: situationColor }]}>{situationLabel}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Linha do Tempo</Text>
          <View style={styles.timeline}>
            {TIMELINE_IDS.map((stepId, idx) => {
              const isActive = currentTimelineIdx >= idx;
              const isRejected = claim.claimSituationId === 4 && idx === currentTimelineIdx;
              return (
                <View key={stepId} style={styles.timelineStep}>
                  <View
                    style={[
                      styles.timelineDot,
                      isActive && styles.timelineDotActive,
                      isRejected && styles.timelineDotRejected,
                    ]}
                  />
                  <Text style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}>
                    {CLAIM_SITUATION[stepId]}
                  </Text>
                  {idx < TIMELINE_IDS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        currentTimelineIdx > idx && styles.timelineLineActive,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes do Evento</Text>
          <InfoRow label="Categoria" value={CLAIM_CATEGORY[claim.categoryId] ?? `${claim.categoryId}`} />
          <InfoRow label="Subcategoria" value={CLAIM_SUBCATEGORY[claim.subCategoryId] ?? `${claim.subCategoryId}`} />
          {claim.description ? <InfoRow label="Descrição" value={claim.description} /> : null}
          {claim.totalAffectedAreaHa != null ? (
            <InfoRow label="Área afetada" value={`${claim.totalAffectedAreaHa} ha`} />
          ) : null}
        </View>

        {(claim.ndviBefore != null || claim.ndviAfter != null) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Análise Satelital NDVI</Text>
            {claim.ndviBefore != null && <NdviBar label="Antes" value={claim.ndviBefore} />}
            {claim.ndviAfter != null && <NdviBar label="Depois" value={claim.ndviAfter} />}
            {claim.totalLossPct != null && (
              <View style={styles.lossRow}>
                <Text style={styles.lossLabel}>Perda estimada</Text>
                <Text style={styles.lossValue}>{(claim.totalLossPct * 100).toFixed(1)}%</Text>
              </View>
            )}
            {claim.mlConfidenceScore != null && (
              <Text style={styles.confidence}>
                Confiança IA: {(claim.mlConfidenceScore * 100).toFixed(0)}%
                {claim.fraudFlag ? ' ⚠️ Alerta de fraude' : ''}
              </Text>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Indenização</Text>
          <InfoRow
            label="Valor calculado"
            value={claim.calculatedAmount != null ? formatCurrency(claim.calculatedAmount) : '—'}
          />
          <InfoRow
            label="Valor aprovado"
            value={claim.approvedAmount != null ? formatCurrency(claim.approvedAmount) : '—'}
          />
          {(claim.claimSituationId === 1 || claim.claimSituationId === 2) && (
            <Text style={styles.waitingText}>Aguardando análise satelital</Text>
          )}
        </View>

        {claim.claimSituationId === 1 && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            accessibilityLabel="Remover sinistro"
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={styles.deleteBtnText}>Remover sinistro</Text>
          </TouchableOpacity>
        )}
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
    ...shadow.sm,
  },
  headerInfo: { gap: spacing.xs },
  claimNumber: { ...typography.title, color: colors.text },
  claimDate: { ...typography.caption, color: colors.textMuted },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  badgeText: { ...typography.micro },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.sm,
  },
  sectionTitle: { ...typography.title, color: colors.text },
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  confidence: { ...typography.caption, textAlign: 'center', marginTop: spacing.xs },
  waitingText: { ...typography.caption, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
  deleteBtn: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  deleteBtnText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});
