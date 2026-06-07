import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
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
import { useToast } from '@/components/Toast';
import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Claim, CLAIM_CATEGORY, CLAIM_SITUATION, CLAIM_SITUATION_COLOR, claimService } from '@/services/claimService';

export default function ClaimsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { showToast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      setClaims(await claimService.list());
    } catch {
      setError('Não foi possível carregar os sinistros.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = useCallback(
    (claim: Claim) => {
      Alert.alert('Remover sinistro', `Deseja remover ${claim.claimNumber}?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await claimService.delete(claim.id);
              setClaims((prev) => prev.filter((c) => c.id !== claim.id));
              showToast('Sinistro removido com sucesso.', 'success');
            } catch {
              showToast('Não foi possível remover o sinistro.', 'error');
            }
          },
        },
      ]);
    },
    [showToast]
  );

  if (loading) return <LoadingState variant="list" />;
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
              <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={claims.length === 0 ? styles.empty : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
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
            const canDelete = item.claimSituationId === 1;

            return (
              <View key={item.id} style={styles.row}>
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
                    <NdviHealthStrip value={item.ndviAfter ?? item.ndviBefore ?? null} />
                    <Text style={styles.cardDate}>
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                </TouchableOpacity>
                {canDelete ? (
                  <TouchableOpacity
                    onPress={() => confirmDelete(item)}
                    style={styles.deleteBtn}
                    accessibilityLabel={`Remover sinistro ${item.claimNumber}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                ) : null}
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
    list: { padding: spacing.md, paddingBottom: spacing.lg },
    empty: { flexGrow: 1 },
    row: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm, marginBottom: spacing.sm },
    card: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      ...shadow.sm,
    },
    statusAccent: { width: 4, alignSelf: 'stretch' },
    cardBody: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { ...typography.bodyBold, color: c.text },
    cardSub: { ...typography.caption, color: c.textMuted, marginBottom: 2 },
    cardDate: { ...typography.micro, color: c.textLight, marginTop: 4 },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeText: { ...typography.micro },
    deleteBtn: {
      alignSelf: 'center',
      padding: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: c.dangerBg,
    },
  });
}
