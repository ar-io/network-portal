/**
 * `fetchNetworkStats` reads each of the dashboard's three counts from the
 * cheapest source that can be trusted. Each case pins one reason a count must
 * NOT come from the snapshot, or one guarantee about which RPC scans run.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

const settingsState = vi.hoisted(() => ({
  portalApiUrl: 'https://network.services.example',
}));

vi.mock('@src/store/settings', () => ({
  useSettings: { getState: () => settingsState },
}));

vi.mock('@src/constants', () => ({
  PORTAL_API_URL: 'https://network.services.example',
  log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { fetchNetworkStats } from '@src/utils/networkStats';

const STAMP = new Date().toISOString();
const OTHER_STAMP = new Date(Date.now() - 60_000).toISOString();

const summary = (generatedAt = STAMP) => ({
  generatedAt,
  network: 'mainnet',
  counts: { balances: 2344, vaults: 717, delegates: 542 },
});

const delegates = (generatedAt = STAMP) => ({
  generatedAt,
  network: 'mainnet',
  items: [
    { address: 'A', gatewayAddress: 'g1' },
    { address: 'A', gatewayAddress: 'g2' },
    { address: 'B', gatewayAddress: 'g1' },
  ],
});

/** Serves each document by path; `stamps` rotates delegates' stamp per call. */
const serve = (
  opts: { summary?: unknown; delegates?: () => unknown; down?: boolean } = {},
) => {
  global.fetch = vi.fn(async (url: string) => {
    if (opts.down) throw new Error('offline');
    const body = url.endsWith('/summary.json')
      ? (opts.summary ?? summary())
      : url.endsWith('/delegates.json')
        ? (opts.delegates?.() ?? delegates())
        : undefined;
    return {
      ok: body !== undefined,
      status: body ? 200 : 404,
      json: async () => body,
    };
  }) as unknown as typeof fetch;
};

const sdk = () =>
  ({
    getBalances: vi.fn(async () => ({ items: new Array(2345).fill({}) })),
    getAllDelegates: vi.fn(async () => ({
      items: [{ address: 'A' }, { address: 'B' }, { address: 'C' }],
    })),
    getVaults: vi.fn(async () => ({ items: new Array(718).fill({}) })),
  }) as any;

const base = { expectedNetwork: 'mainnet', expectedProgramIds: {} };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchNetworkStats', () => {
  it('takes every count from the snapshot and runs no scans', async () => {
    serve();
    const s = sdk();

    const stats = await fetchNetworkStats({
      ...base,
      sdk: s,
      readLive: () => false,
    });

    // Unique addresses, not the 542 delegation rows in `counts.delegates`.
    expect(stats).toEqual({
      totalAddresses: 2344,
      uniqueDelegates: 2,
      totalVaults: 717,
    });
    expect(s.getBalances).not.toHaveBeenCalled();
    expect(s.getAllDelegates).not.toHaveBeenCalled();
    expect(s.getVaults).not.toHaveBeenCalled();
  });

  /**
   * After a vaulted transfer only the vault count can have moved. Re-reading
   * balances too would spend the network's most expensive scan for nothing.
   */
  it('reads only the counts a write touched live', async () => {
    serve();
    const s = sdk();

    const stats = await fetchNetworkStats({
      ...base,
      sdk: s,
      readLive: (doc) => doc === 'vaults',
    });

    expect(stats.totalVaults).toEqual(718);
    expect(stats.totalAddresses).toEqual(2344);
    expect(s.getVaults).toHaveBeenCalledTimes(1);
    expect(s.getBalances).not.toHaveBeenCalled();
    expect(s.getAllDelegates).not.toHaveBeenCalled();
  });

  it('does not fetch delegates.json when the delegate count is read live', async () => {
    serve();
    const s = sdk();

    await fetchNetworkStats({
      ...base,
      sdk: s,
      readLive: (doc) => doc === 'delegates',
    });

    const urls = (global.fetch as any).mock.calls.map(([u]: [string]) => u);
    expect(urls.some((u: string) => u.endsWith('/delegates.json'))).toBe(false);
    expect(s.getAllDelegates).toHaveBeenCalledTimes(1);
  });

  it('retries once when a publish lands between the two fetches', async () => {
    let call = 0;
    serve({ delegates: () => delegates(call++ === 0 ? OTHER_STAMP : STAMP) });
    const s = sdk();

    const stats = await fetchNetworkStats({
      ...base,
      sdk: s,
      readLive: () => false,
    });

    expect(stats.uniqueDelegates).toEqual(2);
    expect(s.getAllDelegates).not.toHaveBeenCalled();
  });

  /**
   * Two cycles' documents must not be combined into one panel. A persistent
   * mismatch reads the delegate count live rather than pairing it with the
   * other cycle's totals.
   */
  it('reads the delegate count live when the stamps keep disagreeing', async () => {
    serve({ delegates: () => delegates(OTHER_STAMP) });
    const s = sdk();

    const stats = await fetchNetworkStats({
      ...base,
      sdk: s,
      readLive: () => false,
    });

    expect(stats.uniqueDelegates).toEqual(3);
    expect(stats.totalAddresses).toEqual(2344);
    expect(s.getAllDelegates).toHaveBeenCalledTimes(1);
  });

  it('falls back to RPC for every count when the snapshot is unreachable', async () => {
    serve({ down: true });
    const s = sdk();

    const stats = await fetchNetworkStats({
      ...base,
      sdk: s,
      readLive: () => false,
    });

    expect(stats).toEqual({
      totalAddresses: 2345,
      uniqueDelegates: 3,
      totalVaults: 718,
    });
  });

  it('refuses a snapshot for another network', async () => {
    serve({ summary: { ...summary(), network: 'devnet' } });
    const s = sdk();

    const stats = await fetchNetworkStats({
      ...base,
      sdk: s,
      readLive: () => false,
    });

    expect(stats.totalAddresses).toEqual(2345);
    expect(s.getBalances).toHaveBeenCalledTimes(1);
  });
});
