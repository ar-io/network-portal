import { ARIORead, AllDelegates } from '@ar.io/sdk/web';
import {
  type PortalProgramIds,
  fetchPortalDocument,
  fetchPortalSummary,
} from './portalApi';

/**
 * The three headline counts on the dashboard's Network Statistics panel.
 *
 * Deliberately a small, source-agnostic shape rather than the raw datasets they
 * are derived from. The panel renders three integers; caching those integers is
 * what lets a repeat visit skip the work entirely, and it keeps the cache
 * independent of *where* the numbers came from.
 */
export type NetworkStats = {
  /** Unique addresses holding a balance. */
  totalAddresses: number;
  /** Unique addresses with at least one delegation. */
  uniqueDelegates: number;
  /** Vaults holding locked tokens awaiting withdrawal. */
  totalVaults: number;
};

/**
 * Derive the stats from chain reads.
 *
 * **This function is the fallback.** `fetchNetworkStatsFromSnapshot` is tried
 * first; this runs only when the snapshot is off, unreachable, or publishing a
 * different network.
 *
 * It is also the expensive path, which is why it sits behind a cache: each of
 * these three calls is a whole-program `getProgramAccounts` scan. Together they
 * were 52% of the dashboard's bytes (1.6 MB of 3.0 MB) and its three
 * heaviest-weighted RPC calls, to render three integers.
 *
 * Only the counts are kept. The full datasets are fetched, counted, and dropped
 * — callers that need the rows themselves (the Balances page) still use
 * `useAllBalances` / `useAllDelegates` / `useVaultsQuery` directly.
 */
export const fetchNetworkStatsFromRpc = async (
  arIOReadSDK: ARIORead,
): Promise<NetworkStats> => {
  const [balances, delegates, vaults] = await Promise.all([
    arIOReadSDK.getBalances({ limit: Number.MAX_SAFE_INTEGER }),
    arIOReadSDK.getAllDelegates({ limit: Number.MAX_SAFE_INTEGER }),
    arIOReadSDK.getVaults({ limit: Number.MAX_SAFE_INTEGER }),
  ]);

  return {
    totalAddresses: balances.items.length,
    // One address can delegate to many gateways, so the row count overstates
    // the number of people delegating. The panel has always shown uniques.
    uniqueDelegates: new Set(delegates.items.map((item) => item.address)).size,
    // Equivalent to summing per-address vault counts, which is what the panel
    // used to do after `useAllVaults` grouped them by address.
    totalVaults: vaults.items.length,
  };
};

/**
 * Derive the same three counts from the published snapshot.
 *
 * These are whole-program scans, so they are exactly what the snapshot exists
 * to absorb. Reading them from RPC meant the panel went blank whenever the
 * chain was unreachable, even with the snapshot serving every other number on
 * the page — which is the opposite of what the fallback is for.
 *
 * Two of the three are scalars in `summary.json`, a 1.6KB document. The third
 * is not: `counts.delegates` counts delegation ROWS (542 on devnet) while the
 * panel has always shown unique delegating ADDRESSES (352), because one address
 * can delegate to many gateways. That one needs `delegates.json` and a dedupe.
 *
 * Returns null if any part is unavailable, so the caller falls back whole
 * rather than showing two real numbers beside a guess.
 */
export const fetchNetworkStatsFromSnapshot = async (
  expectedNetwork: string,
  expectedProgramIds: PortalProgramIds = {},
): Promise<NetworkStats | null> => {
  const [summary, delegates] = await Promise.all([
    fetchPortalSummary(expectedNetwork, expectedProgramIds),
    fetchPortalDocument<AllDelegates>(
      'delegates',
      expectedNetwork,
      expectedProgramIds,
    ),
  ]);

  const totalAddresses = summary?.counts?.balances;
  const totalVaults = summary?.counts?.vaults;

  if (
    typeof totalAddresses !== 'number' ||
    typeof totalVaults !== 'number' ||
    !delegates
  ) {
    return null;
  }

  return {
    totalAddresses,
    totalVaults,
    uniqueDelegates: new Set(delegates.map((item) => item.address)).size,
  };
};
