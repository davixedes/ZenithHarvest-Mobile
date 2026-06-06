import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

const COMMIT_HASH = process.env.EXPO_PUBLIC_COMMIT_HASH ?? 'dev';

export default function AboutScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <>
      <Stack.Screen options={{ title: 'Sobre o App', headerShown: true }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.logoArea}>
          <View style={styles.iconMark}>
            <Ionicons name="leaf" size={36} color={colors.textOnPrimary} />
          </View>
          <Text style={styles.appName}>Zenith Harvest</Text>
          <Text style={styles.tagline}>Seguro agrícola paramétrico via satélite</Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="Versão" value={appVersion} />
          <InfoRow label="Build (commit)" value={COMMIT_HASH} />
          <InfoRow label="Plataforma" value="React Native + Expo SDK 56" />
          <InfoRow label="Navegação" value="Expo Router" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Equipe</Text>
          <InfoRow label="Integrante" value="Kaue Samartino" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sobre o Produto</Text>
          <Text style={styles.body}>
            O Zenith Harvest é uma plataforma de seguro paramétrico agrícola operada por
            satélite e inteligência artificial.
          </Text>
          <Text style={styles.body}>
            Quando o satélite detecta queda no índice NDVI da lavoura, a IA aprova
            automaticamente o sinistro e o pagamento é enviado via PIX em até 48 horas.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tecnologias</Text>
          <Text style={styles.body}>• React Native + Expo SDK 56</Text>
          <Text style={styles.body}>• Expo Router (file-based routing)</Text>
          <Text style={styles.body}>• Axios + JWT via SecureStore</Text>
          <Text style={styles.body}>• Backend: Java Spring Boot + AI</Text>
          <Text style={styles.body}>• Satellite: Sentinel-2 / NDVI</Text>
        </View>

        <Text style={styles.footer}>
          © 2025 Zenith Harvest — Global Solution · FIAP
        </Text>
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl, alignItems: 'stretch' },
    logoArea: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
    iconMark: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.md,
    },
    appName: { ...typography.display, color: c.text },
    tagline: { ...typography.body, color: c.textMuted, textAlign: 'center' },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadow.sm,
    },
    sectionTitle: { ...typography.title, color: c.text },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    infoLabel: { ...typography.caption, color: c.textMuted },
    infoValue: { ...typography.body, color: c.text, fontSize: 14 },
    body: { ...typography.body, color: c.textSecondary, lineHeight: 22 },
    footer: {
      textAlign: 'center',
      ...typography.caption,
      color: c.textLight,
      marginTop: spacing.md,
    },
  });
}
