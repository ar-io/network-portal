import { AoGatewayDelegateWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGatewayDelegateStakes = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery({
    queryKey: ['gatewayDelegates', address, arIOReadSDK],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      let cursor: string | undefined;

      let results: Array<AoGatewayDelegateWithAddress> = [];

      do {
        const pageResult = await arIOReadSDK.getGatewayDelegates({
          address,
          cursor,
          limit: 100,
        });

        results = results.concat(pageResult.items);

        cursor = pageResult.nextCursor;
      } while (cursor !== undefined);

      return results.filter(delegate => delegate.delegatedStake > 0);
    },
    staleTime: Infinity,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useGatewayDelegateStakes;
