import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { TOKEN_KEY } from '@/services/api';
import { authService, LoginPayload, RegisterPayload, UserResponse } from '@/services/authService';
import { storage } from '@/utils/storage';

interface AuthUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
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

  const persistSession = useCallback(async (token: string, userRes: UserResponse) => {
    const user: AuthUser = {
      id: userRes.id,
      name: userRes.name,
      lastName: userRes.lastName,
      email: userRes.email,
    };
    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem('zenith_user', JSON.stringify(user));
    setState({ user, token, isLoading: false });
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const authRes = await authService.login(payload);
      // Persiste o token primeiro para que o interceptor o envie no /me
      await storage.setItem(TOKEN_KEY, authRes.token);
      const userRes = await authService.getMe();
      await persistSession(authRes.token, userRes);
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authService.register(payload);
      // auto-login após cadastro para obter o JWT
      await login({ email: payload.email, password: payload.password });
    },
    [login],
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
