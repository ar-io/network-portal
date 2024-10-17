import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

export type ArNSStats = {
  namesPurchased: number;
  demandFactor: number;
  activeAuctions: number;
};

const useArNSStats = () => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery<ArNSStats>({
    queryKey: ['arNSStats', arioReadSDK],
    queryFn: async () => {
      if (!arioReadSDK) throw new Error('arIOReadSDK not initialized');

      const demandFactor = await arioReadSDK.getDemandFactor();

      const records = await arioReadSDK.getArNSRecords({ limit: 1});

      return {
        demandFactor,
        namesPurchased: records.totalItems,
        activeAuctions: 0,
      };
    },
  });
  return res;
};

export default useArNSStats;
