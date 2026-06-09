/** Remove tudo que não seja dígito */
export function digits(v: string): string {
  return v.replace(/\D/g, '');
}

/**
 * CPF — exibição: 000.000.000-00
 * Enviar para API: digits(cpf) → "00000000000"
 */
export function cpfMask(v: string): string {
  const d = digits(v).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Telefone — exibição: (11) 9999-8888 ou (11) 99999-8888
 * Enviar para API: digits(phone) → "11999998888"
 */
export function phoneMask(v: string): string {
  const d = digits(v).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * NIRF — exibição: 00000000-0
 * Enviar para API como está (string)
 */
export function nirfMask(v: string): string {
  const d = digits(v).slice(0, 9);
  if (d.length <= 8) return d;
  return `${d.slice(0, 8)}-${d.slice(8)}`;
}

/**
 * Decimal BR — aceita vírgula como separador decimal para exibição.
 * Converte para float antes de enviar para a API.
 * Ex: "150,75" → 150.75
 */
export function parseDecimalBR(v: string): number {
  return parseFloat(v.replace(',', '.'));
}
