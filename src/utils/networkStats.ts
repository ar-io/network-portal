import { ARIORead } from '@ar.io/sdk/web';

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
 * **This function is the seam.** It is the only place that knows the numbers
 * come from RPC, so pointing the panel at the ar.io backend means adding a
 * backend fetcher and trying it first, with this as the fallback — no changes to
 * the cache, the hook, or the panel.
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
