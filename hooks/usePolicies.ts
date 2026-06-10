import { useCallback, useEffect, useState } from 'react';

import { farmService } from '@/services/farmService';
import { Plot, plotService } from '@/services/plotService';
import { Policy, policyService } from '@/services/policyService';

/**
 * Apólice enriquecida com a origem (talhão segurado + fazenda).
 * A Policy traz apenas plotId — resolvemos
 * Policy → plotId → Plot → farmId → Farm.
 * Campos de contexto são nullable: a cadeia pode estar incompleta.
 */
export interface PolicyWithContext extends Policy {
  plotIdentifier: string | null;
  farmId: string | null;
  farmName: string | null;
}

export function usePolicies() {
  const [policies, setPolicies] = useState<PolicyWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');

      const [rawPolicies, farms] = await Promise.all([
        policyService.list(),
        farmService.list(),
      ]);

      const farmMap = new Map(farms.map((f) => [f.id, f]));

      // Talhões segurados (sem duplicar requisições).
      const plotIds = [
        ...new Set(
          rawPolicies
            .map((p) => p.plotId)
            .filter((id): id is string => Boolean(id))
        ),
      ];
      const plots = await Promise.all(
        plotIds.map((id) => plotService.getById(id).catch(() => null))
      );
      const plotMap = new Map(
        plots.filter((p): p is Plot => p !== null).map((p) => [p.id, p])
      );

      const enriched: PolicyWithContext[] = rawPolicies.map((p) => {
        const plot = plotMap.get(p.plotId);
        const farm = plot ? farmMap.get(plot.farmId) : undefined;
        return {
          ...p,
          plotIdentifier: plot?.identifier ?? null,
          farmId: farm?.id ?? null,
          farmName: farm?.name ?? null,
        };
      });

      setPolicies(enriched);
    } catch {
      setError('Não foi possível carregar as apólices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { policies, loading, error, refetch: load };
}
