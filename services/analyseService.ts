import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

/** Resposta de GET /api/ndvi/{plotId}/analises — análise Postgres gerada pela IA após sinistro */
export interface SatelliteAnalysis {
  id: string;
  claimId: string | null;
  plotId: string;
  satelliteSourceId: number;
  satelliteClassId: number | null;
  imageDate: string;
  meanNdvi: number | null;
  meanEvi: number | null;
  cloudCoveragePct: number | null;
  affectedAreaM2: number | null;
  mlConfidence: number | null;
  processedAt: string | null;
  createdAt: string;
}

export const analyseService = {
  async chat(mensagem: string): Promise<string> {
    const { data } = await api.post('/api/chatbot', { mensagem });
    return data.resposta as string;
  },

  async getNdviAnalises(plotId: string): Promise<SatelliteAnalysis[]> {
    const { data } = await api.get<SatelliteAnalysis[]>(`/api/ndvi/${plotId}/analises`);
    return Array.isArray(data) ? data : [];
  },
};
