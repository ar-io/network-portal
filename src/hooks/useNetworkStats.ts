import { usePortalProgramIds } from '@src/hooks/usePortalProgramIds';
import { useGlobalState } from '@src/store';
import { readCachedNetworkStats, writeCachedNetworkStats } from '@src/store/db';
import {
  type NetworkStats,
  type NetworkStatsDocument,
  fetchNetworkStats,
} from '@src/utils/networkStats';
import { networkTierFromRpcUrl } from '@src/utils/portalApi';
import { shouldReadLive } from '@src/utils/snapshotFreshness';
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

const LIVE_SOURCES: NetworkStatsDocument[] = [
  'balances',
  'delegates',
  'vaults',
];

/**
 * Program ids are part of the key because they are configurable per network
 * tier in Settings, and the counts are counts OF those programs' accounts.
 * Keyed on the endpoint alone, changing the ids kept serving the previous
 * network's numbers for the rest of the TTL.
 */
export const networkStatsQueryKey = (
  solanaRpcUrl: string,
  programFingerprint = '',
) => ['networkStats', solanaRpcUrl, programFingerprint];

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
  const programFingerprint = JSON.stringify(portalProgramIds);

  return useQuery<NetworkStats>({
    queryKey: networkStatsQueryKey(solanaRpcUrl, programFingerprint),
    queryFn: async () => {
      // A write this session could have moved a count, and the cached row
      // predates it. Skip the cache so `fetchNetworkStats` can re-read just the
      // counts that write touched.
      const anyLive = LIVE_SOURCES.some((document) => shouldReadLive(document));

      if (!anyLive) {
        const cached = await readCachedNetworkStats(
          networkPortalDB,
          NETWORK_STATS_TTL,
          programFingerprint,
        );
        if (cached) return cached;
      }

      const stats = await fetchNetworkStats({
        sdk: arIOReadSDK,
        expectedNetwork: networkTierFromRpcUrl(solanaRpcUrl),
        expectedProgramIds: portalProgramIds,
        readLive: shouldReadLive,
      });
      await writeCachedNetworkStats(networkPortalDB, stats, programFingerprint);
      return stats;
    },
    staleTime: NETWORK_STATS_TTL,
    enabled: !!networkPortalDB,
  });
};

export default useNetworkStats;
