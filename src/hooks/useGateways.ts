import { ARIORead, Gateway } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGateways = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const fetchAllGateways = async (
    arIOReadSDK: ARIORead,
  ): Promise<Record<string, Gateway>> => {
    let cursor: string | undefined;
    const gateways: Record<string, Gateway> = {};

    do {
      const pageResult = await arIOReadSDK.getGateways({ cursor, limit: 1000 });
      pageResult.items.forEach((gateway) => {
        gateways[gateway.gatewayAddress] = gateway;
      });
      cursor = pageResult.nextCursor;
    } while (cursor !== undefined);

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
