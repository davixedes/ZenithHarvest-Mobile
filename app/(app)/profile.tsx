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

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';

import { colors, radius, shadow, spacing, typography } from '@/constants/theme';
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
          // A navegação é tratada pelo <Redirect> em (app)/_layout.tsx
          // quando isAuthenticated vira false
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
          style={styles.aboutBtn}
          onPress={() => router.push('/about')}
          accessibilityLabel="Sobre o app"
        >
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.aboutBtnText}>Sobre o App</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} style={{ marginLeft: 'auto' }} />
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
            <>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={styles.logoutBtnText}>Sair da conta</Text>
            </>
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadow.md,
  },
  avatarText: { fontSize: 38, color: colors.textOnPrimary, fontWeight: '800' },
  name: { ...typography.heading, color: colors.text },
  email: { ...typography.body, color: colors.textMuted },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: { ...typography.caption, color: colors.textMuted },
  infoValue: { ...typography.body, color: colors.text, fontSize: 14 },
  aboutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  aboutBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 15, flex: 1 },
  logoutBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.danger + '30',
  },
  logoutBtnDisabled: { opacity: 0.6 },
  logoutBtnText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});
