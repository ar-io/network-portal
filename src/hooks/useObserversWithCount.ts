import { log } from '@src/constants';
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
  const rpc = useGlobalState((state) => state.rpc);
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const garProgram = (arIOReadSDK as any)?.garProgram as string | undefined;
  const { data: epochs } = useEpochsWithCount(epochCount);

  const res = useQuery<Array<ObserverHistoricalStats>>({
    queryKey: [
      'observersWithCount',
      epochs?.length,
      epochs?.[0]?.epochIndex,
      epochCount,
      garProgram,
    ],
    queryFn: async () => {
      if (!rpc || !garProgram || !epochs) {
        throw new Error('rpc, garProgram, or epochs not available');
      }

      const available = epochs
        .filter((epoch) => epoch !== undefined)
        .sort((a, b) => a!.epochIndex - b!.epochIndex);

      // An epoch fetched through the SDK fallback carries no counter. Charting
      // it as 0 would be indistinguishable from "nobody observed" — the exact
      // failure this hook was changed to stop — so omit it rather than guess.
      const withCounters = available.filter(
        (epoch) => typeof epoch!.observationsSubmitted === 'number',
      );
      if (withCounters.length !== available.length) {
        log.warn(
          `[useObserversWithCount] omitting ${available.length - withCounters.length} epoch(s) with no observationsSubmitted counter rather than rendering them as 0`,
        );
      }

      // Read the durable counter off the Epoch account rather than counting
      // Observation PDAs — those are closed for rent once an epoch
      // distributes, so counting them yields 0 for every past epoch.
      const results = withCounters.map((epoch) => {
        const prescribedObservers = epoch!.prescribedObservers.length;
        const reportsCount = epoch!.observationsSubmitted as number;
        const performancePercentage =
          prescribedObservers > 0
            ? (reportsCount / prescribedObservers) * 100
            : 0;

        return {
          epochIndex: epoch!.epochIndex,
          reportsCount,
          performancePercentage,
          prescribedObservers,
        };
      });

      log.info(
        `[useObserversWithCount] ${results.length} epochs, reports: ${results.map((r) => `${r.epochIndex}:${r.reportsCount}`).join(', ')}`,
      );

      return results;
    },
    enabled: !!rpc && !!garProgram && !!epochs,
    staleTime: 5 * 60 * 1000,
  });
  return res;
};
export default useObserversWithCount;
