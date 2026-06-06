import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router, Stack } from 'expo-router';

import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { claimService } from '@/services/claimService';
import { farmService, Farm, Plot } from '@/services/farmService';

const CATEGORIES = [
  { label: 'Seca', value: 'DROUGHT' },
  { label: 'Excesso de chuva', value: 'FLOOD' },
  { label: 'Granizo', value: 'HAIL' },
  { label: 'Geada', value: 'FROST' },
  { label: 'Vento forte', value: 'WIND' },
  { label: 'Praga', value: 'PEST' },
  { label: 'Outro', value: 'OTHER' },
];

export default function NewClaimScreen() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [errorFarms, setErrorFarms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFarms = useCallback(async () => {
    try {
      const data = await farmService.list();
      setFarms(data);
    } catch {
      setErrorFarms('Não foi possível carregar as fazendas.');
    } finally {
      setLoadingFarms(false);
    }
  }, []);

  useEffect(() => {
    loadFarms();
    getLocation();
  }, [loadFarms]);

  async function getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {}
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para adicionar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
    }
  }

  async function handleSubmit() {
    if (!selectedPlot) {
      Alert.alert('Atenção', 'Selecione o talhão afetado.');
      return;
    }
    if (!category) {
      Alert.alert('Atenção', 'Selecione a categoria do evento.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Atenção', 'Descreva o evento ocorrido.');
      return;
    }
    setSubmitting(true);
    try {
      const claim = await claimService.create({
        plotId: selectedPlot.id,
        category,
        subcategory: category,
        description: description.trim(),
        photoBase64: photoBase64 ?? undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
      Alert.alert('Sinistro aberto', 'Seu sinistro foi registrado com sucesso.', [
        { text: 'Ver detalhes', onPress: () => router.replace(`/(app)/claims/${claim.id}`) },
        { text: 'Voltar', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o sinistro. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingFarms) return <LoadingState />;
  if (errorFarms) return <ErrorState message={errorFarms} onRetry={loadFarms} />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Abrir Sinistro', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Localização do Dano</Text>

          <Text style={styles.label}>Fazenda</Text>
          <View style={styles.optionGroup}>
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                style={[
                  styles.option,
                  selectedFarm?.id === farm.id && styles.optionSelected,
                ]}
                onPress={() => {
                  setSelectedFarm(farm);
                  setSelectedPlot(null);
                }}
                accessibilityLabel={`Fazenda ${farm.name}`}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedFarm?.id === farm.id && styles.optionTextSelected,
                  ]}
                >
                  {farm.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedFarm?.plots && selectedFarm.plots.length > 0 && (
            <>
              <Text style={styles.label}>Talhão</Text>
              <View style={styles.optionGroup}>
                {selectedFarm.plots.map((plot) => (
                  <TouchableOpacity
                    key={plot.id}
                    style={[
                      styles.option,
                      selectedPlot?.id === plot.id && styles.optionSelected,
                    ]}
                    onPress={() => setSelectedPlot(plot)}
                    accessibilityLabel={`Talhão ${plot.name}`}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedPlot?.id === plot.id && styles.optionTextSelected,
                      ]}
                    >
                      {plot.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tipo de Evento</Text>
          <View style={styles.optionGroup}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.option, category === cat.value && styles.optionSelected]}
                onPress={() => setCategory(cat.value)}
                accessibilityLabel={cat.label}
              >
                <Text
                  style={[
                    styles.optionText,
                    category === cat.value && styles.optionTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva o que ocorreu com a lavoura..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            accessibilityLabel="Descrição do sinistro"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Foto do Dano</Text>
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={pickPhoto}
            accessibilityLabel="Adicionar foto"
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <Text style={styles.photoBtnText}>📷 Adicionar foto</Text>
            )}
          </TouchableOpacity>
          {coords && (
            <Text style={styles.coordsText}>
              📍 {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityLabel="Enviar sinistro"
        >
          {submitting ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.submitBtnText}>Enviar Sinistro</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { ...typography.subheading, color: colors.text },
  label: { ...typography.label, color: colors.text },
  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: 14, color: colors.text },
  optionTextSelected: { color: colors.textOnPrimary, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  photoBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    overflow: 'hidden',
  },
  photoBtnText: { color: colors.textMuted, fontSize: 16 },
  photo: { width: '100%', height: 200, borderRadius: radius.sm },
  coordsText: { ...typography.caption, textAlign: 'center' },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: colors.textOnPrimary, fontWeight: '600', fontSize: 16 },
});
