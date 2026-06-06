import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'app_theme_preference';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  isDark: boolean;
  mode: ThemeMode;
  toggleTheme: () => void;
}

async function loadSavedTheme(): Promise<ThemeMode | null> {
  try {
    const saved = await SecureStore.getItemAsync(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return null;
}

async function persistTheme(mode: ThemeMode) {
  try {
    await SecureStore.setItemAsync(THEME_KEY, mode);
  } catch {}
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  mode: 'system',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    loadSavedTheme().then((saved) => {
      if (saved) setMode(saved);
    });
  }, []);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      persistTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
