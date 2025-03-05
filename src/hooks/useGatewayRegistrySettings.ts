import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

/** Use shouldFetch to optimize whether to fetch or not.  */
const useGatewayRegistrySettings = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['gatewayRegistrySettings', arIOReadSDK],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK not available');
      }

      return await arIOReadSDK.getGatewayRegistrySettings();
    },
    enabled: !!arIOReadSDK,
  });

  return queryResults;
};

export default useGatewayRegistrySettings;
