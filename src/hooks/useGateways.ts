import { AoARIORead, AoGateway } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGateways = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const fetchAllGateways = async (
    arIOReadSDK: AoARIORead,
  ): Promise<Record<string, AoGateway>> => {
    let cursor: string | undefined;
    const gateways: Record<string, AoGateway> = {};

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
    queryKey: ['gateways', arIOReadSDK],
    queryFn: () => {
      if (arIOReadSDK) {
        return fetchAllGateways(arIOReadSDK);
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!arIOReadSDK,
  });

  return queryResults;
};

export default useGateways;
