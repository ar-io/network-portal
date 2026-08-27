/**
 * The snapshot API exists to cut RPC cost, but it must never break the app or
 * render wrong data. Every case here is one where falling back to a live read
 * is the correct answer, exercised through the real module.
 */

import {
  clearDocumentWrites,
  markDocumentWritten,
} from '@src/utils/snapshotFreshness';
// `globals: true` provides these at runtime, but tsc needs the import — this
// is the first test in the project to use `vi`.
import { afterEach, describe, expect, it, vi } from 'vitest';

// The endpoint now comes from the settings store, which the user can change at
// runtime, so the store is mocked rather than the build constant. `vi.hoisted`
// gives the factory something a test can mutate — vi.mock is hoisted above any
// plain const declaration.
const settingsState = vi.hoisted(() => ({
  portalApiUrl: 'https://network.services.example',
}));

vi.mock('@src/store/settings', () => ({
  useSettings: { getState: () => settingsState },
}));

// Still mocked so the module does not pull real env-derived constants in.
vi.mock('@src/constants', () => ({
  PORTAL_API_URL: 'https://network.services.example',
  log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const API = 'https://network.services.example';

afterEach(() => {
  settingsState.portalApiUrl = API;
});

import {
  fetchPortalDocument,
  fetchPortalSummary,
  isPortalApiEnabled,
  networkTierFromRpcUrl,
  snapshotOrRpc,
} from '@src/utils/portalApi';

const fresh = () => new Date().toISOString();
const agoMinutes = (m: number) =>
  new Date(Date.now() - m * 60_000).toISOString();

function mockJson(body: unknown, status = 200) {
  global.fetch = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
}

const document = (overrides: Record<string, unknown> = {}) => ({
  schemaVersion: '1.0',
  generatedAt: fresh(),
  network: 'mainnet',
  count: 1,
  items: [{ gatewayAddress: 'gw-1' }],
  ...overrides,
});

describe('networkTierFromRpcUrl', () => {
  it('classifies endpoints without depending on the token in the path', () => {
    expect(
      networkTierFromRpcUrl('https://x.solana-mainnet.quiknode.pro/tok/'),
    ).toBe('mainnet');
    expect(
      networkTierFromRpcUrl('https://x.solana-devnet.quiknode.pro/tok/'),
    ).toBe('devnet');
    expect(networkTierFromRpcUrl('http://127.0.0.1:8899')).toBe('localnet');
    expect(networkTierFromRpcUrl('http://localhost:8899')).toBe('localnet');
    expect(networkTierFromRpcUrl('https://api.testnet.solana.com')).toBe(
      'testnet',
    );
    expect(networkTierFromRpcUrl('not a url')).toBe('mainnet');
  });
});

describe('fetchPortalDocument', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns items from a fresh document for the expected network', async () => {
    mockJson(document());

    const items = await fetchPortalDocument('gateways', 'mainnet');

    expect(items).toEqual([{ gatewayAddress: 'gw-1' }]);
    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/api/v1/portal/gateways.json`,
      expect.anything(),
    );
  });

  it('is enabled only when an API URL is configured', () => {
    expect(isPortalApiEnabled()).toBe(true);
  });

  it('is disabled when the user clears the endpoint in Settings', () => {
    // Empty is a supported choice, not a misconfiguration: it puts every read
    // back on RPC without a redeploy.
    settingsState.portalApiUrl = '';
    expect(isPortalApiEnabled()).toBe(false);
  });

  it('reads the endpoint from Settings, not from the build', async () => {
    // The whole point of the Settings control: a user-supplied endpoint has to
    // be the one actually requested.
    settingsState.portalApiUrl = 'https://custom.example';
    mockJson(document());

    await fetchPortalDocument('gateways', 'mainnet');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://custom.example/api/v1/portal/gateways.json',
      expect.anything(),
    );
  });

  it('does not fetch at all once the endpoint is cleared', async () => {
    settingsState.portalApiUrl = '';
    mockJson(document());

    expect(await fetchPortalDocument('gateways', 'mainnet')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('refuses a snapshot older than the freshness window', async () => {
    // Rendering stake figures hours old, silently, is worse than paying for
    // the scan.
    mockJson(document({ generatedAt: agoMinutes(6 * 60) }));

    expect(await fetchPortalDocument('gateways', 'mainnet')).toBeNull();
  });

  it('accepts a snapshot inside the freshness window', async () => {
    // Two missed publish cycles are tolerated; the publisher runs every 10m.
    mockJson(document({ generatedAt: agoMinutes(25) }));

    expect(await fetchPortalDocument('gateways', 'mainnet')).not.toBeNull();
  });

  it("refuses another network's snapshot", async () => {
    // Devnet data on a mainnet app reads as corruption, not misconfiguration.
    mockJson(document({ network: 'devnet' }));

    expect(await fetchPortalDocument('gateways', 'mainnet')).toBeNull();
  });

  it('refuses a document with no generation time', async () => {
    // Unknown age cannot be checked, so it cannot be trusted.
    mockJson(document({ generatedAt: undefined }));

    expect(await fetchPortalDocument('gateways', 'mainnet')).toBeNull();
  });

  it('refuses a malformed body rather than rendering an empty network', async () => {
    mockJson(document({ items: undefined }));
    expect(await fetchPortalDocument('gateways', 'mainnet')).toBeNull();

    mockJson(document({ items: 'not-an-array' }));
    expect(await fetchPortalDocument('gateways', 'mainnet')).toBeNull();
  });

  it('falls back on any HTTP error, including a service with nothing published', async () => {
    for (const status of [404, 500, 502, 503]) {
      mockJson({ error: 'nope' }, status);
      expect(await fetchPortalDocument('gateways', 'mainnet')).toBeNull();
    }
  });

  it('falls back when the request throws — offline, CORS, DNS, timeout', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    // Never throws: callers write `snapshot ?? rpcScan()`, and an exception
    // here would defeat the fallback entirely.
    expect(await fetchPortalDocument('gateways', 'mainnet')).toBeNull();
  });

  it('tolerates a trailing slash on the configured URL', async () => {
    mockJson(document());
    await fetchPortalDocument('vaults', 'mainnet');

    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/api/v1/portal/vaults.json`,
      expect.anything(),
    );
  });
});

