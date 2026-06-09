import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { NdviHistoryChart } from '@/components/NdviHistoryChart';
import { useToast } from '@/components/Toast';
import { fonts, radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Crop, cropService } from '@/services/cropService';
import { Farm, farmService } from '@/services/farmService';
import {
  CreatePlotPayload,
  NdviHistorico,
  Plot,
  plotService,
  PLOT_SITUATION,
  PLOT_SITUATION_COLOR,
} from '@/services/plotService';

export default function FarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { showToast } = useToast();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [ndviHistory, setNdviHistory] = useState<NdviHistorico[]>([]);
  const [ndviLoading, setNdviLoading] = useState(false);
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
  const [plotSituationId, setPlotSituationId] = useState(1);
  const [savingPlot, setSavingPlot] = useState(false);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const [farmData, plotsData] = await Promise.all([
        farmService.getById(id),
        plotService.listByFarm(id),
      ]);
      setFarm(farmData);
      setPlots(plotsData);
      if (plotsData.length > 0) {
        setSelectedPlotId(plotsData[0].id);
      } else {
        setSelectedPlotId(null);
      }
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

  useEffect(() => {
    if (!selectedPlotId) {
      setNdviHistory([]);
      return undefined;
    }

    let cancelled = false;
    setNdviLoading(true);
    plotService
      .getNdviHistorico(selectedPlotId)
      .then((data) => {
        if (!cancelled) setNdviHistory(data);
      })
      .catch(() => {
        if (!cancelled) setNdviHistory([]);
      })
      .finally(() => {
        if (!cancelled) setNdviLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPlotId]);

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
      showToast('Fazenda atualizada com sucesso.', 'success');
    } catch {
      showToast('Não foi possível salvar as alterações.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function openPlotModal() {
    setPlotModal(true);
    if (crops.length === 0) {
      setCropsLoading(true);
      try {
        const data = await cropService.list();
        setCrops(data);
      } catch {
        setCrops([]);
      } finally {
        setCropsLoading(false);
      }
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
        plotSituationId,
        areaHectares: plotArea ? parseFloat(plotArea) : undefined,
        cropId: selectedCropId ?? undefined,
      };
      const newPlot = await plotService.create(payload);
      setPlots((prev) => [...prev, newPlot]);
      setSelectedPlotId(newPlot.id);
      setPlotModal(false);
      setPlotIdentifier('');
      setPlotArea('');
      setPlotSituationId(1);
      setSelectedCropId(null);
      showToast('Talhão cadastrado com sucesso.', 'success');
    } catch {
      showToast('Não foi possível cadastrar o talhão.', 'error');
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
            setPlots((prev) => {
              const next = prev.filter((p) => p.id !== plot.id);
              setSelectedPlotId((current) => {
                if (current !== plot.id) return current;
                return next[0]?.id ?? null;
              });
              return next;
            });
            showToast('Talhão removido com sucesso.', 'success');
          } catch {
            showToast('Não foi possível remover o talhão.', 'error');
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingState variant="detail" />;
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
              <Text style={{ color: colors.text, fontFamily: fonts.semiBold }}>
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
              onPress={openPlotModal}
              style={styles.addPlotBtn}
              accessibilityLabel="Adicionar talhão"
            >
              <Ionicons name="add" size={14} color={colors.primary} />
              <Text style={styles.addPlotBtnText}>Novo talhão</Text>
            </TouchableOpacity>
          </View>

          {plots.length === 0 ? (
            <EmptyState message="Nenhum talhão cadastrado." ionicon="apps-outline" />
          ) : (
            plots.map((plot) => {
              const color = PLOT_SITUATION_COLOR[plot.plotSituationId] ?? colors.textMuted;
              const label = PLOT_SITUATION[plot.plotSituationId] ?? `Situação ${plot.plotSituationId}`;
              const isSelected = selectedPlotId === plot.id;
              return (
                <TouchableOpacity
                  key={plot.id}
                  style={[styles.plotCard, isSelected && styles.plotCardSelected]}
                  onPress={() => setSelectedPlotId(plot.id)}
                  accessibilityLabel={`Talhão ${plot.identifier}`}
                >
                  <View style={styles.plotRow}>
                    <View style={styles.plotInfo}>
                      <Text style={styles.plotName}>{plot.identifier}</Text>
                      <Text style={styles.plotSub}>{plot.areaHectares != null ? `${plot.areaHectares} ha` : '— ha'}</Text>
                    </View>
                    <View style={styles.plotActions}>
                      <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                        <Text style={[styles.badgeText, { color }]}>{label}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmDeletePlot(plot)}
                        style={styles.deletePlotBtn}
                        accessibilityLabel={`Remover talhão ${plot.identifier}`}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {plots.length > 0 ? (
          <NdviHistoryChart
            data={ndviHistory}
            loading={ndviLoading}
            emptyMessage="Sem leituras NDVI para o talhão selecionado."
          />
        ) : null}

        <TouchableOpacity
          style={styles.newClaimBtn}
          onPress={() => router.push('/(app)/claims/new')}
          accessibilityLabel="Abrir sinistro nessa fazenda"
        >
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Text style={styles.newClaimText}>Abrir Sinistro</Text>
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

              <View style={styles.field}>
                <Text style={styles.label}>Situação</Text>
                <View style={styles.situationRow}>
                  {Object.entries(PLOT_SITUATION).map(([key, label]) => {
                    const sid = Number(key);
                    const selected = plotSituationId === sid;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.cropChip, selected && styles.cropChipSelected]}
                        onPress={() => setPlotSituationId(sid)}
                        accessibilityLabel={`Situação ${label}`}
                      >
                        <Text style={[styles.cropChipText, selected && styles.cropChipTextSelected]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Cultura (opcional)</Text>
                {cropsLoading ? (
                  <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />
                ) : crops.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                    <View style={styles.cropRow}>
                      {crops.map((crop) => (
                        <TouchableOpacity
                          key={crop.id}
                          style={[
                            styles.cropChip,
                            selectedCropId === crop.id && styles.cropChipSelected,
                          ]}
                          onPress={() => setSelectedCropId(selectedCropId === crop.id ? null : crop.id)}
                          accessibilityLabel={`Cultura ${crop.name}`}
                        >
                          <Text
                            style={[
                              styles.cropChipText,
                              selectedCropId === crop.id && styles.cropChipTextSelected,
                            ]}
                          >
                            {crop.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <Text style={styles.cropEmptyText}>Nenhuma cultura disponível no catálogo.</Text>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => { setPlotModal(false); setPlotIdentifier(''); setPlotArea(''); setPlotSituationId(1); setSelectedCropId(null); }}
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
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
    flex: { flex: 1, backgroundColor: c.background },
    content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.md,
      ...shadow.sm,
    },
    sectionTitle: { ...typography.title, color: c.text },
    section: { gap: spacing.sm },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    addPlotBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: c.primaryLight,
      borderRadius: radius.full,
    },
    addPlotBtnText: { color: c.primary, fontFamily: fonts.semiBold, fontSize: 13 },
    field: { gap: spacing.xs },
    label: { ...typography.label, color: c.textSecondary },
    input: {
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 15,
      color: c.text,
      backgroundColor: c.background,
    },
    button: {
      backgroundColor: c.primary,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c.textOnPrimary, fontFamily: fonts.bold, fontSize: 16 },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    infoLabel: { ...typography.caption, color: c.textMuted, flexShrink: 0 },
    infoValue: { ...typography.body, color: c.text, fontSize: 15, flex: 1, textAlign: 'right' },
    plotCard: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.sm,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    plotCardSelected: {
      borderColor: c.primary,
      backgroundColor: c.primaryLight,
    },
    plotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    plotInfo: { flex: 1, gap: 3 },
    plotName: { ...typography.bodyBold, color: c.text },
    plotSub: { ...typography.caption, color: c.textMuted },
    plotActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeText: { ...typography.micro },
    deletePlotBtn: {
      padding: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: c.dangerBg,
    },
    newClaimBtn: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 1.5,
      borderColor: c.primary,
    },
    newClaimText: { color: c.primary, fontFamily: fonts.bold, fontSize: 15 },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
    },
    modalTitle: { ...typography.title, color: c.text },
    modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
    modalCancel: {
      flex: 1,
      padding: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
      backgroundColor: c.background,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    modalCancelText: { color: c.textMuted, fontFamily: fonts.semiBold },
    cropRow: { flexDirection: 'row', gap: spacing.xs, paddingBottom: spacing.xs },
    situationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 4 },
    cropChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    cropChipSelected: { borderColor: c.primary, backgroundColor: c.primaryLight },
    cropChipText: { fontSize: 13, color: c.textMuted, fontFamily: fonts.medium },
    cropChipTextSelected: { color: c.primary, fontFamily: fonts.bold },
    cropEmptyText: { ...typography.caption, color: c.textMuted, marginTop: spacing.xs },
    modalConfirm: {
      flex: 1,
      padding: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
      backgroundColor: c.primary,
    },
    modalConfirmText: { color: c.textOnPrimary, fontFamily: fonts.bold },
  });
}
