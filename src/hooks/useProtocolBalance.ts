import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useProtocolBalance = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const arioProcessId = useGlobalState((state) => state.arioProcessId);

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
  });

  return queryResults;
};

export default useProtocolBalance;
