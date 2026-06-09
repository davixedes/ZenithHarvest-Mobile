import api from './api';

/**
 * Item genérico de lookup. O campo de texto pode vir como `name` ou `description`
 * dependendo do endpoint — use lookupLabel() para exibir.
 */
export interface Lookup {
  id: number;
  description?: string;
  name?: string;
  active?: boolean;
}

/** Bioma com fator de risco regional. */
export interface BiomeLookup extends Lookup {
  regionalRiskFactor?: number;
}

/** Sistema de produção com desconto de prêmio. */
export interface ProductionSystemLookup extends Lookup {
  premiumDiscount?: number;
}

/** Situação com flag de terminal (estado final do ciclo). */
export interface SituationLookup extends Lookup {
  isTerminal?: boolean;
}

/** Situação de sinistro — indica se permite abertura e se é terminal. */
export interface ClaimSituationLookup extends Lookup {
  allowsClaim?: boolean;
  isTerminal?: boolean;
}

/** Tipo de evento causador de sinistro. */
export interface ClaimEventTypeLookup extends Lookup {
  requiresPhoto?: boolean;
}

/** Tipo de pagamento com direção financeira (IN/OUT). */
export interface PaymentTypeLookup extends Lookup {
  direction?: 'IN' | 'OUT';
}

/** Severidade de alerta com nível numérico e cor hex. */
export interface AlertSeverityLookup extends Lookup {
  level?: number;
  colorHex?: string;
  pushNotify?: boolean;
  smsNotify?: boolean;
}

/** Texto exibível de um lookup, tolerante a name/description. */
export function lookupLabel(item: Lookup): string {
  return item.name ?? item.description ?? `#${item.id}`;
}

function raw<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export const lookupService = {
  /** Biomas brasileiros com fator de risco regional.
   *  Seed: 1=Amazônia, 2=Cerrado, 3=Caatinga, 4=Mata Atlântica, 5=Pampa, 6=Pantanal */
  async biomes(): Promise<BiomeLookup[]> {
    const { data } = await api.get('/api/lookups/biomes');
    return raw<BiomeLookup>(data);
  },

  /** Sistemas de produção agrícola.
   *  Seed: 1=Sequeiro, 2=Irrigado, 3=Plantio direto, 4=Plantio convencional */
  async productionSystems(): Promise<ProductionSystemLookup[]> {
    const { data } = await api.get('/api/lookups/production-systems');
    return raw<ProductionSystemLookup>(data);
  },

  /** Situações de talhão no ciclo produtivo.
   *  Seed: 1=Em preparo, 2=Plantado, 3=Em desenvolvimento, 4=Colhido, 5=Perda total */
  async plotSituations(): Promise<SituationLookup[]> {
    const { data } = await api.get('/api/lookups/plot-situations');
    return raw<SituationLookup>(data);
  },

  /** Situações de seguradora. Seed: 1=Ativa, 2=Suspensa, 3=Descredenciada */
  async insurerSituations(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/insurer-situations');
    return raw<Lookup>(data);
  },

  /** Situações de produto de seguro. Seed: 1=Disponível, 2=Pausada, 3=Descontinuada */
  async insuranceSituations(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/insurance-situations');
    return raw<Lookup>(data);
  },

  /** Situações de cotação. Seed: 1=Em aberto, 2=Aceita, 3=Recusada, 4=Expirada */
  async quoteSituations(): Promise<SituationLookup[]> {
    const { data } = await api.get('/api/lookups/quote-situations');
    return raw<SituationLookup>(data);
  },

  /** Situações de apólice. Seed: 1=Vigente, 2=Aguardando pagamento, 3=Cancelada, 4=Expirada */
  async policySituations(): Promise<ClaimSituationLookup[]> {
    const { data } = await api.get('/api/lookups/policy-situations');
    return raw<ClaimSituationLookup>(data);
  },

  /** Situações de sinistro. Seed: 1=Aberto, 2=Em análise, 3=Aprovado, 4=Rejeitado, 5=Pago */
  async claimSituations(): Promise<ClaimSituationLookup[]> {
    const { data } = await api.get('/api/lookups/claim-situations');
    return raw<ClaimSituationLookup>(data);
  },

  /** Tipos de evento causador. Seed: 1=Seca, 2=Geada, 3=Granizo, 4=Excesso de chuva, 5=Praga, 6=Incêndio */
  async claimEventTypes(): Promise<ClaimEventTypeLookup[]> {
    const { data } = await api.get('/api/lookups/claim-event-types');
    return raw<ClaimEventTypeLookup>(data);
  },

  /** Categorias de sinistro. Seed: 1=Climático, 2=Biológico, 3=Operacional */
  async claimCategories(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/claim-categories');
    return raw<Lookup>(data);
  },

  /** Subcategorias de sinistro.
   *  Seed: 1=Estiagem prolongada, 2=Geada de radiação, 3=Tempestade de granizo,
   *        4=Alagamento, 5=Infestação de pragas, 6=Queimada */
  async claimSubCategories(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/claim-subcategories');
    return raw<Lookup>(data);
  },

  /** Motivos de rejeição de sinistro (6 itens no seed). */
  async rejectionReasons(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/rejection-reasons');
    return raw<Lookup>(data);
  },

  /** Fontes de imagem satelital. Seed: 1=Sentinel-2, 2=Landsat-8, 3=MODIS */
  async satelliteSources(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/satellite-sources');
    return raw<Lookup>(data);
  },

  /** Classes de análise satelital por nível de estresse.
   *  Seed: 0=Saudável, 1=Estresse leve, 2=Moderado, 3=Severo, 4=Solo exposto */
  async satelliteClasses(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/satellite-classes');
    return raw<Lookup>(data);
  },

  /** Tipos de alerta preventivo. Seed: 1=Queda de NDVI, 2=Risco de seca, 3=Risco de geada, 4=Anomalia */
  async alertTypes(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/alert-types');
    return raw<Lookup>(data);
  },

  /** Severidades de alerta com cor e flags de notificação.
   *  Seed: 1=Informativo, 2=Atenção, 3=Crítico */
  async alertSeverities(): Promise<AlertSeverityLookup[]> {
    const { data } = await api.get('/api/lookups/alert-severities');
    return raw<AlertSeverityLookup>(data);
  },

  /** Situações de alerta. Seed: 1=Aberto, 2=Visualizado, 3=Resolvido, 4=Descartado */
  async alertSituations(): Promise<SituationLookup[]> {
    const { data } = await api.get('/api/lookups/alert-situations');
    return raw<SituationLookup>(data);
  },

  /** Tipos de pagamento. Seed: 1=Indenização PIX (OUT), 2=Prêmio (IN), 3=Estorno (OUT), 4=Repasse (OUT) */
  async paymentTypes(): Promise<PaymentTypeLookup[]> {
    const { data } = await api.get('/api/lookups/payment-types');
    return raw<PaymentTypeLookup>(data);
  },

  /** Situações de pagamento. Seed: 1=Pendente, 2=Processando, 3=Confirmado, 4=Falhou, 5=Estornado */
  async paymentSituations(): Promise<Lookup[]> {
    const { data } = await api.get('/api/lookups/payment-situations');
    return raw<Lookup>(data);
  },
};
