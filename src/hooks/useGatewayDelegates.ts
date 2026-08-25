import { GatewayDelegateWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

/**
 * Deliberately NOT served from the portal snapshot.
 *
 * `getGatewayDelegates` is memcmp-filtered on the gateway pubkey at offset 8,
 * so the RPC node returns only this gateway's delegations — a handful of
 * accounts, not the whole-program scan this service exists to displace. Across
 * ~645 gateways and ~489 delegations network-wide that averages under one row
 * per gateway, so reading `delegates.json` to answer it meant downloading
 * ~154KB of every other gateway's data to filter client-side.
 *
 * Freshness is the other half. This key is invalidated after a stake, and the
 * published snapshot is up to a publish interval behind, so the read-back
 * after a write would render the pre-stake value. `delegatedStake` is also a
 * live balance computed from the gateway's reward accumulator, which accrues
 * continuously — the snapshot uses the same formula but with an accumulator
 * read at publish time.
 */
const useGatewayDelegateStakes = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: ['gatewayDelegates', address, solanaRpcUrl],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      // Server-side filtered, and the SDK paginates what comes back in memory,
      // so a single call fetches this gateway's full set.
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
