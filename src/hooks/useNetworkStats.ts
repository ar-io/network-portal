import { usePortalProgramIds } from '@src/hooks/usePortalProgramIds';
import { useGlobalState } from '@src/store';
import { readCachedNetworkStats, writeCachedNetworkStats } from '@src/store/db';
import {
  type NetworkStats,
  fetchNetworkStatsFromRpc,
  fetchNetworkStatsFromSnapshot,
} from '@src/utils/networkStats';
import { networkTierFromRpcUrl } from '@src/utils/portalApi';
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
  const portalProgramIds = usePortalProgramIds();

  return useQuery<NetworkStats>({
    queryKey: networkStatsQueryKey(solanaRpcUrl),
    queryFn: async () => {
      const cached = await readCachedNetworkStats(
        networkPortalDB,
        NETWORK_STATS_TTL,
      );
      if (cached) return cached;

      // Snapshot first: these are the three whole-program scans the published
      // documents exist to absorb, and reading them from the chain left the
      // panel blank whenever RPC was down even though every other number on
      // the dashboard came from the snapshot and rendered fine.
      const fromSnapshot = await fetchNetworkStatsFromSnapshot(
        networkTierFromRpcUrl(solanaRpcUrl),
        portalProgramIds,
      );
      if (fromSnapshot) {
        await writeCachedNetworkStats(networkPortalDB, fromSnapshot);
        return fromSnapshot;
      }

      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const stats = await fetchNetworkStatsFromRpc(arIOReadSDK);
      await writeCachedNetworkStats(networkPortalDB, stats);
      return stats;
    },
    staleTime: NETWORK_STATS_TTL,
    enabled: !!networkPortalDB,
  });
};

export default useNetworkStats;
