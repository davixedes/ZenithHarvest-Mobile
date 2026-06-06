import api from './api';
import { extractCollection, extractEntity } from '@/utils/hateoas';

export interface Farm {
  id: string;
  code: number;
  userId: string;
  name: string;
  carRegistration: string;
  nirf: string;
  latitude: number;
  longitude: number;
  totalAreaHectares: number;
  state: string;
  biomeId?: number;
  propertyType?: string;
  active: boolean;
  createdAt: string;
}

export interface CreateFarmPayload {
  userId: string;
  name: string;
  carRegistration: string;
  nirf: string;
  latitude: number;
  longitude: number;
  totalAreaHectares: number;
  state: string;
  biomeId?: number;
  propertyType?: string;
}

export interface UpdateFarmPayload {
  name: string;
  carRegistration: string;
  nirf: string;
  latitude: number;
  longitude: number;
  totalAreaHectares: number;
  state: string;
  biomeId?: number;
}

export const farmService = {
  async list(): Promise<Farm[]> {
    const { data } = await api.get('/api/farms');
    return extractCollection<Farm>(data);
  },

  async getById(id: string): Promise<Farm> {
    const { data } = await api.get(`/api/farms/${id}`);
    return extractEntity<Farm>(data);
  },

  async create(payload: CreateFarmPayload): Promise<Farm> {
    const { data } = await api.post('/api/farms', payload);
    return extractEntity<Farm>(data);
  },

  async update(id: string, payload: UpdateFarmPayload): Promise<Farm> {
    const { data } = await api.put(`/api/farms/${id}`, payload);
    return extractEntity<Farm>(data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/farms/${id}`);
  },
};
