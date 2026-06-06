import React, { useEffect, useMemo, useState } from 'react';
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

import * as Location from 'expo-location';
import { router, Stack } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';

import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { farmService } from '@/services/farmService';
import { useAuthContext } from '@/store/authContext';

export default function NewFarmScreen() {
  const { user } = useAuthContext();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [carRegistration, setCarRegistration] = useState('');
  const [nirf, setNirf] = useState('');
  const [state, setState] = useState('');
  const [totalAreaHectares, setTotalAreaHectares] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  async function getLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(String(loc.coords.latitude.toFixed(6)));
      setLongitude(String(loc.coords.longitude.toFixed(6)));
    } catch {
    } finally {
      setLocating(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Atenção', 'Nome da fazenda é obrigatório.'); return; }
    if (!carRegistration.trim()) { Alert.alert('Atenção', 'CAR é obrigatório.'); return; }
    if (!nirf.trim()) { Alert.alert('Atenção', 'NIRF é obrigatório.'); return; }
    if (!state.trim()) { Alert.alert('Atenção', 'Estado (UF) é obrigatório.'); return; }
    if (!totalAreaHectares.trim() || isNaN(parseFloat(totalAreaHectares))) {
      Alert.alert('Atenção', 'Informe a área em hectares.'); return;
    }
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Atenção', 'Localização GPS é obrigatória.'); return;
    }
    if (!user?.id) { Alert.alert('Erro', 'Usuário não identificado.'); return; }

    setSaving(true);
    try {
      const farm = await farmService.create({
        userId: user.id,
        name: name.trim(),
        carRegistration: carRegistration.trim(),
        nirf: nirf.trim(),
        state: state.trim().toUpperCase(),
        totalAreaHectares: parseFloat(totalAreaHectares),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      Alert.alert('Fazenda cadastrada!', `"${farm.name}" foi registrada com sucesso.`, [
        { text: 'Ver fazenda', onPress: () => router.replace(`/(app)/farms/${farm.id}`) },
        { text: 'Voltar', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar a fazenda. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Nova Fazenda', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identificação</Text>

          <Field label="Nome da fazenda *" value={name} onChange={setName} placeholder="Ex: Fazenda Santa Cruz" />
          <Field label="CAR (Cadastro Ambiental Rural) *" value={carRegistration} onChange={setCarRegistration} placeholder="SP-1234567-XXXXX" />
          <Field label="NIRF *" value={nirf} onChange={setNirf} placeholder="00000000-0" keyboardType="numeric" />
          <Field label="Estado (UF) *" value={state} onChange={setState} placeholder="SP" maxLength={2} />
          <Field
            label="Área total (hectares) *"
            value={totalAreaHectares}
            onChange={setTotalAreaHectares}
            placeholder="100.5"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Localização GPS</Text>
            <TouchableOpacity
              onPress={getLocation}
              disabled={locating}
              accessibilityLabel="Usar localização atual"
              style={styles.locBtn}
            >
              {locating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="location-outline" size={14} color={colors.primary} />
                  <Text style={styles.locBtnText}>Usar atual</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Field label="Latitude *" value={latitude} onChange={setLatitude} placeholder="-23.5505" keyboardType="numeric" />
            </View>
            <View style={styles.flex1}>
              <Field label="Longitude *" value={longitude} onChange={setLongitude} placeholder="-46.6333" keyboardType="numeric" />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityLabel="Cadastrar fazenda"
        >
          {saving
            ? <ActivityIndicator color={colors.textOnPrimary} />
            : <Text style={styles.buttonText}>Cadastrar Fazenda</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  maxLength?: number;
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
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        accessibilityLabel={label}
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: c.background },
    flex1: { flex: 1 },
    content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.md,
      ...shadow.sm,
    },
    sectionTitle: { ...typography.title, color: c.text },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    row: { flexDirection: 'row', gap: spacing.sm },
    locBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: c.primaryLight,
      borderRadius: radius.full,
    },
    locBtnText: { color: c.primary, fontWeight: '600', fontSize: 13 },
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
      ...shadow.sm,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c.textOnPrimary, fontWeight: '700', fontSize: 16 },
  });
}
