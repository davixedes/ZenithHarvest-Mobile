import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';

import { LoadingState } from '@/components/LoadingState';
import { useColors } from '@/hooks/useColors';
import { shadow } from '@/constants/theme';
import { useAuthContext } from '@/store/authContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  focused,
}: {
  name: { active: IoniconsName; inactive: IoniconsName };
  focused: boolean;
}) {
  const colors = useColors();
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
  const colors = useColors();

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
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17, color: colors.text },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={{ active: 'home', inactive: 'home-outline' }} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'Fazendas',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={{ active: 'leaf', inactive: 'leaf-outline' }} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: 'Sinistros',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={{ active: 'document-text', inactive: 'document-text-outline' }}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat IA',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={{ active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' }}
              focused={focused}
            />
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
      {/* Screens acessíveis via Perfil — não aparecem como tabs */}
      <Tabs.Screen name="payments" options={{ href: null }} />
      <Tabs.Screen name="policies" options={{ href: null }} />
    </Tabs>
  );
}
