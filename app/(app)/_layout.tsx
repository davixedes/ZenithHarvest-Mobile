import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';

import { LoadingState } from '@/components/LoadingState';
import { colors, shadow } from '@/constants/theme';
import { useAuthContext } from '@/store/authContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  focused,
}: {
  name: { active: IoniconsName; inactive: IoniconsName };
  focused: boolean;
}) {
  return (
    <Ionicons
      name={focused ? name.active : name.inactive}
      size={22}
      color={focused ? colors.primary : colors.textLight}
    />
  );
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingTop: 6,
          ...shadow.sm,
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      {/* ── Tabs visíveis ─────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={{ active: 'home', inactive: 'home-outline' }} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'Fazendas',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={{ active: 'leaf', inactive: 'leaf-outline' }} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: 'Sinistros',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={{ active: 'document-text', inactive: 'document-text-outline' }}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Pagamentos',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={{ active: 'card', inactive: 'card-outline' }} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={{ active: 'person-circle', inactive: 'person-circle-outline' }}
              focused={focused}
            />
          ),
        }}
      />

      {/* ── Rotas internas — ocultadas do tab bar ─────────────── */}
      <Tabs.Screen name="farms/index"    options={{ href: null }} />
      <Tabs.Screen name="farms/new"      options={{ href: null }} />
      <Tabs.Screen name="farms/[id]"     options={{ href: null }} />
      <Tabs.Screen name="claims/index"   options={{ href: null }} />
      <Tabs.Screen name="claims/new"     options={{ href: null }} />
      <Tabs.Screen name="claims/[id]"    options={{ href: null }} />
    </Tabs>
  );
}
