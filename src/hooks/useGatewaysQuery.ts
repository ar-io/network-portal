import { GatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { networkTierFromRpcUrl, snapshotOrRpc } from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

/**
 * The single canonical fetch of every gateway.
 *
 * `getGateways` is a whole-program scan and the most expensive call the app
 * makes, so it gets exactly one cache entry per endpoint. `useGateways` and
 * `useAllGateways` are both views over this one query, differing only in
 * `select` — previously they were separate queries fetching identical data,
 * and any page using both paid for two scans.
 *
 * The key stays `['gateways', rpcUrl]` because nine write flows already
 * invalidate it by that name. The old `['allGateways', …]` key was invalidated
 * by nothing, so the gateway and staking tables could show hour-stale data
 * after a stake.
 */
export const gatewaysQueryKey = (solanaRpcUrl: string) => [
  'gateways',
  solanaRpcUrl,
];

/**
 * Long by design: this data changes rarely, and every write flow invalidates
 * the key explicitly, so a mutation refreshes it regardless of age.
 */
export const GATEWAYS_STALE_TIME = 60 * 60 * 1000;

export const useGatewaysQuery = <TSelected = GatewayWithAddress[]>(
  select?: (gateways: GatewayWithAddress[]) => TSelected,
) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  return useQuery<GatewayWithAddress[], Error, TSelected>({
    queryKey: gatewaysQueryKey(solanaRpcUrl),
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      // Prefer the published snapshot; fall back to the scan when it is
      // absent, stale, or for another network. See utils/portalApi.
      return snapshotOrRpc<GatewayWithAddress>(
        'gateways',
        networkTierFromRpcUrl(solanaRpcUrl),
        async () => {
          // The SDK paginates in memory, so requesting everything is one sweep.
          const result = await arIOReadSDK.getGateways({
            limit: Number.MAX_SAFE_INTEGER,
          });
          return [...result.items];
        },
      );
    },
    ...(select ? { select } : {}),
    staleTime: GATEWAYS_STALE_TIME,
    enabled: !!arIOReadSDK,
    placeholderData: (previousData) => previousData,
  });
};

export default useGatewaysQuery;
