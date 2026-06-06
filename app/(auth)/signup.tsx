import React, { useState } from 'react';
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

import { Link } from 'expo-router';
import axios from 'axios';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuthContext } from '@/store/authContext';

export default function SignupScreen() {
  const { register } = useAuthContext();

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
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.title}>Zenith Harvest</Text>
          <Text style={styles.subtitle}>Crie sua conta de produtor</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Cadastro</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="João"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Campo nome"
              />
            </View>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Sobrenome</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Silva"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Campo sobrenome"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              placeholder="000.000.000-00"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Campo CPF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="(11) 99999-9999"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Campo telefone"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Campo e-mail"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Campo senha"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            accessibilityLabel="Criar conta"
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
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

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: { alignItems: 'center', gap: spacing.sm },
  logo: { fontSize: 56 },
  title: { ...typography.heading, fontSize: 28, color: colors.primary },
  subtitle: { ...typography.body, color: colors.textMuted },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  formTitle: { ...typography.subheading, color: colors.text },
  error: {
    color: colors.danger,
    fontSize: 14,
    backgroundColor: '#FFF0EB',
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
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
    marginTop: spacing.xs,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.textOnPrimary, fontWeight: '600', fontSize: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  footerText: { color: colors.textMuted },
  link: { color: colors.primary, fontWeight: '600' },
});
