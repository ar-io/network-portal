import { GatewayVault } from '@ar.io/sdk/web';
import { usePortalProgramIds } from '@src/hooks/usePortalProgramIds';
import { useGlobalState } from '@src/store';
import { networkTierFromRpcUrl, snapshotOrRpc } from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

/** `withdrawals.json` rows carry `gatewayAddress`; the RPC rows do not. */
type SnapshotVault = GatewayVault & { gatewayAddress?: string };

const useGatewayVaults = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const portalProgramIds = usePortalProgramIds();
  const res = useQuery({
    queryKey: ['gatewayVaults', address, solanaRpcUrl],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      // `withdrawals.json` is every GAR `Withdrawal` account and is a superset
      // of what `getGatewayVaults` projects, so filtering it by gateway is
      // equivalent. NOTE this is not `vaults.json` — that is core-program
      // `Vault` accounts, a different dataset entirely.
      const items = (
        await snapshotOrRpc<SnapshotVault>(
          'withdrawals',
          networkTierFromRpcUrl(solanaRpcUrl),
          async () => {
            // The SDK paginates in memory, so a single call fetches the full
            // set with exactly one chain sweep.
            const live = await arIOReadSDK.getGatewayVaults({
              address,
              limit: Number.MAX_SAFE_INTEGER,
            });
            return live.items;
          },
          portalProgramIds,
        )
      ).filter(
        (vault) =>
          vault.gatewayAddress === undefined ||
          vault.gatewayAddress === address,
      );
      const pageResult = { items };

      return pageResult.items as Array<GatewayVault>;
    },
    staleTime: Infinity,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useGatewayVaults;
