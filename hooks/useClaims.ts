import { useCallback, useEffect, useState } from 'react';

import { Claim, claimService } from '@/services/claimService';
import { farmService } from '@/services/farmService';
import { Plot, plotService } from '@/services/plotService';
import { policyService } from '@/services/policyService';

/**
 * Sinistro enriquecido com a origem (talhão pai + fazenda).
 * O backend não traz plotId/farmId no Claim — resolvemos via
 * Claim → policyId → Policy → plotId → Plot → farmId → Farm.
 * Campos de contexto são nullable: a cadeia pode falhar/estar incompleta.
 */
export interface ClaimWithContext extends Claim {
  plotIdentifier: string | null;
  farmId: string | null;
  farmName: string | null;
}

export function useClaims() {
  const [claims, setClaims] = useState<ClaimWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');

      const [rawClaims, policies, farms] = await Promise.all([
        claimService.list(),
        policyService.list(),
        farmService.list(),
      ]);

      const policyMap = new Map(policies.map((p) => [p.id, p]));
      const farmMap = new Map(farms.map((f) => [f.id, f]));

      // Talhões referenciados pelas apólices dos sinistros (sem duplicar requisições).
      const plotIds = [
        ...new Set(
          rawClaims
            .map((c) => policyMap.get(c.policyId)?.plotId)
            .filter((id): id is string => Boolean(id))
        ),
      ];
      const plots = await Promise.all(
        plotIds.map((id) => plotService.getById(id).catch(() => null))
      );
      const plotMap = new Map(
        plots.filter((p): p is Plot => p !== null).map((p) => [p.id, p])
      );

      const enriched: ClaimWithContext[] = rawClaims.map((c) => {
        const policy = policyMap.get(c.policyId);
        const plot = policy ? plotMap.get(policy.plotId) : undefined;
        const farm = plot ? farmMap.get(plot.farmId) : undefined;
        return {
          ...c,
          plotIdentifier: plot?.identifier ?? null,
          farmId: farm?.id ?? null,
          farmName: farm?.name ?? null,
        };
      });

      // Mais recentes primeiro (data + hora de abertura).
      enriched.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setClaims(enriched);
    } catch {
      setError('Não foi possível carregar os sinistros.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { claims, loading, error, refetch: load };
}
