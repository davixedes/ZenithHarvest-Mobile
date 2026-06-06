import api from './api';
import { extractCollection } from '@/utils/hateoas';

export interface Crop {
  id: string;
  code: number;
  name: string;
  scientificName?: string;
  averageCycleDays?: number;
  expectedNdviMin?: number;
  expectedNdviMax?: number;
  averageValuePerHectare?: number;
  droughtVulnerability?: number;
  frostVulnerability?: number;
}

export const cropService = {
  async list(): Promise<Crop[]> {
    const { data } = await api.get('/api/crops');
    return extractCollection<Crop>(data);
  },
};
