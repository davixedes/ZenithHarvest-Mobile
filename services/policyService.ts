import api from './api';
import { extractCollection, extractEntity } from '@/utils/hateoas';

export interface Policy {
  id: string;
  code: number;
  policyNumber: string;
  plotId: string;
  insurerId: string;
  insuranceId: string;
  policySituationId: number;
  insuredAmount: number;
  totalPremium: number;
  startDate: string;
  endDate: string;
}

/** IDs do seed: 1=Ativa, 2=Suspensa, 3=Cancelada, 4=Expirada */
export const POLICY_SITUATION: Record<number, string> = {
  1: 'Ativa',
  2: 'Suspensa',
  3: 'Cancelada',
  4: 'Expirada',
};

export const policyService = {
  async list(): Promise<Policy[]> {
    const { data } = await api.get('/api/policies');
    return extractCollection<Policy>(data);
  },

  async getById(id: string): Promise<Policy> {
    const { data } = await api.get(`/api/policies/${id}`);
    return extractEntity<Policy>(data);
  },
};
