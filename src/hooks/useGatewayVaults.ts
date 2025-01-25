import { AoGatewayVault } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGatewayVaults = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery({
    queryKey: ['gatewayVaults', address, arIOReadSDK],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      let cursor: string | undefined;

      let results: Array<AoGatewayVault> = [];

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
  });

  return res;
};

export default useGatewayVaults;
