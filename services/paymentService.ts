import api from './api';
import { extractCollection, extractEntity } from '@/utils/hateoas';

export interface Payment {
  id: string;
  code: number;
  claimId: string;
  paymentSituationId: number;
  amount: number;
  pixKey?: string;
  bankAccount?: string;
  paymentDate?: string;
  createdAt: string;
}

/** IDs do seed: 1=Pendente, 2=Em processamento, 3=Pago, 4=Falhou, 5=Estornado */
export const PAYMENT_SITUATION: Record<number, string> = {
  1: 'Pendente',
  2: 'Em processamento',
  3: 'Pago',
  4: 'Falhou',
  5: 'Estornado',
};

export const PAYMENT_SITUATION_COLOR: Record<number, string> = {
  1: '#EF9F27',
  2: '#3B82F6',
  3: '#1D9E75',
  4: '#D85A30',
  5: '#888780',
};

export const paymentService = {
  async list(): Promise<Payment[]> {
    const { data } = await api.get('/api/payments');
    return extractCollection<Payment>(data);
  },

  async getById(id: string): Promise<Payment> {
    const { data } = await api.get(`/api/payments/${id}`);
    return extractEntity<Payment>(data);
  },
};
