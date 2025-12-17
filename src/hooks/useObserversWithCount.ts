import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import useEpochsWithCount from './useEpochsWithCount';

export type ObserverHistoricalStats = {
  epochIndex: number;
  reportsCount: number;
  performancePercentage: number;
  prescribedObservers: number;
};

const useObserversWithCount = (epochCount: number) => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const { data: epochs } = useEpochsWithCount(epochCount);

  const res = useQuery<Array<ObserverHistoricalStats>>({
    queryKey: [
      'observersWithCount',
      epochs?.length,
      epochs?.[0]?.epochIndex,
      epochCount,
    ],
    queryFn: () => {
      if (!arioReadSDK || !epochs) {
        throw new Error('arIOReadSDK not initialized or epochs not available');
      }

      const epochsWithObservations = epochs
        .filter((epoch) => epoch && epoch.observations)
        .sort((a, b) => a!.epochIndex - b!.epochIndex);

      return epochsWithObservations.map((epoch) => {
        if (!epoch || !epoch.observations)
          throw new Error('Epoch or observations not available');

        const reportsCount = Object.keys(epoch.observations.reports).length;
        const prescribedObservers = epoch.prescribedObservers.length;
        const performancePercentage =
          prescribedObservers > 0
            ? (reportsCount / prescribedObservers) * 100
            : 0;

        return {
          epochIndex: epoch.epochIndex,
          reportsCount,
          performancePercentage,
          prescribedObservers,
        };
      });
    },
    enabled: !!arioReadSDK && !!epochs,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  return res;
};
export default useObserversWithCount;
