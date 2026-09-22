import { ARIORead, AllDelegates } from '@ar.io/sdk/web';
import {
  type PortalProgramIds,
  fetchPortalSummary,
  fetchStampedPortalDocument,
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
 * All three counts at once, straight from RPC. `fetchNetworkStats` is what the
 * panel calls; it reads each count from the snapshot where it can and from
 * RPC per count where it cannot, so this full sweep is kept as a single-call
 * reference for the RPC shape rather than the app's path.
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

/** A snapshot document whose freshness can override a count. */
export type NetworkStatsDocument = 'balances' | 'delegates' | 'vaults';

type Counts = Partial<NetworkStats>;

const countUniqueDelegates = (items: AllDelegates[]) =>
  new Set(items.map((item) => item.address)).size;

/**
 * The counts the snapshot can supply, as a partial, never a guess.
 *
 * Two of the three are scalars in `summary.json`, a 1.6KB document. The third
 * is not: `counts.delegates` counts delegation ROWS (542 on devnet) while the
 * panel has always shown unique delegating ADDRESSES (352), because one address
 * can delegate to many gateways. That one needs `delegates.json` and a dedupe.
 *
 * When both documents are needed they must come from one publish cycle. The
 * publisher stamps every document of a cycle with the same `generatedAt`, so
 * unequal stamps mean a publish landed between the two parallel fetches; that
 * is retried once, and a second mismatch drops the delegate count rather than
 * pair it with another cycle's totals.
 */
const snapshotCounts = async (
  expectedNetwork: string,
  expectedProgramIds: PortalProgramIds,
  wantDelegates: boolean,
): Promise<Counts> => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const [summary, delegates] = await Promise.all([
      fetchPortalSummary(expectedNetwork, expectedProgramIds),
      wantDelegates
        ? fetchStampedPortalDocument<AllDelegates>(
            'delegates',
            expectedNetwork,
            expectedProgramIds,
          )
        : Promise.resolve(null),
    ]);

    const counts: Counts = {
      totalAddresses: summary?.counts?.balances,
      totalVaults: summary?.counts?.vaults,
    };

    if (!delegates) return counts;
    if (!summary || summary.generatedAt === delegates.generatedAt) {
      return {
        ...counts,
        uniqueDelegates: countUniqueDelegates(delegates.items),
      };
    }
  }

  const summary = await fetchPortalSummary(expectedNetwork, expectedProgramIds);
  return {
    totalAddresses: summary?.counts?.balances,
    totalVaults: summary?.counts?.vaults,
  };
};

const LIVE_READERS: Record<
  keyof NetworkStats,
  (sdk: ARIORead) => Promise<number>
> = {
  totalAddresses: async (sdk) =>
    (await sdk.getBalances({ limit: Number.MAX_SAFE_INTEGER })).items.length,
  uniqueDelegates: async (sdk) =>
    countUniqueDelegates(
      (await sdk.getAllDelegates({ limit: Number.MAX_SAFE_INTEGER })).items,
    ),
  totalVaults: async (sdk) =>
    (await sdk.getVaults({ limit: Number.MAX_SAFE_INTEGER })).items.length,
};

/** Which document each count is published in, for the post-write check. */
const SOURCE: Record<keyof NetworkStats, NetworkStatsDocument> = {
  totalAddresses: 'balances',
  uniqueDelegates: 'delegates',
  totalVaults: 'vaults',
};

/**
 * The three counts, each from the cheapest source that can be trusted.
 *
 * Snapshot first: these are three whole-program scans, exactly what the
 * published documents exist to absorb, and reading them from the chain left
 * the panel blank whenever RPC was down even though the rest of the dashboard
 * rendered from the snapshot.
 *
 * Per count, not all-or-nothing. After a write, only the counts that write
 * could have moved are read live, because CLAUDE.md's rule is to mark only
 * the documents a transaction changes and `balances` is the most expensive
 * scan on the network. A vaulted transfer re-reads vaults, not balances. Any
 * count the snapshot cannot supply is read live too.
 *
 * `expectedProgramIds` is required, not defaulted: an empty object silently
 * turns the snapshot's program-id check into a no-op.
 */
export const fetchNetworkStats = async ({
  sdk,
  expectedNetwork,
  expectedProgramIds,
  readLive,
}: {
  sdk?: ARIORead;
  expectedNetwork: string;
  expectedProgramIds: PortalProgramIds;
  readLive: (document: NetworkStatsDocument) => boolean;
}): Promise<NetworkStats> => {
  const keys = Object.keys(SOURCE) as Array<keyof NetworkStats>;
  const live = new Set(keys.filter((key) => readLive(SOURCE[key])));

  const snapshot: Counts =
    live.size === keys.length
      ? {}
      : await snapshotCounts(
          expectedNetwork,
          expectedProgramIds,
          !live.has('uniqueDelegates'),
        );

  const values = await Promise.all(
    keys.map(async (key) => {
      const fromSnapshot = snapshot[key];
      if (!live.has(key) && typeof fromSnapshot === 'number') {
        return fromSnapshot;
      }
      if (!sdk) throw new Error('arIOReadSDK is not initialized');
      return LIVE_READERS[key](sdk);
    }),
  );

  return Object.fromEntries(
    keys.map((key, i) => [key, values[i]]),
  ) as NetworkStats;
};
