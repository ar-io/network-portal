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

      // The SDK paginates in memory, so a single call fetches the full set
      // with exactly one chain sweep.
      const pageResult = await arIOReadSDK.getGatewayVaults({
        address,
        limit: Number.MAX_SAFE_INTEGER,
      });

      return pageResult.items as Array<GatewayVault>;
    },
    staleTime: Infinity,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useGatewayVaults;
