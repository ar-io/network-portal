import { useGlobalState } from '@src/store';
import { getEpoch } from '@src/store/db';
import { useQuery } from '@tanstack/react-query';

// TODO: this could be a parameter provided by the user now
const HISTORICAL_EPOCHS_TO_FETCH = 13;

/** Returns last EPOCHS_TO_FETCH epochs */
const useEpochs = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const startEpoch = useGlobalState((state) => state.currentEpoch);

  const queryResults = useQuery({
    queryKey: ['epochs', arIOReadSDK, startEpoch],
    queryFn: async () => {
      if (!arIOReadSDK || startEpoch === undefined) {
        throw new Error('arIOReadSDK or startEpoch not available');
      }

      const additionalEpochs = await Promise.all(
        Array.from({ length: HISTORICAL_EPOCHS_TO_FETCH }, (_, index) => startEpoch.epochIndex - index - 1)
          .map(epochIndex => getEpoch(arIOReadSDK, epochIndex))
      );      

      return [startEpoch, ...additionalEpochs.filter((e: any) => e !== undefined)];
    },
  });

  return queryResults;
};

export default useEpochs;
