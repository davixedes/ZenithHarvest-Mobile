import api from './api';

export interface Farm {
  id: string;
  name: string;
  area: number;
  biome: string;
  state: string;
  city: string;
  plots?: Plot[];
}

export interface Plot {
  id: string;
  name: string;
  area: number;
  cropType: string;
  situation: 'NORMAL' | 'ALERT' | 'CRITICAL';
  latitude?: number;
  longitude?: number;
}

export interface FarmPayload {
  name: string;
  area: number;
  biome: string;
  state: string;
  city: string;
}

export const farmService = {
  async list(): Promise<Farm[]> {
    const { data } = await api.get<Farm[]>('/api/farms');
    return data;
  },

  async getById(id: string): Promise<Farm> {
    const { data } = await api.get<Farm>(`/api/farms/${id}`);
    return data;
  },

  async update(id: string, payload: Partial<FarmPayload>): Promise<Farm> {
    const { data } = await api.put<Farm>(`/api/farms/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/farms/${id}`);
  },
};
