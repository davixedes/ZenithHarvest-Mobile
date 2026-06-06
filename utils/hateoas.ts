/** Extrai os dados de um EntityModel HATEOAS (remove o campo _links). */
export function extractEntity<T>(response: any): T {
  if (!response || typeof response !== 'object') {
    console.warn('[HATEOAS] extractEntity received invalid data:', response);
    return response as T;
  }
  const { _links, ...data } = response;
  return data as T;
}

/**
 * Extrai a lista de um CollectionModel HATEOAS.
 * Spring embute os itens em `_embedded.<typename>List`.
 */
export function extractCollection<T>(response: any): T[] {
  if (!response) {
    console.warn('[HATEOAS] extractCollection received null/undefined');
    return [];
  }
  if (!response._embedded) {
    console.log('[HATEOAS] No _embedded found, checking if response is already an array');
    return Array.isArray(response) ? response : [];
  }
  const keys = Object.keys(response._embedded);
  if (keys.length === 0) return [];
  
  const key = keys[0];
  const items: any[] = response._embedded[key] ?? [];
  return items.map((item) => extractEntity<T>(item));
}
