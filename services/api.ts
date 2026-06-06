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
    return Promise.reject(err);
  },
);

export default api;
