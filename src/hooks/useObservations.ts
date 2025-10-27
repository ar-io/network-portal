import { AoEpochData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useObservations = (epoch?: AoEpochData) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['observations', arIOReadSDK, epoch?.epochIndex || -1],
    queryFn: () => {
      if (arIOReadSDK && epoch) {
        return arIOReadSDK.getObservations(epoch);
      }
      throw new Error('arIOReadSDK or currentEpoch not available');
    },
    enabled: !!arIOReadSDK && !!epoch,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return queryResults;
};

export default useObservations;
