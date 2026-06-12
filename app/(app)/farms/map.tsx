import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { LoadingState } from '@/components/LoadingState';
import { fonts, radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Farm, farmService } from '@/services/farmService';

// ── Sentinel Hub ─────────────────────────────────────────────────────────────
const INSTANCE_ID = process.env.EXPO_PUBLIC_SENTINEL_INSTANCE_ID ?? '';

function sentinelTileUrl(layer: string) {
  if (!INSTANCE_ID) return null;
  return (
    `https://services.sentinel-hub.com/ogc/wmts/${INSTANCE_ID}` +
    `?service=WMTS&request=GetTile&version=1.0.0` +
    `&TileMatrixSet=PopularWebMercator256&layer=${layer}` +
    `&TileMatrix={z}&TileRow={y}&TileCol={x}&format=image%2Fpng`
  );
}

type LayerKey = 'none' | 'NDVI' | 'TRUE-COLOR';

const LAYERS: { key: LayerKey; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'none',       label: 'Padrão',    icon: 'map-outline' },
  { key: 'TRUE-COLOR', label: 'Satélite',  icon: 'earth-outline' },
  { key: 'NDVI',       label: 'NDVI',      icon: 'leaf-outline' },
];

// ── Region helpers ────────────────────────────────────────────────────────────
function regionFromFarms(farms: Farm[]) {
  const valid = farms.filter((f) => f.latitude && f.longitude);
  if (!valid.length) return null;

  const lats = valid.map((f) => f.latitude);
  const lngs = valid.map((f) => f.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.5);
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.5);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

// ── Web fallback ──────────────────────────────────────────────────────────────
function WebFallback() {
  const colors = useColors();
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mapa de Fazendas',
          headerShown: true,
          headerLeft: () => <HeaderBackButton fallback="/(app)/farms" />,
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Ionicons name="map-outline" size={64} color={colors.textLight} />
        <Text style={{ ...typography.title, color: colors.text, marginTop: spacing.md, textAlign: 'center' }}>
          Mapa disponível no app nativo
        </Text>
        <Text style={{ ...typography.body, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }}>
          Abra o Zenith Harvest no iOS ou Android para visualizar o mapa interativo com overlay de satélite.
        </Text>
      </View>
    </>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function FarmsMapScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [layer, setLayer] = useState<LayerKey>('none');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const mapRef = useRef<any>(null);

  const load = useCallback(async () => {
    try {
      setError('');
      setFarms(await farmService.list());
    } catch {
      setError('Não foi possível carregar as fazendas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (Platform.OS === 'web') return <WebFallback />;

  // Dynamic import only on native to avoid web bundling errors
  const MapView = require('react-native-maps').default;
  const { Marker, Callout, UrlTile } = require('react-native-maps');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const region = regionFromFarms(farms);
  const tileUrl = layer !== 'none' ? sentinelTileUrl(layer) : null;
  const hasSentinel = Boolean(INSTANCE_ID);

  const focusFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    mapRef.current?.animateToRegion({
      latitude: farm.latitude,
      longitude: farm.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }, 600);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mapa de Fazendas',
          headerShown: true,
          headerLeft: () => <HeaderBackButton fallback="/(app)/farms" />,
        }}
      />

      <View style={styles.container}>
        {/* ── MAP ── */}
        {region ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {tileUrl ? (
              <UrlTile
                urlTemplate={tileUrl}
                maximumZ={18}
                flipY={false}
                opacity={0.75}
              />
            ) : null}

            {farms.map((farm) => (
              <Marker
                key={farm.id}
                coordinate={{ latitude: farm.latitude, longitude: farm.longitude }}
                onPress={() => focusFarm(farm)}
              >
                <View style={[
                  styles.pin,
                  { backgroundColor: selectedFarm?.id === farm.id ? colors.primaryDark : colors.primary },
                ]}>
                  <Ionicons name="leaf" size={14} color="#fff" />
                </View>

                <Callout tooltip onPress={() => router.push(`/(app)/farms/${farm.id}`)}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{farm.name}</Text>
                    <Text style={styles.calloutSub}>{farm.totalAreaHectares} ha · {farm.state}</Text>
                    <View style={styles.calloutBtn}>
                      <Text style={styles.calloutBtnText}>Ver detalhe</Text>
                      <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              ionicon="map-outline"
              title="Nenhuma fazenda com localização"
              message="Cadastre uma fazenda com coordenadas para visualizá-la no mapa."
              actionLabel="Cadastrar fazenda"
              onAction={() => router.push('/(app)/farms/new')}
            />
          </View>
        )}

        {/* ── LAYER TOGGLE ── */}
        {region && hasSentinel ? (
          <View style={styles.layerPanel}>
            {LAYERS.map((l) => (
              <TouchableOpacity
                key={l.key}
                style={[styles.layerBtn, layer === l.key && styles.layerBtnActive]}
                onPress={() => setLayer(l.key)}
                accessibilityLabel={`Camada ${l.label}`}
              >
                <Ionicons
                  name={l.icon}
                  size={16}
                  color={layer === l.key ? colors.textOnPrimary : colors.text}
                />
                <Text style={[styles.layerLabel, layer === l.key && styles.layerLabelActive]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* ── NO SENTINEL WARNING ── */}
        {region && !hasSentinel ? (
          <View style={styles.sentinelBadge}>
            <Ionicons name="earth-outline" size={13} color={colors.textMuted} />
            <Text style={styles.sentinelBadgeText}>
              Configure EXPO_PUBLIC_SENTINEL_INSTANCE_ID para overlay NDVI
            </Text>
          </View>
        ) : null}

        {/* ── MY LOCATION BUTTON ── */}
        {region ? (
          <TouchableOpacity
            style={styles.myLocationBtn}
            onPress={() => {
              if (region) {
                mapRef.current?.animateToRegion(region, 600);
              }
            }}
            accessibilityLabel="Centralizar mapa"
          >
            <Ionicons name="locate-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
    emptyContainer: { flex: 1, backgroundColor: c.background },

    pin: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#fff',
      ...shadow.md,
    },

    callout: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      minWidth: 180,
      maxWidth: 240,
      ...shadow.md,
    },
    calloutTitle: { ...typography.bodyBold, color: c.text, marginBottom: 2 },
    calloutSub: { ...typography.caption, color: c.textMuted, marginBottom: spacing.sm },
    calloutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.borderLight,
    },
    calloutBtnText: { fontFamily: fonts.semiBold, fontSize: 13, color: c.primary, flex: 1 },

    layerPanel: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      overflow: 'hidden',
      ...shadow.md,
    },
    layerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    layerBtnActive: { backgroundColor: c.primary },
    layerLabel: { fontFamily: fonts.medium, fontSize: 13, color: c.text },
    layerLabelActive: { color: c.textOnPrimary },

    sentinelBadge: {
      position: 'absolute',
      bottom: spacing.xl,
      left: spacing.md,
      right: spacing.md,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
      ...shadow.sm,
    },
    sentinelBadgeText: {
      fontFamily: fonts.regular,
      fontSize: 11,
      color: c.textMuted,
      flex: 1,
    },

    myLocationBtn: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.md,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.md,
    },
  });
}
