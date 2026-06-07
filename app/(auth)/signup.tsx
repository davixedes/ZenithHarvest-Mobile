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

import { useColors, useGradient } from '@/hooks/useColors';
import { fonts, radius, shadow, spacing, typography } from '@/constants/theme';
import { useAuthContext } from '@/store/authContext';

export default function SignupScreen() {
  const { register } = useAuthContext();
  const colors = useColors();
  const gradient = useGradient();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignup() {
    if (!name.trim() || !lastName.trim() || !cpf.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        lastName: lastName.trim(),
        cpf: cpf.trim().replace(/\D/g, ''),
        phone: phone.trim().replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('E-mail ou CPF já cadastrado.');
      } else {
        setError('Falha ao criar conta. Tente novamente.');
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
          <Text style={styles.brandSub}>Crie sua conta de produtor</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Cadastro</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName}
                placeholder="João" placeholderTextColor={colors.textLight} accessibilityLabel="Campo nome" />
            </View>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Sobrenome</Text>
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName}
                placeholder="Silva" placeholderTextColor={colors.textLight} accessibilityLabel="Campo sobrenome" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CPF</Text>
            <TextInput style={styles.input} value={cpf} onChangeText={setCpf}
              keyboardType="numeric" placeholder="000.000.000-00" placeholderTextColor={colors.textLight} accessibilityLabel="Campo CPF" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone}
              keyboardType="phone-pad" placeholder="(11) 99999-9999" placeholderTextColor={colors.textLight} accessibilityLabel="Campo telefone" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              autoCapitalize="none" keyboardType="email-address" autoComplete="email"
              placeholder="seu@email.com" placeholderTextColor={colors.textLight} accessibilityLabel="Campo e-mail" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword}
              secureTextEntry autoComplete="new-password"
              placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.textLight} accessibilityLabel="Campo senha" />
          </View>

          <TouchableOpacity onPress={handleSignup} disabled={loading} accessibilityLabel="Criar conta"
            style={loading ? styles.buttonDisabledWrap : undefined}>
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.button}>
              {loading
                ? <ActivityIndicator color={colors.textOnGradient} />
                : <Text style={styles.buttonText}>Criar conta</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity accessibilityLabel="Fazer login">
                <Text style={styles.link}>Entrar</Text>
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
    flex1: { flex: 1 },
    container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.xl },
    header: { alignItems: 'center', gap: spacing.sm },
    brandMark: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    brandName: { fontSize: 26, fontFamily: fonts.extraBold, color: c.textOnPrimary, letterSpacing: -0.5 },
    brandSub: { ...typography.body, color: 'rgba(255,255,255,0.75)', fontSize: 14 },
    form: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, ...shadow.md },
    formTitle: { ...typography.title, color: c.text },
    errorBox: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
      backgroundColor: c.dangerBg, padding: spacing.sm, borderRadius: radius.sm,
    },
    errorText: { color: c.danger, fontSize: 13, flex: 1 },
    row: { flexDirection: 'row', gap: spacing.sm },
    field: { gap: spacing.xs },
    label: { ...typography.label, color: c.textSecondary },
    input: {
      borderWidth: 1.5, borderColor: c.border, borderRadius: radius.md,
      padding: spacing.md, fontSize: 15, color: c.text, backgroundColor: c.background,
    },
    buttonDisabledWrap: { opacity: 0.6 },
    button: { borderRadius: radius.xl, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs },
    buttonText: { color: c.textOnGradient, fontFamily: fonts.bold, fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xs },
    footerText: { color: c.textMuted, fontSize: 14 },
    link: { color: c.primary, fontFamily: fonts.bold, fontSize: 14 },
  });
}
