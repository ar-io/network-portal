import { AoGateway, AoIORead } from '@ar.io/sdk';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGateways = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const fetchAllGateways = async (
    arIOReadSDK: AoIORead,
  ): Promise<Record<string, AoGateway>> => {
    let cursor: string | undefined;
    const gateways: Record<string, AoGateway> = {};

    do {
      const pageResult = await arIOReadSDK.getGateways({ cursor });
      pageResult.items.forEach((gateway) => {
        gateways[gateway.gatewayAddress] = gateway;
      });
      cursor = pageResult.nextCursor;
    } while (cursor !== undefined);

    return gateways;
  };

  const queryResults = useQuery({
    queryKey: ['gateways'],
    queryFn: () => {
      if (arIOReadSDK) {
        return fetchAllGateways(arIOReadSDK);
      }
    },
  });

  return queryResults;
};

export default useGateways;
