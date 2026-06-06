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
import {
  CLAIM_CATEGORY,
  CLAIM_SUBCATEGORY,
  claimService,
} from '@/services/claimService';
import { Policy, policyService } from '@/services/policyService';

const CATEGORY_ENTRIES = Object.entries(CLAIM_CATEGORY).map(([k, v]) => ({
  id: Number(k),
  label: v,
}));

const SUBCATEGORY_ENTRIES = Object.entries(CLAIM_SUBCATEGORY).map(([k, v]) => ({
  id: Number(k),
  label: v,
}));

export default function NewClaimScreen() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [claimNumber, setClaimNumber] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [errorPolicies, setErrorPolicies] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPolicies = useCallback(async () => {
    try {
      const data = await policyService.list();
      setPolicies(data);
    } catch {
      setErrorPolicies('Não foi possível carregar as apólices. Verifique se há apólices ativas.');
    } finally {
      setLoadingPolicies(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
    getLocation();
  }, [loadPolicies]);

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
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoUrl(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!selectedPolicyId) {
      Alert.alert('Atenção', 'Selecione a apólice vinculada ao talhão.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Atenção', 'Selecione a categoria do evento.');
      return;
    }
    if (!subCategoryId) {
      Alert.alert('Atenção', 'Selecione a subcategoria.');
      return;
    }
    if (!claimNumber.trim()) {
      Alert.alert('Atenção', 'Informe o número do sinistro.');
      return;
    }
    setSubmitting(true);
    try {
      const claim = await claimService.create({
        claimNumber: claimNumber.trim(),
        policyId: selectedPolicyId,
        claimSituationId: 1,
        categoryId,
        subCategoryId,
        description: description.trim() || undefined,
        photoUrl: photoUrl ?? undefined,
        openingGpsLat: coords?.latitude,
        openingGpsLng: coords?.longitude,
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

  if (loadingPolicies) return <LoadingState />;
  if (errorPolicies) return <ErrorState message={errorPolicies} onRetry={loadPolicies} />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Abrir Sinistro', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Número do Sinistro</Text>
          <TextInput
            style={styles.input}
            value={claimNumber}
            onChangeText={setClaimNumber}
            placeholder="SIN-2024-001"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            accessibilityLabel="Número do sinistro"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Apólice</Text>
          {policies.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma apólice ativa encontrada.</Text>
          ) : (
            <View style={styles.optionGroup}>
              {policies.map((policy) => (
                <TouchableOpacity
                  key={policy.id}
                  style={[
                    styles.option,
                    selectedPolicyId === policy.id && styles.optionSelected,
                  ]}
                  onPress={() => setSelectedPolicyId(policy.id)}
                  accessibilityLabel={`Apólice ${policy.policyNumber}`}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedPolicyId === policy.id && styles.optionTextSelected,
                    ]}
                  >
                    {policy.policyNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Categoria do Evento</Text>
          <View style={styles.optionGroup}>
            {CATEGORY_ENTRIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.option, categoryId === cat.id && styles.optionSelected]}
                onPress={() => {
                  setCategoryId(cat.id);
                  setSubCategoryId(null);
                }}
                accessibilityLabel={cat.label}
              >
                <Text
                  style={[
                    styles.optionText,
                    categoryId === cat.id && styles.optionTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Subcategoria</Text>
          <View style={styles.optionGroup}>
            {SUBCATEGORY_ENTRIES.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={[styles.option, subCategoryId === sub.id && styles.optionSelected]}
                onPress={() => setSubCategoryId(sub.id)}
                accessibilityLabel={sub.label}
              >
                <Text
                  style={[
                    styles.optionText,
                    subCategoryId === sub.id && styles.optionTextSelected,
                  ]}
                >
                  {sub.label}
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
  emptyText: { ...typography.caption, textAlign: 'center', padding: spacing.sm },
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