describe('snapshotOrRpc', () => {
  const originalFetch = global.fetch;

  beforeEach(() => clearDocumentWrites());

  afterEach(() => {
    // Marks are module state; without this they leak into the describes below
    // and a future snapshotOrRpc test there would silently take the live-read
    // branch.
    clearDocumentWrites();
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('reads live and skips the snapshot after a write to that document', async () => {
    // The published document cannot say whether it contains a write that just
    // landed, so a recent write takes the scan instead.
    mockJson(document({ items: [{ id: 'from-snapshot' }] }));
    const scan = vi.fn(async () => [{ id: 'from-rpc' }]);
    markDocumentWritten('gateways');

    const result = await snapshotOrRpc('gateways', 'mainnet', scan);

    expect(result).toEqual([{ id: 'from-rpc' }]);
    expect(scan).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('only bypasses the document that was written', async () => {
    mockJson(document({ items: [{ id: 'from-snapshot' }] }));
    const scan = vi.fn(async () => [{ id: 'from-rpc' }]);
    markDocumentWritten('balances');

    expect(await snapshotOrRpc('gateways', 'mainnet', scan)).toEqual([
      { id: 'from-snapshot' },
    ]);
    expect(scan).not.toHaveBeenCalled();
  });

  it('propagates a failed live read instead of serving the pre-write document', async () => {
    // Tempting to fall back to the snapshot here, but React Query would cache
    // that pre-write document as a success for the query's staleTime — an hour
    // for gateways and vaults — with retry: 0 and no refetch on focus. One
    // transient 429 would hide the user's own write for an hour and the
    // live-read window would expire unused. An error is visible and retries on
    // remount, with the mark still set.
    mockJson(document({ items: [{ id: 'from-snapshot' }] }));
    const scan = vi.fn(async () => {
      throw new Error('429');
    });
    markDocumentWritten('gateways');

    await expect(snapshotOrRpc('gateways', 'mainnet', scan)).rejects.toThrow(
      '429',
    );
    expect(scan).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('uses the snapshot and skips the scan entirely', async () => {
    mockJson(document({ items: [{ id: 'from-snapshot' }] }));
    const scan = vi.fn(async () => [{ id: 'from-rpc' }]);

    const result = await snapshotOrRpc('gateways', 'mainnet', scan);

    expect(result).toEqual([{ id: 'from-snapshot' }]);
    expect(scan).not.toHaveBeenCalled();
  });

  it('runs the scan when the snapshot cannot be trusted', async () => {
    mockJson(document({ generatedAt: agoMinutes(600) }));
    const scan = vi.fn(async () => [{ id: 'from-rpc' }]);

    expect(await snapshotOrRpc('gateways', 'mainnet', scan)).toEqual([
      { id: 'from-rpc' },
    ]);
    expect(scan).toHaveBeenCalledTimes(1);
  });

  it('propagates an RPC failure rather than pretending the network is empty', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('api down');
    }) as unknown as typeof fetch;
    const scan = vi.fn(async () => {
      throw new Error('rpc exploded');
    });

    // An empty array would render as "no gateways exist" — worse than an
    // error state, because it looks like real data.
    await expect(snapshotOrRpc('gateways', 'mainnet', scan)).rejects.toThrow(
      'rpc exploded',
    );
  });

  it('serves an empty snapshot as empty without falling back', async () => {
    // A network legitimately containing zero vaults is not a failure. The
    // publisher refuses to publish an empty *gateway* set, which is the case
    // that would actually indicate a broken scan.
    mockJson(document({ items: [], count: 0 }));
    const scan = vi.fn(async () => [{ id: 'from-rpc' }]);

    expect(await snapshotOrRpc('vaults', 'mainnet', scan)).toEqual([]);
    expect(scan).not.toHaveBeenCalled();
  });
});

describe('program ids (schema >= 1.2)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('refuses a document whose program id disagrees with this build', async () => {
    mockJson(document({ programIds: { core: 'CORE_FROM_ANOTHER_DEPLOY' } }));

    // A redeploy moves program ids within a network, so `network` matching is
    // not enough. Decoding another program's accounts yields plausible
    // nonsense rather than an error, which is the worst failure mode there is.
    const result = await fetchPortalDocument('gateways', 'mainnet', {
      core: 'CORE_THIS_BUILD_USES',
    });

    expect(result).toBeNull();
  });

  it('accepts a document whose program ids agree', async () => {
    mockJson(document({ programIds: { core: 'CORE_A', gar: 'GAR_A' } }));

    const result = await fetchPortalDocument('gateways', 'mainnet', {
      core: 'CORE_A',
      gar: 'GAR_A',
    });

    expect(result).toEqual([{ gatewayAddress: 'gw-1' }]);
  });

  it('ignores ids this build has not pinned', async () => {
    mockJson(document({ programIds: { core: 'CORE_A', gar: 'GAR_A' } }));

    // An unset id means the SDK is on its defaults for the network, which the
    // network check already covers. Treating that as a mismatch would send
    // every default-configured client back to RPC for no reason.
    const result = await fetchPortalDocument('gateways', 'mainnet', {});

    expect(result).toEqual([{ gatewayAddress: 'gw-1' }]);
  });

  it('accepts a pre-1.2 document that carries no program ids at all', async () => {
    mockJson(document());

    const result = await fetchPortalDocument('gateways', 'mainnet', {
      core: 'CORE_A',
    });

    expect(result).toEqual([{ gatewayAddress: 'gw-1' }]);
  });
});

