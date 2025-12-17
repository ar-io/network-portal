import { useGlobalState } from '@src/store';
import { getEpoch } from '@src/store/db';
import { showErrorToast } from '@src/utils/toast';
import { useQuery } from '@tanstack/react-query';

/** Returns last epochCount epochs */
const useEpochsWithCount = (epochCount: number) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const startEpoch = useGlobalState((state) => state.currentEpoch);
  const networkPortalDB = useGlobalState((state) => state.networkPortalDB);

  const queryResults = useQuery({
    queryKey: ['epochs', arIOReadSDK, startEpoch, epochCount],
    queryFn: async () => {
      if (!arIOReadSDK || startEpoch === undefined) {
        throw new Error('arIOReadSDK or startEpoch not available');
      }

      // Fetch the requested number of historical epochs (minus 1 for current epoch)
      const historicalEpochsToFetch = Math.max(0, epochCount - 1);

      const additionalEpochs = await Promise.all(
        Array.from(
          { length: historicalEpochsToFetch },
          (_, index) => startEpoch.epochIndex - index - 1,
        ).map((epochIndex) =>
          getEpoch(networkPortalDB, arIOReadSDK, epochIndex)
            .then((epoch) => {
              return epoch;
            })
            .catch(() => {
              showErrorToast(
                `Unable to retrieve epoch data for epoch ${epochIndex}.`,
              );
              return undefined;
            }),
        ),
      );

      return [
        startEpoch,
        ...additionalEpochs.filter((e: any) => e !== undefined),
      ];
    },
    enabled: !!arIOReadSDK && startEpoch !== undefined,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return queryResults;
};

export default useEpochsWithCount;
