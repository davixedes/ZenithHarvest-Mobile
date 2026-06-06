import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { TOKEN_KEY } from '@/services/api';
import { AuthResponse, authService, LoginPayload, RegisterPayload } from '@/services/authService';
import { storage } from '@/utils/storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        const userJson = await storage.getItem('zenith_user');
        if (token && userJson) {
          setState({ user: JSON.parse(userJson), token, isLoading: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const persist = useCallback(async (res: AuthResponse) => {
    await storage.setItem(TOKEN_KEY, res.token);
    await storage.setItem('zenith_user', JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isLoading: false });
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await authService.login(payload);
      await persist(res);
    },
    [persist],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await authService.register(payload);
      await persist(res);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem('zenith_user');
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, isAuthenticated: !!state.token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
