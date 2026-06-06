import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Constants from 'expo-constants';
import { Stack } from 'expo-router';

import { colors, radius, spacing, typography } from '@/constants/theme';

const COMMIT_HASH = process.env.EXPO_PUBLIC_COMMIT_HASH ?? 'dev';

export default function AboutScreen() {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <>
      <Stack.Screen options={{ title: 'Sobre o App', headerShown: true }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.logoArea}>
          <Text style={styles.logo}>🌱</Text>
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
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl, alignItems: 'stretch' },
  logoArea: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  logo: { fontSize: 64 },
  appName: { ...typography.heading, fontSize: 28, color: colors.primary },
  tagline: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { ...typography.caption, color: colors.textMuted },
  infoValue: { ...typography.body, color: colors.text, fontSize: 14 },
  body: { ...typography.body, color: colors.text, lineHeight: 22 },
  footer: {
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
