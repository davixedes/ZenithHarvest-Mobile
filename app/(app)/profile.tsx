import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, Stack } from 'expo-router';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuthContext } from '@/store/authContext';

export default function ProfileScreen() {
  const { user, logout } = useAuthContext();
  const [loggingOut, setLoggingOut] = useState(false);

  function confirmLogout() {
    Alert.alert('Sair da conta', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Perfil', headerShown: true }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>

        <Text style={styles.name}>{user?.name ?? '—'}</Text>
        <Text style={styles.email}>{user?.email ?? '—'}</Text>

        <View style={styles.card}>
          <InfoRow label="Nome" value={user?.name ?? '—'} />
          <InfoRow label="E-mail" value={user?.email ?? '—'} />
          <InfoRow label="ID" value={user?.id ?? '—'} />
        </View>

        <TouchableOpacity
          style={[styles.aboutBtn]}
          onPress={() => router.push('/about')}
          accessibilityLabel="Sobre o app"
        >
          <Text style={styles.aboutBtnText}>ℹ️ Sobre o App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, loggingOut && styles.logoutBtnDisabled]}
          onPress={confirmLogout}
          disabled={loggingOut}
          accessibilityLabel="Sair da conta"
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Text style={styles.logoutBtnText}>Sair da conta</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
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
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: { fontSize: 36, color: colors.textOnPrimary, fontWeight: '700' },
  name: { ...typography.heading, color: colors.text },
  email: { ...typography.body, color: colors.textMuted },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { ...typography.caption, color: colors.textMuted },
  infoValue: { ...typography.body, color: colors.text, fontSize: 14 },
  aboutBtn: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutBtnText: { color: colors.text, fontWeight: '600', fontSize: 15 },
  logoutBtn: {
    width: '100%',
    backgroundColor: '#FFF0EB',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger + '40',
  },
  logoutBtnDisabled: { opacity: 0.6 },
  logoutBtnText: { color: colors.danger, fontWeight: '600', fontSize: 15 },
});
