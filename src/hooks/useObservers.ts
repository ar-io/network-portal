import { AoEpochData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useObservers = (epoch?: AoEpochData) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const arioProcessId = useGlobalState((state) => state.arioProcessId);
  const queryResults = useQuery({
    queryKey: ['prescribedObservers', arIOReadSDK, epoch?.epochIndex || -1, arioProcessId],
    queryFn: () => {
      if (arIOReadSDK && epoch) {
        return arIOReadSDK.getPrescribedObservers(epoch);
      }
      throw new Error('arIOReadSDK or epoch not available');
    },
    enabled: !!arIOReadSDK && !!epoch,
  });

  return queryResults;
};

export default useObservers;
