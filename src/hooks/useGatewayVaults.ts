import { GatewayVault } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGatewayVaults = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: ['gatewayVaults', address, solanaRpcUrl],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      let cursor: string | undefined;

      let results: Array<GatewayVault> = [];

      do {
        const pageResult = await arIOReadSDK.getGatewayVaults({
          address,
          cursor,
          limit: 100,
        });

        results = results.concat(pageResult.items);

        cursor = pageResult.nextCursor;
      } while (cursor !== undefined);

      return results;
    },
    staleTime: Infinity,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useGatewayVaults;
