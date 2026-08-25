import { GatewayVault } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

/**
 * Deliberately NOT served from the portal snapshot.
 *
 * `getGatewayVaults` is memcmp-filtered on the gateway pubkey at offset 8, so
 * the RPC node returns only this gateway's withdrawals rather than the whole
 * program. Answering it from `withdrawals.json` meant pulling all ~510
 * network-wide rows (~142KB) to filter client-side.
 *
 * This key is also invalidated after a stake or withdrawal, and the published
 * snapshot lags by up to a publish interval, so the read-back after a write
 * would show the pre-write state.
 *
 * NOTE `withdrawals.json` is GAR `Withdrawal` accounts; `vaults.json` is
 * core-program `Vault` accounts. Different datasets, not two views of one.
 */
const useGatewayVaults = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: ['gatewayVaults', address, solanaRpcUrl],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      // Server-side filtered, and the SDK paginates what comes back in memory,
      // so a single call fetches this gateway's full set.
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
