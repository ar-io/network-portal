import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const DEFAULT_NAMES = ['dapp_ardrive', 'arns'];

const usePrescribedNames = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  const queryResults = useQuery({
    queryKey: ['prescribedNames', arIOReadSDK, currentEpoch?.epochIndex || -1],
    queryFn: () => {
      if (arIOReadSDK && currentEpoch) {
        return arIOReadSDK.getPrescribedNames(currentEpoch).catch((e) => {
          // log error
          console.error('Failed to fetch prescribed names', {
            message: e.message,
          });
          // fallback to defaults
          return DEFAULT_NAMES;
        });
      }
      // log error
      throw new Error('arIOReadSDK or currentEpoch not available');
    },
    enabled: !!arIOReadSDK && !!currentEpoch,
  });

  return queryResults;
};

export default usePrescribedNames;
