import { EpochData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useObservations = (epoch?: EpochData) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const queryResults = useQuery({
    queryKey: ['observations', solanaRpcUrl, epoch?.epochIndex ?? -1],
    queryFn: () => {
      if (arIOReadSDK && epoch) {
        return arIOReadSDK.getObservations(epoch);
      }
      throw new Error('arIOReadSDK or currentEpoch not available');
    },
    enabled: !!arIOReadSDK && !!epoch,
  });

  return queryResults;
};

export default useObservations;
