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
  // claimNumber é gerado pelo backend (core-svc) — o app não envia mais.
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

/** IDs do seed (ClaimSituation): 1=Aberto, 2=Em análise, 3=Aprovado, 4=Rejeitado, 5=Pago */
export const CLAIM_SITUATION: Record<number, string> = {
  1: 'Aberto',
  2: 'Em análise',
  3: 'Aprovado',
  4: 'Rejeitado',
  5: 'Pago',
};

export const CLAIM_SITUATION_COLOR: Record<number, string> = {
  1: '#EF6800',
  2: '#0063F7',
  3: '#00B131',
  4: '#FF5449',
  5: '#006E1B',
};

/** IDs do seed: 1=Climático, 2=Biológico, 3=Operacional */
export const CLAIM_CATEGORY: Record<number, string> = {
  1: 'Climático',
  2: 'Biológico',
  3: 'Operacional',
};

/** IDs do seed: 1=Estiagem prolongada, 2=Geada de radiação, 3=Tempestade de granizo,
 *  4=Alagamento, 5=Infestação de pragas, 6=Queimada */
export const CLAIM_SUBCATEGORY: Record<number, string> = {
  1: 'Estiagem prolongada',
  2: 'Geada de radiação',
  3: 'Tempestade de granizo',
  4: 'Alagamento',
  5: 'Infestação de pragas',
  6: 'Queimada',
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
