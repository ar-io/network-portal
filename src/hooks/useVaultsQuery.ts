import { WalletVault } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { networkTierFromRpcUrl, snapshotOrRpc } from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

/**
 * The single canonical fetch of every vault.
 *
 * `getVaults` is a whole-program scan, so it gets one cache entry per endpoint.
 * `useVaults` and `useAllVaults` are views over this query, differing only in
 * `select` — previously they were separate queries fetching identical data, and
 * the Balances page mounts both, so it paid for two scans.
 *
 * The key stays `['vaults', rpcUrl]` because write flows already invalidate it
 * by that name. The old `['allVaults', …]` key was invalidated by nothing.
 */
export const vaultsQueryKey = (solanaRpcUrl: string) => [
  'vaults',
  solanaRpcUrl,
];

/** Long by design — write flows invalidate the key explicitly. */
export const VAULTS_STALE_TIME = 60 * 60 * 1000;

export const useVaultsQuery = <TSelected = WalletVault[]>(
  select?: (vaults: WalletVault[]) => TSelected,
) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  return useQuery<WalletVault[], Error, TSelected>({
    queryKey: vaultsQueryKey(solanaRpcUrl),
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      return snapshotOrRpc<WalletVault>(
        'vaults',
        networkTierFromRpcUrl(solanaRpcUrl),
        async () => {
          // The SDK paginates in memory, so requesting everything is one sweep.
          const result = await arIOReadSDK.getVaults({
            limit: Number.MAX_SAFE_INTEGER,
          });
          return result.items as WalletVault[];
        },
      );
    },
    ...(select ? { select } : {}),
    staleTime: VAULTS_STALE_TIME,
    enabled: !!arIOReadSDK,
    placeholderData: (previousData) => previousData,
  });
};

export default useVaultsQuery;
