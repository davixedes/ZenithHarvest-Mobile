import api from './api';
import { extractEntity } from '@/utils/hateoas';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  cpf: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

/** Resposta de POST /auth/login */
export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: string;
  email: string;
}

/** Resposta de POST /auth/register e GET /api/users/me */
export interface UserResponse {
  id: string;
  code: number;
  cpf: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>('/auth/register', payload);
    return data;
  },

  async getMe(): Promise<UserResponse> {
    const { data } = await api.get('/api/users/me');
    return extractEntity<UserResponse>(data);
  },
};
