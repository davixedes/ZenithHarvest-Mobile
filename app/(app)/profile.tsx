import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';

import { fonts, radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useAuthContext } from '@/store/authContext';
import { useThemeContext } from '@/store/themeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuthContext();
  const { isDark, toggleTheme } = useThemeContext();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loggingOut, setLoggingOut] = useState(false);

  function confirmLogout() {
    const handleLogout = async () => {
      setLoggingOut(true);
      try {
        await logout();
        router.replace('/(auth)/login');
      } catch (err) {
        console.error('Logout failed:', err);
        setLoggingOut(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Deseja encerrar a sessão?');
      if (confirmed) handleLogout();
    } else {
      Alert.alert('Sair da conta', 'Deseja encerrar a sessão?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]);
    }
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

        <View style={styles.card}>
          <InfoRow icon="person-outline" label="Nome completo" value={user ? `${user.name} ${user.lastName}` : '—'} />
          <InfoRow icon="mail-outline" label="E-mail" value={user?.email ?? '—'} />
        </View>

        <View style={styles.aboutBtn}>
          <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={colors.textSecondary} />
          <Text style={styles.aboutBtnText}>Modo escuro</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isDark ? colors.secondary : colors.surface}
            accessibilityLabel="Alternar modo escuro"
            style={{ marginLeft: 'auto' }}
          />
        </View>

        <TouchableOpacity
          style={styles.aboutBtn}
          onPress={() => router.push('/(app)/payments')}
          accessibilityLabel="Ver pagamentos"
        >
          <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.aboutBtnText}>Pagamentos</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aboutBtn}
          onPress={() => router.push('/(app)/policies')}
          accessibilityLabel="Ver apólices"
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.aboutBtnText}>Apólices</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

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

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={16} color={colors.textMuted} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
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
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
      ...shadow.md,
    },
    avatarText: { fontSize: 38, color: c.textOnPrimary, fontFamily: fonts.extraBold },
    card: {
      width: '100%',
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.xs,
      ...shadow.sm,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    infoLabel: { ...typography.caption, color: c.textMuted },
    infoValue: { ...typography.body, color: c.text, fontSize: 14, maxWidth: '55%', textAlign: 'right' },
    aboutBtn: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      ...shadow.sm,
    },
    aboutBtnText: { color: c.textSecondary, fontFamily: fonts.semiBold, fontSize: 15, flex: 1 },
    logoutBtn: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.dangerBg,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1.5,
      borderColor: c.danger + '30',
    },
    logoutBtnDisabled: { opacity: 0.6 },
    logoutBtnText: { color: c.danger, fontFamily: fonts.bold, fontSize: 15 },
  });
}
