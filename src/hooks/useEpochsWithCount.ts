import { log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { getEpoch } from '@src/store/db';
import { getErrorMessage } from '@src/utils/getErrorMessage';
import { useQuery } from '@tanstack/react-query';

/** Returns last epochCount epochs */
const useEpochsWithCount = (epochCount: number) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const startEpoch = useGlobalState((state) => state.currentEpoch);
  const networkPortalDB = useGlobalState((state) => state.networkPortalDB);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const queryResults = useQuery({
    queryKey: ['epochs', solanaRpcUrl, startEpoch?.epochIndex, epochCount],
    queryFn: async () => {
      if (!arIOReadSDK || startEpoch === undefined) {
        throw new Error('arIOReadSDK or startEpoch not available');
      }

      // Fetch the requested number of historical epochs (minus 1 for current epoch)
      const historicalEpochsToFetch = Math.max(0, epochCount - 1);
      const historicalEpochIndexes = Array.from(
        { length: historicalEpochsToFetch },
        (_, index) => startEpoch.epochIndex - index - 1,
      ).filter((epochIndex) => epochIndex >= 0);

      log.info(
        `[useEpochsWithCount] Fetching ${historicalEpochIndexes.length} historical epochs for epochCount=${epochCount} before current epoch ${startEpoch.epochIndex}.`,
      );

      const additionalEpochs = await Promise.all(
        historicalEpochIndexes.map((epochIndex) =>
          getEpoch(networkPortalDB, arIOReadSDK, epochIndex)
            .then((epoch) => {
              return epoch;
            })
            .catch((error) => {
              const message = getErrorMessage(error);
              log.error(
                `[useEpochsWithCount] Unexpected error while retrieving epoch ${epochIndex}: ${message}`,
                error,
              );
              return undefined;
            }),
        ),
      );

      const availableEpochs = additionalEpochs.filter((e) => e !== undefined);
      if (availableEpochs.length !== additionalEpochs.length) {
        const missingCount = additionalEpochs.length - availableEpochs.length;
        log.info(
          `[useEpochsWithCount] Missing ${missingCount} historical epoch(s); this can happen when older epochs are not yet available on the current backend.`,
        );
      }

      return [startEpoch, ...availableEpochs];
    },
    enabled: !!arIOReadSDK && startEpoch !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return queryResults;
};

export default useEpochsWithCount;