describe('fetchPortalSummary', () => {
  afterEach(() => vi.restoreAllMocks());

  const summary = (overrides: Record<string, unknown> = {}) => ({
    schemaVersion: '1.2',
    generatedAt: fresh(),
    network: 'mainnet',
    counts: { arnsRecords: 2981 },
    demandFactor: 6.88,
    ...overrides,
  });

  it('returns the summary when it is fresh and on the right network', async () => {
    mockJson(summary());
    const result = await fetchPortalSummary('mainnet');
    expect(result?.counts?.arnsRecords).toBe(2981);
  });

  it('refuses a stale summary', async () => {
    mockJson(summary({ generatedAt: agoMinutes(45) }));
    expect(await fetchPortalSummary('mainnet')).toBeNull();
  });

  it("refuses another network's summary", async () => {
    mockJson(summary({ network: 'devnet' }));
    expect(await fetchPortalSummary('mainnet')).toBeNull();
  });

  it('refuses a summary from a different program deploy', async () => {
    mockJson(summary({ programIds: { core: 'OTHER' } }));
    expect(await fetchPortalSummary('mainnet', { core: 'MINE' })).toBeNull();
  });

  it('returns null rather than throwing when the request fails', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    expect(await fetchPortalSummary('mainnet')).toBeNull();
  });
});
