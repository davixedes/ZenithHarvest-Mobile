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

/** IDs do seed (PaymentSituation): 1=Pendente, 2=Processando, 3=Confirmado, 4=Falhou, 5=Estornado */
export const PAYMENT_SITUATION: Record<number, string> = {
  1: 'Pendente',
  2: 'Processando',
  3: 'Confirmado',
  4: 'Falhou',
  5: 'Estornado',
};

export const PAYMENT_SITUATION_COLOR: Record<number, string> = {
  1: '#EF6800',
  2: '#0063F7',
  3: '#00B131',
  4: '#FF5449',
  5: '#8F8F8F',
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
