import React, { createContext, useCallback, useContext, useState } from 'react';

import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'app_theme_preference';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  isDark: boolean;
  mode: ThemeMode;
  toggleTheme: () => void;
}

async function persistTheme(mode: ThemeMode) {
  try {
    await SecureStore.setItemAsync(THEME_KEY, mode);
  } catch {}
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  mode: 'dark',
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'dark' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      persistTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: mode === 'dark', mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
