import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import Ionicons from '@expo/vector-icons/Ionicons';

import { ErrorState } from '@/components/ErrorState';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { LoadingState } from '@/components/LoadingState';
import { useToast } from '@/components/Toast';
import { fonts, radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
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
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { showToast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
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

  function pickPhoto() {
    Alert.alert('Adicionar foto', 'Escolha a origem da imagem', [
      { text: 'Câmera', onPress: pickFromCamera },
      { text: 'Galeria', onPress: pickFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar fotos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoUrl(result.assets[0].uri);
    }
  }

  async function pickFromGallery() {
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
    setSubmitting(true);
    try {
      const claim = await claimService.create({
        policyId: selectedPolicyId,
        claimSituationId: 1,
        categoryId,
        subCategoryId,
        description: description.trim() || undefined,
        photoUrl: photoUrl ?? undefined,
        openingGpsLat: coords?.latitude,
        openingGpsLng: coords?.longitude,
      });
      showToast('Sinistro registrado com sucesso!', 'success');
      router.replace(`/(app)/claims/${claim.id}`);
    } catch {
      showToast('Não foi possível abrir o sinistro. Tente novamente.', 'error');
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
      <Stack.Screen
        options={{
          title: 'Abrir Sinistro',
          headerShown: true,
          headerLeft: () => <HeaderBackButton fallback="/(app)/claims" />,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

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
          <View style={styles.photoHeader}>
            <Text style={styles.sectionTitle}>Foto do Dano</Text>
            {photoUri ? (
              <TouchableOpacity
                onPress={() => { setPhotoUri(null); setPhotoUrl(null); }}
                accessibilityLabel="Remover foto"
                style={styles.removePhotoBtn}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                <Text style={styles.removePhotoText}>Remover</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={pickPhoto}
            accessibilityLabel="Adicionar foto"
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoBtnInner}>
                <Ionicons name="camera-outline" size={28} color={colors.textLight} />
                <Text style={styles.photoBtnText}>Câmera ou galeria</Text>
              </View>
            )}
          </TouchableOpacity>
          {coords && (
            <View style={styles.coordsRow}>
              <Ionicons name="location-outline" size={14} color={colors.primary} />
              <Text style={styles.coordsText}>
                {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
              </Text>
            </View>
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

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: c.background },
    content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadow.sm,
    },
    sectionTitle: { ...typography.title, color: c.text },
    emptyText: { ...typography.caption, color: c.textMuted, textAlign: 'center', padding: spacing.sm },
    input: {
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 15,
      color: c.text,
      backgroundColor: c.background,
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    option: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    optionSelected: { backgroundColor: c.primary, borderColor: c.primary },
    optionText: { fontSize: 14, color: c.textSecondary },
    optionTextSelected: { color: c.textOnPrimary, fontFamily: fonts.bold },
    photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    removePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    removePhotoText: { fontFamily: fonts.medium, fontSize: 13, color: c.danger },
    photoBtn: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.border,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
      overflow: 'hidden',
      backgroundColor: c.surfaceSecondary,
    },
    photoBtnInner: { alignItems: 'center', gap: spacing.xs, padding: spacing.lg },
    photoBtnText: { ...typography.label, color: c.textLight },
    photo: { width: '100%', height: 200, borderRadius: radius.sm },
    coordsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
    coordsText: { ...typography.caption, color: c.textMuted },
    submitBtn: {
      backgroundColor: c.primary,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      ...shadow.sm,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: c.textOnPrimary, fontFamily: fonts.bold, fontSize: 16 },
  });
}
