import { useGlobalState } from '@src/store';
import { readCachedNetworkStats, writeCachedNetworkStats } from '@src/store/db';
import {
  type NetworkStats,
  fetchNetworkStatsFromRpc,
} from '@src/utils/networkStats';
import { useQuery } from '@tanstack/react-query';

/**
 * How long cached counts are served without re-reading the chain.
 *
 * These are slow-moving network-wide aggregates — an address count that is an
 * hour old rounds to the same displayed number. Nothing here is a balance, a
 * stake, or anything a user acts on, so the staleness that would rule out
 * caching elsewhere is acceptable for three informational tiles.
 */
export const NETWORK_STATS_TTL = 60 * 60 * 1000;

export const networkStatsQueryKey = (solanaRpcUrl: string) => [
  'networkStats',
  solanaRpcUrl,
];

/**
 * The dashboard's three headline counts, cached across sessions.
 *
 * Computing these costs three whole-program `getProgramAccounts` scans — 52% of
 * the dashboard's bytes and its three heaviest RPC calls, for three integers.
 * React Query alone does not help a returning visitor: its cache is in memory,
 * so every hard reload and every new tab paid the full price again.
 *
 * The IndexedDB read happens inside `queryFn` rather than through `initialData`
 * so the hit path stays a single async flow. A hit resolves without touching the
 * network at all, so the panel paints from local storage.
 */
const useNetworkStats = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const networkPortalDB = useGlobalState((state) => state.networkPortalDB);

  return useQuery<NetworkStats>({
    queryKey: networkStatsQueryKey(solanaRpcUrl),
    queryFn: async () => {
      const cached = await readCachedNetworkStats(
        networkPortalDB,
        NETWORK_STATS_TTL,
      );
      if (cached) return cached;

      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const stats = await fetchNetworkStatsFromRpc(arIOReadSDK);
      await writeCachedNetworkStats(networkPortalDB, stats);
      return stats;
    },
    staleTime: NETWORK_STATS_TTL,
    enabled: !!arIOReadSDK && !!networkPortalDB,
  });
};

export default useNetworkStats;
