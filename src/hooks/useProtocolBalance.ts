import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useProtocolBalance = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const queryResults = useQuery({
    queryKey: ['protocolBalance', solanaRpcUrl],
    queryFn: async () => {
      if (arIOReadSDK) {
        const supply = await arIOReadSDK.getTokenSupply();
        return supply.protocolBalance;
      }
      throw new Error('Error: ArIO Read SDK is not initialized');
    },
    enabled: !!arIOReadSDK,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return queryResults;
};

export default useProtocolBalance;
