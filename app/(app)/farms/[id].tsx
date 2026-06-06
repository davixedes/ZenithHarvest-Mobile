import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, Stack, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Farm, farmService } from '@/services/farmService';
import { Plot, plotService, PLOT_SITUATION, PLOT_SITUATION_COLOR } from '@/services/plotService';

export default function FarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [carRegistration, setCarRegistration] = useState('');
  const [nirf, setNirf] = useState('');
  const [totalAreaHectares, setTotalAreaHectares] = useState('');
  const [state, setState] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [farmData, plotsData] = await Promise.all([
        farmService.getById(id),
        plotService.listByFarm(id),
      ]);
      setFarm(farmData);
      setPlots(plotsData);
      setName(farmData.name);
      setCarRegistration(farmData.carRegistration);
      setNirf(farmData.nirf);
      setTotalAreaHectares(String(farmData.totalAreaHectares));
      setState(farmData.state);
    } catch {
      setError('Não foi possível carregar a fazenda.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!name.trim() || !totalAreaHectares.trim()) {
      Alert.alert('Atenção', 'Nome e área são obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      const updated = await farmService.update(id, {
        name: name.trim(),
        carRegistration: carRegistration.trim(),
        nirf: nirf.trim(),
        latitude: farm!.latitude,
        longitude: farm!.longitude,
        totalAreaHectares: parseFloat(totalAreaHectares),
        state: state.trim(),
      });
      setFarm(updated);
      setEditing(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error || !farm) return <ErrorState message={error} onRetry={load} />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: farm.name,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setEditing((e) => !e)}
              style={{ marginRight: spacing.sm }}
              accessibilityLabel={editing ? 'Cancelar edição' : 'Editar fazenda'}
            >
              <Text style={{ color: colors.textOnPrimary, fontWeight: '600' }}>
                {editing ? 'Cancelar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {editing ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Editar Fazenda</Text>
            <Field label="Nome" value={name} onChange={setName} />
            <Field label="CAR" value={carRegistration} onChange={setCarRegistration} />
            <Field label="NIRF" value={nirf} onChange={setNirf} />
            <Field label="Área (ha)" value={totalAreaHectares} onChange={setTotalAreaHectares} keyboardType="numeric" />
            <Field label="Estado (UF)" value={state} onChange={setState} />
            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityLabel="Salvar fazenda"
            >
              {saving ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <Text style={styles.buttonText}>Salvar alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informações</Text>
            <InfoRow label="Nome" value={farm.name} />
            <InfoRow label="Área" value={`${farm.totalAreaHectares} ha`} />
            <InfoRow label="Estado" value={farm.state} />
            <InfoRow label="CAR" value={farm.carRegistration} />
            <InfoRow label="NIRF" value={farm.nirf} />
            <InfoRow label="Latitude" value={String(farm.latitude)} />
            <InfoRow label="Longitude" value={String(farm.longitude)} />
          </View>
        )}

        {plots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Talhões ({plots.length})</Text>
            {plots.map((plot) => {
              const color = PLOT_SITUATION_COLOR[plot.plotSituationId] ?? colors.textMuted;
              const label = PLOT_SITUATION[plot.plotSituationId] ?? `Situação ${plot.plotSituationId}`;
              return (
                <View key={plot.id} style={styles.plotCard}>
                  <View style={styles.plotRow}>
                    <Text style={styles.plotName}>{plot.identifier}</Text>
                    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                      <Text style={[styles.badgeText, { color }]}>{label}</Text>
                    </View>
                  </View>
                  <Text style={styles.plotSub}>{plot.areaHectares ?? '—'} ha</Text>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={styles.newClaimBtn}
          onPress={() => router.push('/(app)/claims/new')}
          accessibilityLabel="Abrir sinistro nessa fazenda"
        >
          <Text style={styles.newClaimText}>📋 Abrir Sinistro</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
      />
    </View>
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
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { ...typography.subheading, color: colors.text },
  section: { gap: spacing.sm },
  field: { gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.textOnPrimary, fontWeight: '600', fontSize: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { ...typography.caption, color: colors.textMuted },
  infoValue: { ...typography.body, color: colors.text, fontSize: 15 },
  plotCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  plotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plotName: { ...typography.label, color: colors.text },
  plotSub: { ...typography.caption },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '600' },
  newClaimBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  newClaimText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
});
