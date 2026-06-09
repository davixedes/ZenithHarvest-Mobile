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
  productionSystemId?: number;
  plantingDate?: string;
  estimatedHarvestDate?: string;
  cycleDays?: number;
  seedVariety?: string;
}

export interface UpdatePlotPayload {
  identifier?: string;
  plotSituationId?: number;
  areaHectares?: number;
  cropId?: string;
  productionSystemId?: number;
  plantingDate?: string;
  estimatedHarvestDate?: string;
  cycleDays?: number;
  seedVariety?: string;
}

export interface NdviHistorico {
  id: string;
  plotId: string;
  claimId: string;
  imageDate: string;
  meanNdvi: number;
  meanEvi?: number;
  satelliteSource?: string;
  cloudCoveragePct?: number;
  createdAt: string;
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
  1: '#8F8F8F',
  2: '#00B131',
  3: '#00B131',
  4: '#0063F7',
  5: '#FF5449',
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

  async update(id: string, payload: UpdatePlotPayload): Promise<Plot> {
    const { data } = await api.put(`/api/plots/${id}`, payload);
    return extractEntity<Plot>(data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/plots/${id}`);
  },

  async getNdviHistorico(plotId: string): Promise<NdviHistorico[]> {
    const { data } = await api.get<NdviHistorico[]>(`/api/plots/${plotId}/ndvi-historico`);
    return Array.isArray(data) ? data : [];
  },
};
