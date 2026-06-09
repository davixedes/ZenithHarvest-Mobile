import api from './api';
import { extractCollection } from '@/utils/hateoas';

/**
 * Item genérico de uma tabela de domínio (GET /api/lookups/*).
 * São read-only e cacheadas no backend. O campo de texto pode vir
 * como `name` ou `description` dependendo do lookup — use lookupLabel().
 */
export interface Lookup {
  id: number;
  code?: number;
  name?: string;
  description?: string;
}

/** Texto exibível de um lookup, tolerante a name/description. */
export function lookupLabel(item: Lookup): string {
  return item.name ?? item.description ?? `#${item.id}`;
}

export const lookupService = {
  async biomes(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/biomes');
    return extractCollection<Lookup>(data);
  },
};
