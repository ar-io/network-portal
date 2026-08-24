import { GatewayDelegateWithAddress } from '@ar.io/sdk/web';
import { usePortalProgramIds } from '@src/hooks/usePortalProgramIds';
import { useGlobalState } from '@src/store';
import { networkTierFromRpcUrl, snapshotOrRpc } from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

/**
 * `delegates.json` rows carry `gatewayAddress`; the per-gateway RPC call does
 * not, because it filtered on it server-side. Optional so the same shape
 * describes both sources.
 */
type SnapshotDelegate = GatewayDelegateWithAddress & {
  gatewayAddress?: string;
};

const useGatewayDelegateStakes = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const portalProgramIds = usePortalProgramIds();
  const res = useQuery({
    queryKey: ['gatewayDelegates', address, solanaRpcUrl],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      // `delegates.json` is every delegation in the network, and
      // `getGatewayDelegates` returns a strict subset of its fields (address,
      // delegatedStake, startTimestamp) computed from the same reward
      // accumulators — so filtering the published set by gateway is equivalent
      // to the scan, without one `getProgramAccounts` per visitor.
      const results = await snapshotOrRpc<SnapshotDelegate>(
        'delegates',
        networkTierFromRpcUrl(solanaRpcUrl),
        async () => {
          // The SDK paginates in memory, so a single call fetches the full set
          // with exactly one chain sweep.
          const pageResult = await arIOReadSDK.getGatewayDelegates({
            address,
            limit: Number.MAX_SAFE_INTEGER,
          });
          return pageResult.items;
        },
        portalProgramIds,
      );

      return results
        .filter(
          // RPC rows are already gateway-filtered and carry no gatewayAddress.
          (delegate) =>
            delegate.gatewayAddress === undefined ||
            delegate.gatewayAddress === address,
        )
        .filter((delegate) => delegate.delegatedStake > 0);
    },
    staleTime: Infinity,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useGatewayDelegateStakes;
