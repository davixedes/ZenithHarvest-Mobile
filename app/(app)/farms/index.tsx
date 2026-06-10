import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { Farm, farmService } from '@/services/farmService';

export default function FarmsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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

  const refreshControl = useRefreshControl(refreshing, () => {
    setRefreshing(true);
    load();
  });

  if (loading) return <LoadingState variant="list" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Minhas Fazendas',
          headerShown: true,
          headerLeft: () => null,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm }}>
              <TouchableOpacity
                onPress={() => router.push('/(app)/farms/map')}
                style={{ padding: 4, marginRight: spacing.xs }}
                accessibilityLabel="Ver mapa de fazendas"
              >
                <Ionicons name="map-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(app)/farms/new')}
                style={{ padding: 4 }}
                accessibilityLabel="Adicionar nova fazenda"
              >
                <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={farms.length === 0 ? styles.empty : styles.list}
        refreshControl={refreshControl}
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
            <TouchableOpacity
              key={farm.id}
              style={styles.card}
              onPress={() => router.push(`/(app)/farms/${farm.id}`)}
              accessibilityLabel={`Fazenda ${farm.name}`}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="leaf" size={20} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{farm.name}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {farm.totalAreaHectares} ha · {farm.state}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
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
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
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
  });
}
