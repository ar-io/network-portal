import { usePortalProgramIds } from '@src/hooks/usePortalProgramIds';
import { useGlobalState } from '@src/store';
import {
  fetchPortalSummary,
  networkTierFromRpcUrl,
} from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

export type ArNSStats = {
  namesPurchased: number;
  demandFactor: number;
};

const useArNSStats = () => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const portalProgramIds = usePortalProgramIds();
  const res = useQuery<ArNSStats>({
    queryKey: ['arNSStats', solanaRpcUrl],
    queryFn: async () => {
      // `getArNSRecords({ limit: 1 })` reads as a cheap count and is not: the
      // SDK scans the whole ArNS program and deserializes every record before
      // `paginate()` truncates in memory, so rendering one number cost a full
      // registry sweep in every visitor's browser. The publisher already pays
      // that scan once per cycle and publishes the count.
      const snapshot = await fetchPortalSummary(
        networkTierFromRpcUrl(solanaRpcUrl),
        portalProgramIds,
      );

      const snapshotCount = snapshot?.counts?.arnsRecords;
      const snapshotDemandFactor = snapshot?.demandFactor;

      if (
        typeof snapshotCount === 'number' &&
        typeof snapshotDemandFactor === 'number'
      ) {
        return {
          demandFactor: snapshotDemandFactor,
          namesPurchased: snapshotCount,
        };
      }

      // Only the fallback needs the chain, and only when the snapshot is off
      // or unusable.
      if (!arioReadSDK) throw new Error('arIOReadSDK not initialized');

      const demandFactor = await arioReadSDK.getDemandFactor();
      const records = await arioReadSDK.getArNSRecords({ limit: 1 });

      return { demandFactor, namesPurchased: records.totalItems };
    },
    staleTime: Infinity,
  });
  return res;
};

export default useArNSStats;
