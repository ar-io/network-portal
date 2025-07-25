import { useGlobalState, useSettings } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useProtocolBalance = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const arioProcessId = useSettings((state) => state.arioProcessId);

  const queryResults = useQuery({
    queryKey: ['protocolBalance', arioProcessId, arIOReadSDK],
    queryFn: () => {
      if (arIOReadSDK) {
        return arIOReadSDK.getBalance({
          address: arioProcessId,
        });
      }
      throw new Error('Error: ArIO Read SDK is not initialized');
    },
    enabled: !!arioProcessId && !!arIOReadSDK,
    staleTime: 5 * 60 * 1000,
  });

  return queryResults;
};

export default useProtocolBalance;
