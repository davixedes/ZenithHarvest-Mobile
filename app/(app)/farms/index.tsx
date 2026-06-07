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
import { useToast } from '@/components/Toast';
import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Farm, farmService } from '@/services/farmService';

export default function FarmsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { showToast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      setFarms(await farmService.list());
    } catch {
      setError('Não foi possível carregar as fazendas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = useCallback(
    (farm: Farm) => {
      Alert.alert(
        'Remover fazenda',
        `Deseja remover "${farm.name}"? Esta ação não pode ser desfeita.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              try {
                await farmService.delete(farm.id);
                setFarms((prev) => prev.filter((f) => f.id !== farm.id));
                showToast(`"${farm.name}" removida com sucesso.`, 'success');
              } catch {
                showToast('Não foi possível remover a fazenda.', 'error');
              }
            },
          },
        ]
      );
    },
    [showToast]
  );

  if (loading) return <LoadingState variant="list" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Minhas Fazendas',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(app)/farms/new')}
              style={{ marginRight: spacing.sm, padding: 4 }}
              accessibilityLabel="Adicionar nova fazenda"
            >
              <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={farms.length === 0 ? styles.empty : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {farms.length === 0 ? (
          <EmptyState
            ionicon="leaf-outline"
            title="Nenhuma fazenda cadastrada"
            message="Cadastre sua primeira fazenda para começar o monitoramento satelital da lavoura."
            actionLabel="Cadastrar fazenda"
            onAction={() => router.push('/(app)/farms/new')}
          />
        ) : (
          farms.map((farm) => (
            <View key={farm.id} style={styles.row}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(app)/farms/${farm.id}`)}
                accessibilityLabel={`Fazenda ${farm.name}`}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="leaf" size={20} color={colors.primary} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{farm.name}</Text>
                  <Text style={styles.cardSub}>{farm.totalAreaHectares} ha · {farm.state}</Text>
                  <Text style={styles.cardSub}>CAR: {farm.carRegistration}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => confirmDelete(farm)}
                style={styles.deleteBtn}
                accessibilityLabel={`Remover fazenda ${farm.name}`}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    list: { padding: spacing.md, paddingBottom: spacing.lg },
    empty: { flexGrow: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    card: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      ...shadow.sm,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: { flex: 1 },
    cardTitle: { ...typography.bodyBold, color: c.text, marginBottom: 3 },
    cardSub: { ...typography.caption, color: c.textMuted },
    deleteBtn: {
      padding: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: c.dangerBg,
    },
  });
}
