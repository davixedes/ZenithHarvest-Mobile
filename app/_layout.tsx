import 'react-native-gesture-handler';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost, ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/store/authContext';
import { ThemeProvider, useThemeContext } from '@/store/themeContext';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isDark } = useThemeContext();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      <ToastHost />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [initialTheme, setInitialTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('app_theme_preference').then((saved) => {
      setInitialTheme(saved === 'light' ? 'light' : 'dark');
    }).catch(() => setInitialTheme('dark'));
  }, []);

  const ready = (fontsLoaded || !!fontError) && initialTheme !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, height: Platform.OS === 'web' ? '100%' : undefined }}>
      <SafeAreaProvider>
        <ThemeProvider initialMode={initialTheme}>
          <AuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
