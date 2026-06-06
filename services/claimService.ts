import api from './api';

export type ClaimSituation =
  | 'PENDING'
  | 'UNDER_ANALYSIS'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID';

export interface Claim {
  id: string;
  farmId: string;
  farmName: string;
  plotId: string;
  plotName: string;
  category: string;
  subcategory: string;
  description: string;
  situation: ClaimSituation;
  ndviBefore?: number;
  ndviAfter?: number;
  lossPercentage?: number;
  approvedAmount?: number;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimPayload {
  plotId: string;
  category: string;
  subcategory: string;
  description: string;
  photoBase64?: string;
  latitude?: number;
  longitude?: number;
}

export const claimService = {
  async list(): Promise<Claim[]> {
    const { data } = await api.get<Claim[]>('/api/claims');
    return data;
  },

  async getById(id: string): Promise<Claim> {
    const { data } = await api.get<Claim>(`/api/claims/${id}`);
    return data;
  },

  async create(payload: ClaimPayload): Promise<Claim> {
    const { data } = await api.post<Claim>('/api/claims', payload);
    return data;
  },
};
