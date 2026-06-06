import axios from 'axios';

import { API_BASE_URL } from '@/constants/api';
import { storage } from '@/utils/storage';

export const TOKEN_KEY = 'zenith_jwt';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await storage.deleteItem(TOKEN_KEY);
    }

    // Facilita diagnóstico de CORS/rede no Expo Web (browser bloqueia antes de chegar resposta HTTP).
    if (!err.response && err.message === 'Network Error') {
      err.message =
        'Network Error — verifique se o gateway (:8080) está rodando e se EXPO_PUBLIC_API_URL está correto. ' +
        'No celular físico use o IP da máquina, não localhost. Em Expo Web, reinicie o gateway após mudanças de CORS.';
    }

    return Promise.reject(err);
  },
);

export default api;
