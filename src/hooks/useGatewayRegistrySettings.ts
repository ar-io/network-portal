import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

/** Use shouldFetch to optimize whether to fetch or not.  */
const useGatewayRegistrySettings = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const queryResults = useQuery({
    queryKey: ['gatewayRegistrySettings', solanaRpcUrl],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK not available');
      }

      return await arIOReadSDK.getGatewayRegistrySettings();
    },
    enabled: !!arIOReadSDK,
    staleTime: Infinity,
  });

  return queryResults;
};

export default useGatewayRegistrySettings;
