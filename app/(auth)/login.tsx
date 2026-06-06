import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import axios from 'axios';

import { API_BASE_URL } from '@/constants/api';

import { useColors, useGradient } from '@/hooks/useColors';
import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useAuthContext } from '@/store/authContext';

export default function LoginScreen() {
  const { login } = useAuthContext();
  const colors = useColors();
  const gradient = useGradient();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else if (axios.isAxiosError(err) && !err.response) {
        setError(
          `Não foi possível conectar em ${API_BASE_URL}. Verifique se o gateway está rodando e se EXPO_PUBLIC_API_URL aponta para o IP correto (não use localhost no celular).`
        );
      } else {
        setError('Falha ao conectar. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Ionicons name="leaf" size={28} color={colors.textOnPrimary} />
          </View>
          <Text style={styles.brandName}>Zenith Harvest</Text>
          <Text style={styles.brandSub}>Seguro agrícola paramétrico</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na conta</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                placeholder="seu@email.com"
                placeholderTextColor={colors.textLight}
                accessibilityLabel="Campo e-mail"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithToggle]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholder="Sua senha"
                placeholderTextColor={colors.textLight}
                accessibilityLabel="Campo senha"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            accessibilityLabel="Entrar"
            style={loading ? styles.buttonDisabledWrap : undefined}
          >
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.button}>
              {loading
                ? <ActivityIndicator color={colors.textOnGradient} />
                : <Text style={styles.buttonText}>Entrar</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity accessibilityLabel="Criar conta">
                <Text style={styles.link}>Cadastre-se</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: c.primary },
    container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.xl },
    header: { alignItems: 'center', gap: spacing.sm },
    brandMark: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    brandName: { fontSize: 26, fontWeight: '800', color: c.textOnPrimary, letterSpacing: -0.5 },
    brandSub: { ...typography.body, color: 'rgba(255,255,255,0.75)', fontSize: 14 },
    card: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, ...shadow.md },
    cardTitle: { ...typography.title, color: c.text, marginBottom: spacing.xs },
    errorBox: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
      backgroundColor: c.dangerBg, padding: spacing.sm, borderRadius: radius.sm,
    },
    errorText: { color: c.danger, fontSize: 13, flex: 1 },
    field: { gap: spacing.xs },
    label: { ...typography.label, color: c.textSecondary },
    inputWrap: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: c.border,
      borderRadius: radius.md, backgroundColor: c.background,
    },
    inputIcon: { paddingLeft: spacing.sm },
    input: { flex: 1, padding: spacing.md, fontSize: 15, color: c.text },
    inputWithToggle: { paddingRight: 0 },
    eyeBtn: { padding: spacing.sm },
    buttonDisabledWrap: { opacity: 0.6 },
    button: { borderRadius: radius.xl, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs },
    buttonText: { color: c.textOnGradient, fontWeight: '700', fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { color: c.textMuted, fontSize: 14 },
    link: { color: c.primary, fontWeight: '700', fontSize: 14 },
  });
}
