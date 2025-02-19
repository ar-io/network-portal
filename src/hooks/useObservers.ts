import { AoEpochData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useObservers = (epoch?: AoEpochData) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['prescribedObservers', arIOReadSDK, epoch?.epochIndex],
    queryFn: () => {
      if (arIOReadSDK && epoch) {
        return arIOReadSDK.getPrescribedObservers(epoch);
      }
      throw new Error('arIOReadSDK or epoch not available');
    },
    enabled: !!arIOReadSDK && !!epoch?.epochIndex,
  });

  return queryResults;
};

export default useObservers;
