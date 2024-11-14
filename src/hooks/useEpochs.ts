import { useGlobalState } from '@src/store';
import { getEpoch } from '@src/store/db';
import { useQuery } from '@tanstack/react-query';

/** Returns last 14 epochs */
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
        Array.from({ length: 13 }, (_, index) => startEpoch.epochIndex - index - 1)
          .map(epochIndex => getEpoch(arIOReadSDK, epochIndex))
      );      

      return [startEpoch, ...additionalEpochs.filter(e => e !== undefined)];
    },
  });

  return queryResults;
};

export default useEpochs;
