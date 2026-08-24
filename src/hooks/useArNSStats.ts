import { useGlobalState } from '@src/store';
import {
  fetchPortalSummary,
  networkTierFromRpcUrl,
} from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

export type ArNSStats = {
  namesPurchased: number;
  demandFactor: number;
  activeAuctions: number;
  totalReturnedNames: number;
  totalActiveNames: number;
  totalGracePeriodNames: number;
  totalReservedNames: number;
};

const useArNSStats = () => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery<ArNSStats>({
    queryKey: ['arNSStats', solanaRpcUrl, currentEpoch?.epochIndex],
    queryFn: async () => {
      if (!arioReadSDK) throw new Error('arIOReadSDK not initialized');
      if (!currentEpoch) throw new Error('currentEpoch not initialized');

      // `getArNSRecords({ limit: 1 })` reads as a cheap count and is not: the
      // SDK scans the whole ArNS program and deserializes every record before
      // `paginate()` truncates in memory, so rendering one number cost a full
      // registry sweep in every visitor's browser. The publisher already pays
      // that scan once per cycle and publishes the count.
      const snapshot = await fetchPortalSummary(
        networkTierFromRpcUrl(solanaRpcUrl),
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
          activeAuctions: 0,
          ...currentEpoch.arnsStats,
        };
      }

      const demandFactor = await arioReadSDK.getDemandFactor();

      const records = await arioReadSDK.getArNSRecords({ limit: 1 });

      return {
        demandFactor,
        namesPurchased: records.totalItems,
        activeAuctions: 0,
        ...currentEpoch.arnsStats,
      };
    },
    enabled: !!arioReadSDK && !!currentEpoch,
    staleTime: Infinity,
  });
  return res;
};

export default useArNSStats;
