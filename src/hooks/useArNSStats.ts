import { useGlobalState } from '@src/store';
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

  const res = useQuery<ArNSStats>({
    queryKey: ['arNSStats', arioReadSDK, currentEpoch],
    queryFn: async () => {
      if (!arioReadSDK) throw new Error('arIOReadSDK not initialized');
      if (!currentEpoch) throw new Error('currentEpoch not initialized');

      const demandFactor = await arioReadSDK.getDemandFactor();

      const records = await arioReadSDK.getArNSRecords({ limit: 1});


      return {
        demandFactor,
        namesPurchased: records.totalItems,
        activeAuctions: 0,
        ...currentEpoch.arnsStats
      };
    },
    enabled: !!arioReadSDK && !!currentEpoch,
    staleTime: Infinity,
  });
  return res;
};

export default useArNSStats;
