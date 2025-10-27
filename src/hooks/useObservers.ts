import { AoEpochData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useObservers = (epoch?: AoEpochData) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['prescribedObservers', arIOReadSDK, epoch?.epochIndex || -1],
    queryFn: () => {
      if (arIOReadSDK && epoch) {
        return arIOReadSDK.getPrescribedObservers(epoch);
      }
      throw new Error('arIOReadSDK or epoch not available');
    },
    enabled: !!arIOReadSDK && epoch?.epochIndex !== undefined,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return queryResults;
};

export default useObservers;
