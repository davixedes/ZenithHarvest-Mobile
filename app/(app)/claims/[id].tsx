import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { ClaimTimeline } from '@/components/ClaimTimeline';
import { ErrorState } from '@/components/ErrorState';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { LoadingState } from '@/components/LoadingState';
import { NdviGauge } from '@/components/NdviGauge';
import { NdviHistoryChart } from '@/components/NdviHistoryChart';
import { useToast } from '@/components/Toast';
import { fonts, radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import {
  Claim,
  CLAIM_CATEGORY,
  CLAIM_SITUATION,
  CLAIM_SITUATION_COLOR,
  CLAIM_SUBCATEGORY,
  claimService,
} from '@/services/claimService';
import { farmService } from '@/services/farmService';
import { NdviHistorico, plotService } from '@/services/plotService';
import { policyService } from '@/services/policyService';

interface ClaimOrigin {
  plotIdentifier: string | null;
  farmName: string | null;
}

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

export default function ClaimDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { showToast } = useToast();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [origin, setOrigin] = useState<ClaimOrigin>({ plotIdentifier: null, farmName: null });
  const [ndviHistory, setNdviHistory] = useState<NdviHistorico[]>([]);
  const [ndviLoading, setNdviLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await claimService.getById(id);
      setClaim(data);

      setNdviLoading(true);
      try {
        // Origem do sinistro: Claim → Policy → Plot → Farm.
        const policy = await policyService.getById(data.policyId);
        const plot = await plotService.getById(policy.plotId);
        const farm = await farmService.getById(plot.farmId).catch(() => null);
        setOrigin({ plotIdentifier: plot.identifier, farmName: farm?.name ?? null });

        const history = await plotService.getNdviHistorico(policy.plotId);
        setNdviHistory(history);
      } catch {
        setNdviHistory([]);
      } finally {
        setNdviLoading(false);
      }
    } catch {
      setError('Não foi possível carregar o sinistro.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const refreshControl = useRefreshControl(refreshing, onRefresh);

  async function handleDelete() {
    Alert.alert('Remover sinistro', 'Deseja remover este sinistro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await claimService.delete(id);
            showToast('Sinistro removido com sucesso.', 'success');
            router.back();
          } catch {
            showToast('Não foi possível remover o sinistro.', 'error');
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingState variant="detail" />;
  if (error || !claim) return <ErrorState message={error} onRetry={load} />;

  const situationColor = CLAIM_SITUATION_COLOR[claim.claimSituationId] ?? colors.textMuted;
  const situationLabel = CLAIM_SITUATION[claim.claimSituationId] ?? 'Desconhecido';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detalhe do Sinistro',
          headerShown: true,
          headerLeft: () => <HeaderBackButton fallback="/(app)/claims" />,
          headerRight: () => (
            <TouchableOpacity
              onPress={onRefresh}
              disabled={refreshing}
              style={{ marginRight: spacing.sm, padding: 4 }}
              accessibilityLabel="Atualizar sinistro"
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="refresh-outline" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={refreshControl}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.claimNumber}>{origin.plotIdentifier ?? claim.claimNumber}</Text>
            <Text style={styles.claimDate}>
              {claim.claimNumber} · Aberto em {formatDate(claim.createdAt)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: situationColor + '20' }]}>
            <Text style={[styles.badgeText, { color: situationColor }]}>{situationLabel}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Origem</Text>
          <InfoRow label="Fazenda" value={origin.farmName ?? '—'} />
          <InfoRow label="Talhão" value={origin.plotIdentifier ?? '—'} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Linha do Tempo</Text>
          <ClaimTimeline situationId={claim.claimSituationId} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes do Evento</Text>
          <InfoRow label="Categoria" value={CLAIM_CATEGORY[claim.categoryId] ?? `${claim.categoryId}`} />
          <InfoRow
            label="Subcategoria"
            value={CLAIM_SUBCATEGORY[claim.subCategoryId] ?? `${claim.subCategoryId}`}
          />
          {claim.description ? <InfoRow label="Descrição" value={claim.description} /> : null}
          {claim.totalAffectedAreaHa != null ? (
            <InfoRow label="Área afetada" value={`${claim.totalAffectedAreaHa} ha`} />
          ) : null}
        </View>

        {(claim.ndviBefore != null || claim.ndviAfter != null) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Análise Satelital NDVI</Text>
            <NdviGauge before={claim.ndviBefore ?? null} after={claim.ndviAfter ?? null} />
            {claim.totalLossPct != null && (
              <View style={styles.lossRow}>
                <Text style={styles.lossLabel}>Perda estimada</Text>
                <Text style={styles.lossValue}>{claim.totalLossPct.toFixed(1)}%</Text>
              </View>
            )}
            {claim.mlConfidenceScore != null && (
              <Text style={styles.confidence}>
                Confiança IA: {claim.mlConfidenceScore.toFixed(0)}%
                {claim.fraudFlag ? ' · Alerta de fraude' : ''}
              </Text>
            )}
          </View>
        )}

        <NdviHistoryChart
          data={ndviHistory}
          loading={ndviLoading}
          emptyMessage="Histórico NDVI ainda não disponível para este talhão."
        />

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
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.sm,
    },
    headerInfo: { flex: 1, gap: spacing.xs, marginRight: spacing.sm },
    claimNumber: { ...typography.title, color: c.text },
    claimDate: { ...typography.caption, color: c.textMuted },
    badge: { flexShrink: 0, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
    badgeText: { ...typography.micro },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadow.sm,
    },
    sectionTitle: { ...typography.title, color: c.text },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    infoLabel: { ...typography.caption, color: c.textMuted },
    infoValue: { ...typography.body, color: c.text, fontSize: 14, flexShrink: 1, textAlign: 'right' },
    lossRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    lossLabel: { ...typography.label, color: c.text },
    lossValue: { fontSize: 20, fontFamily: fonts.bold, color: c.danger },
    confidence: { ...typography.caption, textAlign: 'center', marginTop: spacing.xs },
    waitingText: { ...typography.caption, color: c.textMuted, textAlign: 'center', fontStyle: 'italic' },
    deleteBtn: {
      flexDirection: 'row',
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderWidth: 1.5,
      borderColor: c.danger,
      backgroundColor: c.dangerBg,
    },
    deleteBtnText: { color: c.danger, fontFamily: fonts.bold, fontSize: 15 },
  });
}
