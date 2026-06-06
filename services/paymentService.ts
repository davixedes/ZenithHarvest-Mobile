import api from './api';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  claimId: string;
  amount: number;
  status: PaymentStatus;
  pixKey?: string;
  paidAt?: string;
  createdAt: string;
}

export const paymentService = {
  async list(): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>('/api/payments');
    return data;
  },
};
