import { ARIORead, Gateway } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGateways = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const fetchAllGateways = async (
    arIOReadSDK: ARIORead,
  ): Promise<Record<string, Gateway>> => {
    const gateways: Record<string, Gateway> = {};

    // The SDK paginates in memory, so a single call fetches the full set
    // with exactly one chain sweep.
    const pageResult = await arIOReadSDK.getGateways({
      limit: Number.MAX_SAFE_INTEGER,
    });
    pageResult.items.forEach((gateway) => {
      gateways[gateway.gatewayAddress] = gateway;
    });

    return gateways;
  };

  const queryResults = useQuery({
    queryKey: ['gateways', solanaRpcUrl],
    queryFn: () => {
      if (arIOReadSDK) {
        return fetchAllGateways(arIOReadSDK);
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!arIOReadSDK,
  });

  return queryResults;
};

export default useGateways;
