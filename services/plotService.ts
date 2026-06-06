import api from './api';
import { extractCollection, extractEntity } from '@/utils/hateoas';

export interface Plot {
  id: string;
  code: number;
  farmId: string;
  cropId?: string;
  plotSituationId: number;
  identifier: string;
  areaHectares: number;
  plantingDate?: string;
  estimatedHarvestDate?: string;
}

export interface CreatePlotPayload {
  farmId: string;
  identifier: string;
  plotSituationId: number;
  areaHectares?: number;
  cropId?: string;
}

/** IDs do seed: 1=Em preparo, 2=Plantado, 3=Em desenvolvimento, 4=Colhido, 5=Perda total */
export const PLOT_SITUATION: Record<number, string> = {
  1: 'Em preparo',
  2: 'Plantado',
  3: 'Em desenvolvimento',
  4: 'Colhido',
  5: 'Perda total',
};

export const PLOT_SITUATION_COLOR: Record<number, string> = {
  1: '#888780',
  2: '#1D9E75',
  3: '#1D9E75',
  4: '#3B82F6',
  5: '#D85A30',
};

export const plotService = {
  async listByFarm(farmId: string): Promise<Plot[]> {
    const { data } = await api.get(`/api/farms/${farmId}/plots`);
    return extractCollection<Plot>(data);
  },

  async getById(id: string): Promise<Plot> {
    const { data } = await api.get(`/api/plots/${id}`);
    return extractEntity<Plot>(data);
  },

  async create(payload: CreatePlotPayload): Promise<Plot> {
    const { data } = await api.post('/api/plots', payload);
    return extractEntity<Plot>(data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/plots/${id}`);
  },
};
