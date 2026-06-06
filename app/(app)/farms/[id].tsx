import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { CreatePlotPayload, Plot, plotService, PLOT_SITUATION, PLOT_SITUATION_COLOR } from '@/services/plotService';

export default function FarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // edit form fields
  const [name, setName] = useState('');
  const [carRegistration, setCarRegistration] = useState('');
  const [nirf, setNirf] = useState('');
  const [totalAreaHectares, setTotalAreaHectares] = useState('');
  const [state, setState] = useState('');

  // new plot modal
  const [plotModal, setPlotModal] = useState(false);
  const [plotIdentifier, setPlotIdentifier] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [savingPlot, setSavingPlot] = useState(false);

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

  async function handleAddPlot() {
    if (!plotIdentifier.trim()) {
      Alert.alert('Atenção', 'Identificador do talhão é obrigatório.');
      return;
    }
    setSavingPlot(true);
    try {
      const payload: CreatePlotPayload = {
        farmId: id,
        identifier: plotIdentifier.trim(),
        plotSituationId: 1,
        areaHectares: plotArea ? parseFloat(plotArea) : undefined,
      };
      const newPlot = await plotService.create(payload);
      setPlots((prev) => [...prev, newPlot]);
      setPlotModal(false);
      setPlotIdentifier('');
      setPlotArea('');
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar o talhão.');
    } finally {
      setSavingPlot(false);
    }
  }

  function confirmDeletePlot(plot: Plot) {
    Alert.alert('Remover talhão', `Deseja remover o talhão "${plot.identifier}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await plotService.delete(plot.id);
            setPlots((prev) => prev.filter((p) => p.id !== plot.id));
          } catch {
            Alert.alert('Erro', 'Não foi possível remover o talhão.');
          }
        },
      },
    ]);
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
              {saving
                ? <ActivityIndicator color={colors.textOnPrimary} />
                : <Text style={styles.buttonText}>Salvar alterações</Text>
              }
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

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Talhões ({plots.length})</Text>
            <TouchableOpacity
              onPress={() => setPlotModal(true)}
              style={styles.addPlotBtn}
              accessibilityLabel="Adicionar talhão"
            >
              <Text style={styles.addPlotBtnText}>+ Novo talhão</Text>
            </TouchableOpacity>
          </View>

          {plots.length === 0 ? (
            <View style={styles.emptyPlots}>
              <Text style={styles.emptyText}>Nenhum talhão cadastrado.</Text>
            </View>
          ) : (
            plots.map((plot) => {
              const color = PLOT_SITUATION_COLOR[plot.plotSituationId] ?? colors.textMuted;
              const label = PLOT_SITUATION[plot.plotSituationId] ?? `Situação ${plot.plotSituationId}`;
              return (
                <View key={plot.id} style={styles.plotCard}>
                  <View style={styles.plotRow}>
                    <View style={styles.plotInfo}>
                      <Text style={styles.plotName}>{plot.identifier}</Text>
                      <Text style={styles.plotSub}>{plot.areaHectares != null ? `${plot.areaHectares} ha` : '— ha'}</Text>
                    </View>
                    <View style={styles.plotActions}>
                      <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.badgeText, { color }]}>{label}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmDeletePlot(plot)}
                        style={styles.deletePlotBtn}
                        accessibilityLabel={`Remover talhão ${plot.identifier}`}
                      >
                        <Text style={styles.deletePlotText}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity
          style={styles.newClaimBtn}
          onPress={() => router.push('/(app)/claims/new')}
          accessibilityLabel="Abrir sinistro nessa fazenda"
        >
          <Text style={styles.newClaimText}>📋 Abrir Sinistro</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal novo talhão */}
      <Modal
        visible={plotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPlotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Novo Talhão</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Identificador *</Text>
                <TextInput
                  style={styles.input}
                  value={plotIdentifier}
                  onChangeText={setPlotIdentifier}
                  placeholder="Ex: Talhão A, Bloco 01"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Identificador do talhão"
                  autoFocus
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Área (hectares)</Text>
                <TextInput
                  style={styles.input}
                  value={plotArea}
                  onChangeText={setPlotArea}
                  placeholder="Ex: 25.5"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  accessibilityLabel="Área do talhão"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => { setPlotModal(false); setPlotIdentifier(''); setPlotArea(''); }}
                  accessibilityLabel="Cancelar"
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirm, savingPlot && styles.buttonDisabled]}
                  onPress={handleAddPlot}
                  disabled={savingPlot}
                  accessibilityLabel="Salvar talhão"
                >
                  {savingPlot
                    ? <ActivityIndicator color={colors.textOnPrimary} />
                    : <Text style={styles.modalConfirmText}>Salvar</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addPlotBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  addPlotBtnText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  emptyPlots: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyText: { ...typography.caption, color: colors.textMuted },
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
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  plotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plotInfo: { flex: 1, gap: spacing.xs },
  plotName: { ...typography.label, color: colors.text },
  plotSub: { ...typography.caption },
  plotActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '600' },
  deletePlotBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: '#FFF0EB',
  },
  deletePlotText: { fontSize: 16 },
  newClaimBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  newClaimText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: { ...typography.subheading, color: colors.text },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  modalCancel: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: { color: colors.textMuted, fontWeight: '600' },
  modalConfirm: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalConfirmText: { color: colors.textOnPrimary, fontWeight: '600' },
});
