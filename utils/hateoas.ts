/** Extrai os dados de um EntityModel HATEOAS (remove o campo _links). */
export function extractEntity<T>(response: any): T {
  const { _links, ...data } = response;
  return data as T;
}

/**
 * Extrai a lista de um CollectionModel HATEOAS.
 * Spring embute os itens em `_embedded.<typename>List`.
 */
export function extractCollection<T>(response: any): T[] {
  if (!response?._embedded) return [];
  const key = Object.keys(response._embedded)[0];
  const items: any[] = response._embedded[key] ?? [];
  return items.map((item) => extractEntity<T>(item));
}
