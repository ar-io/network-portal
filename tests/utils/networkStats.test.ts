import {
  NETWORK_STATS_CACHE_KEY,
  readCachedNetworkStats,
  writeCachedNetworkStats,
} from '@src/store/db';
import { fetchNetworkStatsFromRpc } from '@src/utils/networkStats';
import { vi } from 'vitest';

const TTL = 60 * 60 * 1000;

/** Minimal stand-in for the Dexie table the helpers touch. */
const fakeDb = (initial?: any) => {
  let row = initial;
  return {
    networkStats: {
      get: vi.fn(async (id: string) =>
        row && row.id === id ? row : undefined,
      ),
      put: vi.fn(async (value: any) => {
        row = value;
        return value.id;
      }),
    },
    /** Test-only peek at what was persisted. */
    _row: () => row,
  } as any;
};

const throwingDb = () =>
  ({
    networkStats: {
      get: vi.fn(async () => {
        throw new Error('IndexedDB unavailable');
      }),
      put: vi.fn(async () => {
        throw new Error('IndexedDB unavailable');
      }),
    },
  }) as any;

describe('fetchNetworkStatsFromRpc', () => {
  it('derives counts, deduplicating delegates by address', async () => {
    const sdk = {
      getBalances: vi.fn(async () => ({
        items: [{ address: 'a' }, { address: 'b' }, { address: 'c' }],
      })),
      // One address delegating to three gateways is one delegate, not three —
      // the row count would overstate it.
      getAllDelegates: vi.fn(async () => ({
        items: [
          { address: 'a', gatewayAddress: 'g1' },
          { address: 'a', gatewayAddress: 'g2' },
          { address: 'a', gatewayAddress: 'g3' },
          { address: 'b', gatewayAddress: 'g1' },
        ],
      })),
      getVaults: vi.fn(async () => ({
        items: [{ address: 'a' }, { address: 'a' }, { address: 'b' }],
      })),
    } as any;

    const stats = await fetchNetworkStatsFromRpc(sdk);

    expect(stats).toEqual({
      totalAddresses: 3,
      uniqueDelegates: 2,
      // Every vault row counts, including several owned by one address —
      // this matches the per-address sum the panel used to compute.
      totalVaults: 3,
    });
  });

  it('issues each whole-program scan exactly once', async () => {
    const sdk = {
      getBalances: vi.fn(async () => ({ items: [] })),
      getAllDelegates: vi.fn(async () => ({ items: [] })),
      getVaults: vi.fn(async () => ({ items: [] })),
    } as any;

    await fetchNetworkStatsFromRpc(sdk);

    expect(sdk.getBalances).toHaveBeenCalledTimes(1);
    expect(sdk.getAllDelegates).toHaveBeenCalledTimes(1);
    expect(sdk.getVaults).toHaveBeenCalledTimes(1);
  });
});

describe('network stats cache', () => {
  const stats = {
    totalAddresses: 2352,
    uniqueDelegates: 335,
    totalVaults: 717,
  };

  it('returns a row written within the TTL', async () => {
    const db = fakeDb();
    await writeCachedNetworkStats(db, stats);

    expect(await readCachedNetworkStats(db, TTL)).toEqual(stats);
    expect(db._row().id).toBe(NETWORK_STATS_CACHE_KEY);
  });

  it('treats a row older than the TTL as a miss', async () => {
    const db = fakeDb({
      ...stats,
      id: NETWORK_STATS_CACHE_KEY,
      fetchedAt: Date.now() - (TTL + 1000),
    });

    expect(await readCachedNetworkStats(db, TTL)).toBeUndefined();
  });

  it('treats a row from the future as a miss', async () => {
    // A row written by a clock ahead of this one would otherwise have a
    // negative age and be served indefinitely.
    const db = fakeDb({
      ...stats,
      id: NETWORK_STATS_CACHE_KEY,
      fetchedAt: Date.now() + 10 * TTL,
    });

    expect(await readCachedNetworkStats(db, TTL)).toBeUndefined();
  });

  it('returns a miss rather than throwing when IndexedDB is unavailable', async () => {
    // Private windows and blocked site data must degrade to a fetch, not an
    // error — the cache is an optimisation.
    expect(await readCachedNetworkStats(throwingDb(), TTL)).toBeUndefined();
  });

  it('does not throw when the cache cannot be written', async () => {
    await expect(
      writeCachedNetworkStats(throwingDb(), stats),
    ).resolves.toBeUndefined();
  });

  it('drops fields that are not part of the stats shape', async () => {
    const db = fakeDb({
      ...stats,
      id: NETWORK_STATS_CACHE_KEY,
      fetchedAt: Date.now(),
      strayField: 'should not survive',
    });

    const read = await readCachedNetworkStats(db, TTL);

    expect(read).toEqual(stats);
    expect(read).not.toHaveProperty('strayField');
    expect(read).not.toHaveProperty('fetchedAt');
  });
});
