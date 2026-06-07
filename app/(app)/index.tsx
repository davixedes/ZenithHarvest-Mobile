import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';

import { fonts, radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import {
  Claim,
  CLAIM_CATEGORY,
  CLAIM_SITUATION,
  CLAIM_SITUATION_COLOR,
  claimService,
} from '@/services/claimService';
import { Farm, farmService } from '@/services/farmService';
import { useAuthContext } from '@/store/authContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type Colors = ReturnType<typeof useColors>;
type Styles = ReturnType<typeof makeStyles>;

export default function DashboardScreen() {
  const { user } = useAuthContext();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [farms, setFarms] = useState<Farm[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, c] = await Promise.all([farmService.list(), claimService.list()]);
      setFarms(f);
      setClaims(c);
    } catch {
      // empty states are shown below
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openClaims = claims.filter((c) => c.claimSituationId === 1).length;

  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Olá, {user?.name ?? 'Produtor'} 👋</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(app)/profile')}
            accessibilityLabel="Abrir perfil"
          >
            <Text style={[styles.avatarInitial, { color: colors.textOnPrimary }]}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── QUICK ACTIONS ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.actionsRow}>
            <ActionBtn
              icon="leaf"
              label="Fazendas"
              color={colors.primary}
              bg={colors.primaryLight}
              surface={colors.surface}
              onPress={() => router.push('/(app)/farms')}
            />
            <ActionBtn
              icon="document-text"
              label="Sinistros"
              color={colors.warning}
              bg={colors.warningBg}
              surface={colors.surface}
              onPress={() => router.push('/(app)/claims')}
            />
            <ActionBtn
              icon="card-outline"
              label="Pagamentos"
              color={colors.info}
              bg={colors.infoBg}
              surface={colors.surface}
              onPress={() => router.push('/(app)/payments')}
            />
            <ActionBtn
              icon="chatbubble-ellipses"
              label="Chat IA"
              color={colors.primaryDark}
              bg={colors.primaryLight}
              surface={colors.surface}
              onPress={() => router.push('/(app)/chat')}
            />
          </View>
        </View>

        {/* ── STATS ───────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="leaf"
            label="Fazendas"
            value={loading ? '…' : String(farms.length)}
            color={colors.primary}
            styles={styles}
            colors={colors}
          />
          <StatCard
            icon="document-text"
            label="Sinistros"
            value={loading ? '…' : String(claims.length)}
            color={colors.info}
            styles={styles}
            colors={colors}
          />
          <StatCard
            icon="time"
            label="Em aberto"
            value={loading ? '…' : String(openClaims)}
            color={colors.warning}
            styles={styles}
            colors={colors}
          />
        </View>

        {/* ── FAZENDAS ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Minhas Fazendas</Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/farms')}
              accessibilityLabel="Ver todas as fazendas"
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : farms.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="leaf-outline" size={32} color={colors.textLight} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhuma fazenda cadastrada
              </Text>
              <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                Cadastre sua primeira fazenda para começar o monitoramento.
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => router.push('/(app)/farms')}
                accessibilityLabel="Ir para fazendas"
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.emptyBtnText, { color: colors.primary }]}>
                  Cadastrar fazenda
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            farms.slice(0, 3).map((farm) => (
              <TouchableOpacity
                key={farm.id}
                style={[styles.listCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/(app)/farms/${farm.id}`)}
                accessibilityLabel={`Fazenda ${farm.name}`}
              >
                <View style={[styles.listCardIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="leaf" size={18} color={colors.primary} />
                </View>
                <View style={styles.listCardBody}>
                  <Text style={[styles.listCardTitle, { color: colors.text }]}>{farm.name}</Text>
                  <Text style={[styles.listCardSub, { color: colors.textMuted }]}>
                    {farm.totalAreaHectares} ha · {farm.state}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── SINISTROS ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Sinistros Recentes</Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/claims')}
              accessibilityLabel="Ver todos os sinistros"
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : claims.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={32} color={colors.textLight} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhum sinistro registrado
              </Text>
              <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                Abra um sinistro quando ocorrer perda na lavoura.
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.warningBg }]}
                onPress={() => router.push('/(app)/claims')}
                accessibilityLabel="Ir para sinistros"
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.warning} />
                <Text style={[styles.emptyBtnText, { color: colors.warning }]}>
                  Abrir sinistro
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            claims.slice(0, 3).map((claim) => {
              const color = CLAIM_SITUATION_COLOR[claim.claimSituationId] ?? colors.textMuted;
              const label = CLAIM_SITUATION[claim.claimSituationId] ?? '—';
              return (
                <TouchableOpacity
                  key={claim.id}
                  style={[styles.listCard, { backgroundColor: colors.surface }]}
                  onPress={() => router.push(`/(app)/claims/${claim.id}`)}
                  accessibilityLabel={`Sinistro ${claim.claimNumber}`}
                >
                  <View style={[styles.statusAccent, { backgroundColor: color }]} />
                  <View style={styles.listCardBody}>
                    <Text style={[styles.listCardTitle, { color: colors.text }]}>
                      {claim.claimNumber}
                    </Text>
                    <Text style={[styles.listCardSub, { color: colors.textMuted }]}>
                      {CLAIM_CATEGORY[claim.categoryId] ?? '—'}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                    <Text style={[styles.badgeText, { color }]}>{label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── RECURSOS DO APP ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recursos do Zenith</Text>
          <FeatureCard
            icon="earth-outline"
            title="Monitoramento Satelital"
            description="Índice NDVI das suas lavouras em tempo real, com análise de imagens de satélite."
            colors={colors}
            styles={styles}
          />
          <FeatureCard
            icon="shield-checkmark-outline"
            title="Seguro Rural Inteligente"
            description="Abertura e acompanhamento de sinistros com laudo gerado por inteligência artificial."
            colors={colors}
            styles={styles}
          />
          <FeatureCard
            icon="chatbubble-ellipses-outline"
            title="Assistente IA"
            description="Chat especializado em agronegócio, coberturas de seguro e análises da lavoura."
            colors={colors}
            styles={styles}
          />
        </View>
      </ScrollView>
    </>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ActionBtn({
  icon,
  label,
  color,
  bg,
  surface,
  onPress,
}: {
  icon: IoniconsName;
  label: string;
  color: string;
  bg: string;
  surface: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[actionBtnStyles.container, { backgroundColor: surface }]}
      onPress={onPress}
      accessibilityLabel={label}
    >
      <View style={[actionBtnStyles.icon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[actionBtnStyles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const actionBtnStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    ...shadow.sm,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11, fontFamily: fonts.bold, textAlign: 'center' },
});

function StatCard({
  icon,
  label,
  value,
  color,
  styles,
  colors,
}: {
  icon: IoniconsName;
  label: string;
  value: string;
  color: string;
  styles: Styles;
  colors: Colors;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  colors,
  styles,
}: {
  icon: IoniconsName;
  title: string;
  description: string;
  colors: Colors;
  styles: Styles;
}) {
  return (
    <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textMuted }]}>{description}</Text>
      </View>
    </View>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────

function makeStyles(c: Colors) {
  return StyleSheet.create({
    content: { paddingBottom: spacing.xxl },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    headerText: { flex: 1 },
    greeting: { ...typography.heading, color: c.text },
    date: {
      ...typography.caption,
      color: c.textMuted,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: { fontSize: 18, fontFamily: fonts.extraBold },

    section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sectionTitle: { ...typography.title, color: c.text, marginBottom: spacing.sm },
    seeAll: { ...typography.label, fontFamily: fonts.bold },

    actionsRow: { flexDirection: 'row', gap: spacing.sm },

    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.xs,
      ...shadow.sm,
    },
    statValue: { fontSize: 24, fontFamily: fonts.extraBold, letterSpacing: -0.5 },
    statLabel: { ...typography.micro, textAlign: 'center' },

    loader: { marginVertical: spacing.lg },

    emptyCard: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
    },
    emptyTitle: { ...typography.bodyBold, textAlign: 'center' },
    emptyBody: { ...typography.caption, textAlign: 'center', lineHeight: 18 },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      marginTop: spacing.xs,
    },
    emptyBtnText: { fontFamily: fonts.bold, fontSize: 14 },

    listCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.sm,
      ...shadow.sm,
    },
    listCardIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listCardBody: { flex: 1 },
    listCardTitle: { ...typography.bodyBold, marginBottom: 2 },
    listCardSub: { ...typography.caption },
    statusAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeText: { ...typography.micro },

    featureCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.md,
      marginBottom: spacing.sm,
      ...shadow.sm,
    },
    featureIcon: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureTitle: { ...typography.bodyBold, marginBottom: 4 },
    featureDesc: { ...typography.caption, lineHeight: 18 },
  });
}
