import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
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
import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
import { Farm, farmService } from '@/services/farmService';

export default function FarmsScreen() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await farmService.list();
      setFarms(data);
    } catch {
      setError('Não foi possível carregar as fazendas.');
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

  function confirmDelete(farm: Farm) {
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
            } catch {
              Alert.alert('Erro', 'Não foi possível remover a fazenda.');
            }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingState />;
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
              <Ionicons name="add-circle-outline" size={26} color={colors.textOnPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={farms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, farms.length === 0 && styles.listEmpty]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState message="Nenhuma fazenda cadastrada." ionicon="leaf-outline" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/farms/${item.id}`)}
            accessibilityLabel={`Fazenda ${item.name}`}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="leaf" size={20} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.totalAreaHectares} ha · {item.state}</Text>
              <Text style={styles.cardSub}>CAR: {item.carRegistration}</Text>
            </View>
            <View style={styles.cardRight}>
              <TouchableOpacity
                onPress={() => confirmDelete(item)}
                style={styles.deleteBtn}
                accessibilityLabel={`Remover fazenda ${item.name}`}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { ...typography.bodyBold, color: colors.text },
  cardSub: { ...typography.caption, color: colors.textMuted },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  deleteBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerBg,
  },
});
