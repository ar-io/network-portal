/**
 * The snapshot API exists to cut RPC cost, but it must never break the app or
 * render wrong data. Every case here is one where falling back to a live read
 * is the correct answer, exercised through the real module.
 */

// `globals: true` provides these at runtime, but tsc needs the import — this
// is the first test in the project to use `vi`.
import { afterEach, describe, expect, it, vi } from 'vitest';

// PORTAL_API_URL is read from import.meta.env at module load, so the constants
// module is mocked to make the enabled path testable at all. The URL is
// inlined because vi.mock is hoisted above any const declaration.
vi.mock('@src/constants', () => ({
  PORTAL_API_URL: 'https://network.services.example',
  log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const API = 'https://network.services.example';

import {
  fetchPortalDocument,
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

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
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
