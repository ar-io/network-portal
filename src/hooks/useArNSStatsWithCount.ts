import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import useEpochsWithCount from './useEpochsWithCount';

export type ArNSHistoricalStats = {
  epochIndex: number;
  totalActiveNames: number;
  totalReturnedNames: number;
  totalGracePeriodNames: number;
  totalReservedNames: number;
};

const useArNSStatsWithCount = (epochCount: number) => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const { data: epochs } = useEpochsWithCount(epochCount);

  const res = useQuery<Array<ArNSHistoricalStats>>({
    queryKey: ['arNSStatsWithCount', epochs, arioReadSDK, epochCount],
    queryFn: () => {
      if (!arioReadSDK || !epochs) {
        throw new Error('arIOReadSDK not initialized or epochs not available');
      }

      const epochsWithArnsStats = epochs
        .filter((epoch) => epoch && epoch.arnsStats)
        .sort((a, b) => a!.epochIndex - b!.epochIndex);

      return epochsWithArnsStats.map((epoch) => {
        if (!epoch || !epoch.arnsStats)
          throw new Error('Epoch or ArNS stats not available');
        return {
          epochIndex: epoch.epochIndex,
          totalActiveNames: epoch.arnsStats.totalActiveNames,
          totalReturnedNames: epoch.arnsStats.totalReturnedNames,
          totalGracePeriodNames: epoch.arnsStats.totalGracePeriodNames,
          totalReservedNames: epoch.arnsStats.totalReservedNames,
        };
      });
    },
    enabled: !!arioReadSDK && !!epochs,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  return res;
};
export default useArNSStatsWithCount;
