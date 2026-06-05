import { GatewayDelegateWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGatewayDelegateStakes = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: ['gatewayDelegates', address, solanaRpcUrl],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      // The SDK paginates in memory, so a single call fetches the full set
      // with exactly one chain sweep.
      const pageResult = await arIOReadSDK.getGatewayDelegates({
        address,
        limit: Number.MAX_SAFE_INTEGER,
      });

      const results: Array<GatewayDelegateWithAddress> = pageResult.items;

      return results.filter((delegate) => delegate.delegatedStake > 0);
    },
    staleTime: Infinity,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useGatewayDelegateStakes;
