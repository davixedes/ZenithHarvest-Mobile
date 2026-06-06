import api from './api';
import { extractCollection, extractEntity } from '@/utils/hateoas';

export interface Claim {
  id: string;
  code: number;
  claimNumber: string;
  policyId: string;
  claimSituationId: number;
  categoryId: number;
  subCategoryId: number;
  description?: string;
  photoUrl?: string;
  openingGpsLat?: number;
  openingGpsLng?: number;
  ndviBefore?: number;
  ndviAfter?: number;
  totalLossPct?: number;
  totalAffectedAreaHa?: number;
  calculatedAmount?: number;
  approvedAmount?: number;
  mlConfidenceScore?: number;
  fraudFlag?: boolean;
  rejectionReasonId?: number;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  editedAt?: string;
}

export interface CreateClaimRequest {
  claimNumber: string;
  policyId: string;
  claimSituationId: number;
  categoryId: number;
  subCategoryId: number;
  description?: string;
  photoUrl?: string;
  openingGpsLat?: number;
  openingGpsLng?: number;
  ndviBefore?: number;
}

/** IDs do seed: 1=Aberto, 2=Em análise, 3=Aprovado, 4=Reprovado, 5=Pago */
export const CLAIM_SITUATION: Record<number, string> = {
  1: 'Aberto',
  2: 'Em análise',
  3: 'Aprovado',
  4: 'Reprovado',
  5: 'Pago',
};

export const CLAIM_SITUATION_COLOR: Record<number, string> = {
  1: '#EF9F27',
  2: '#3B82F6',
  3: '#1D9E75',
  4: '#D85A30',
  5: '#0F6E56',
};

/** IDs do seed: 1=Geada, 2=Seca, 3=Granizo, 4=Inundação, 5=Praga */
export const CLAIM_CATEGORY: Record<number, string> = {
  1: 'Geada',
  2: 'Seca',
  3: 'Granizo',
  4: 'Inundação',
  5: 'Praga',
};

export const CLAIM_SUBCATEGORY: Record<number, string> = {
  1: 'Geada leve',
  2: 'Geada severa',
  3: 'Seca moderada',
  4: 'Seca extrema',
  5: 'Granizo localizado',
  6: 'Granizo extenso',
  7: 'Alagamento parcial',
  8: 'Alagamento total',
  9: 'Praga foliar',
  10: 'Praga de solo',
};

export const claimService = {
  async list(): Promise<Claim[]> {
    const { data } = await api.get('/api/claims');
    return extractCollection<Claim>(data);
  },

  async getById(id: string): Promise<Claim> {
    const { data } = await api.get(`/api/claims/${id}`);
    return extractEntity<Claim>(data);
  },

  async create(payload: CreateClaimRequest): Promise<Claim> {
    const { data } = await api.post('/api/claims', payload);
    return extractEntity<Claim>(data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/claims/${id}`);
  },
};
