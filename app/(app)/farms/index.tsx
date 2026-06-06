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

import { router, Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, spacing, typography } from '@/constants/theme';
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
      <Stack.Screen options={{ title: 'Minhas Fazendas', headerShown: true }} />
      <FlatList
        data={farms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, farms.length === 0 && styles.listEmpty]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState message="Nenhuma fazenda cadastrada." icon="🌾" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/farms/${item.id}`)}
            accessibilityLabel={`Fazenda ${item.name}`}
          >
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.totalAreaHectares} ha · {item.state}</Text>
              <Text style={styles.cardSub}>CAR: {item.carRegistration}</Text>
            </View>
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              style={styles.deleteBtn}
              accessibilityLabel={`Remover fazenda ${item.name}`}
            >
              <Text style={styles.deleteText}>🗑</Text>
            </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardBody: { flex: 1, gap: spacing.xs },
  cardTitle: { ...typography.label, fontSize: 16, color: colors.text },
  cardSub: { ...typography.caption },
  deleteBtn: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FFF0EB',
  },
  deleteText: { fontSize: 20 },
});
