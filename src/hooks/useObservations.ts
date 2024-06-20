
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useObservers = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  const queryResults = useQuery({
    queryKey: ['observations', currentEpoch?.epochIndex || -1],
    queryFn: () => {
      if (arIOReadSDK && currentEpoch) {
        return arIOReadSDK.getObservations(currentEpoch);
      }
      throw new Error('arIOReadSDK or currentEpoch not available');
    },
  });

  return queryResults;
};

export default useObservers;
