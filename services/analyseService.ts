import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const analyseService = {
  async chat(mensagem: string): Promise<string> {
    const { data } = await api.post('/api/chatbot', { mensagem });
    return data.resposta as string;
  },
};
