import { countGatewayResults } from '@src/utils/analyzerApi';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@src/constants', () => ({
  log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('@src/store/settings', () => ({
  useSettings: {
    getState: () => ({ portalApiUrl: 'https://analyzer.example' }),
  },
}));

/** Build a bitmap the way the publisher does: LSB-first within each byte. */
const bitmap = (bits: number[]): string => {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  bits.forEach((b, i) => {
    if (b) bytes[i >> 3] |= 1 << (i & 7);
  });
  return btoa(String.fromCharCode(...bytes));
};

const observation = (overrides: Record<string, unknown> = {}) => ({
  observer: 'obs-1',
  reportTxId: 'tx-1',
  gatewayCount: 8,
  gatewayResultsBase64: bitmap([1, 0, 1, 0, 1, 0, 1, 0]),
  gatewayResultsEncoding: 'gar-bitmap-v1-lsb',
  ...overrides,
});

describe('countGatewayResults', () => {
  it('counts passes LSB-first, matching gar-bitmap-v1-lsb', () => {
    expect(countGatewayResults(observation())).toEqual({
      passed: 4,
      failed: 4,
      total: 8,
      passRate: 0.5,
    });
  });

  it('reads only as far as gatewayCount, ignoring padding bits', () => {
    // The byte says 8 passes; the observation claims only 3 gateways. Counting
    // the padding would invent five passing gateways that do not exist.
    const result = countGatewayResults(
      observation({
        gatewayCount: 3,
        gatewayResultsBase64: bitmap([1, 1, 1, 1, 1, 1, 1, 1]),
      }),
    );
    expect(result).toEqual({ passed: 3, failed: 0, total: 3, passRate: 1 });
  });

  it('decodes a real epoch-522 observation', () => {
    // Captured from /api/v1/epochs/522.json. Locks in the bit convention
    // against live publisher output rather than only our own encoder.
    const real = observation({
      gatewayCount: 644,
      gatewayResultsBase64:
        'AAD8CwAe9v//FwAABqgIgMEsBgAgAABgGQgAAAAUAAKA4A8AAwAGAIAuAAIAAgQAlMQYjWAgAOUCAAEQAIgAGBsUoAABBAAAjgCAAQA29s8JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    expect(countGatewayResults(real)).toMatchObject({
      passed: 145,
      failed: 499,
      total: 644,
    });
  });

  it('refuses an encoding it has not been checked against', () => {
    // Guessing at an unknown layout would produce a confident wrong number.
    expect(
      countGatewayResults(
        observation({ gatewayResultsEncoding: 'gar-bitmap-v2-msb' }),
      ),
    ).toBeNull();
  });

  it('refuses a bitmap too short for the count it claims', () => {
    // Reading past the end yields zeros, which would render as "everything
    // failed" — indistinguishable from a real total wipeout.
    expect(
      countGatewayResults(
        observation({
          gatewayCount: 64,
          gatewayResultsBase64: bitmap([1, 0, 1]),
        }),
      ),
    ).toBeNull();
  });

  it('returns null rather than a zeroed total when there is no bitmap', () => {
    expect(
      countGatewayResults(observation({ gatewayResultsBase64: undefined })),
    ).toBeNull();
    expect(countGatewayResults(observation({ gatewayCount: 0 }))).toBeNull();
  });
});

import { matchRosterRow } from '@src/utils/analyzerApi';

describe('matchRosterRow', () => {
  const walletRow = { wallet: 'WALLET_A', fqdn: 'a.example', isp: 'ISP A' };
  const fqdnOnlyRow = { fqdn: 'b.example', isp: 'ISP B' };
  const roster = {
    rows: [walletRow, fqdnOnlyRow],
    byWallet: new Map([['WALLET_A', walletRow]]),
    byFqdn: new Map([
      ['a.example', walletRow],
      ['b.example', fqdnOnlyRow],
    ]),
  };

  it('prefers the wallet, which is the gateway identity', () => {
    // An FQDN can be re-pointed at another operator's host; matching it first
    // would attribute someone else's infrastructure to this gateway.
    expect(
      matchRosterRow(roster, {
        gatewayAddress: 'WALLET_A',
        fqdn: 'b.example',
      }),
    ).toBe(walletRow);
  });

  it('falls back to the FQDN for a row published without a wallet', () => {
    expect(
      matchRosterRow(roster, { gatewayAddress: 'UNKNOWN', fqdn: 'b.example' }),
    ).toBe(fqdnOnlyRow);
  });

  it('matches an FQDN case-insensitively', () => {
    expect(
      matchRosterRow(roster, { gatewayAddress: 'UNKNOWN', fqdn: 'B.Example' }),
    ).toBe(fqdnOnlyRow);
  });

  it('returns undefined for a gateway the roster does not cover', () => {
    // Only joined gateways publishing an FQDN are analysed — roughly half the
    // registry — so a miss is ordinary and the card removes itself.
    expect(
      matchRosterRow(roster, { gatewayAddress: 'NOPE', fqdn: 'nope.example' }),
    ).toBeUndefined();
    expect(
      matchRosterRow(null, { gatewayAddress: 'WALLET_A' }),
    ).toBeUndefined();
    expect(matchRosterRow(roster, undefined)).toBeUndefined();
  });
});

import { fetchAnalyzerAvailability } from '@src/utils/analyzerApi';

describe('fetchAnalyzerAvailability', () => {
  /**
   * Shaped like the real `/api/v1/index.json`: `documents` is a MAP keyed by
   * name, and its `epochs` entry is an array of per-epoch records. An earlier
   * version of this test asserted a list of names, which is what a `jq keys`
   * of the document looks like but not what the endpoint serves — so the test
   * passed while the code read nothing and gated every panel off.
   */
  const ROOT = {
    documents: {
      observers: { path: '/api/v1/observers.json', bytes: 48013 },
      findings: { path: '/api/v1/findings.json', bytes: 297599 },
      network: { path: '/api/v1/network.json', bytes: 78323 },
      gateways: { path: '/api/v1/gateways.json', bytes: 437791 },
      epochs: [
        { path: '/api/v1/epochs/523.json', epochIndex: 523 },
        { path: '/api/v1/epochs/522.json', epochIndex: 522 },
      ],
    },
  };

  const mockHosts = (portal: unknown, root: unknown) => {
    global.fetch = vi.fn(async (url: string) => {
      const body = String(url).includes('/portal/') ? portal : root;
      return {
        ok: body !== null,
        status: body === null ? 404 : 200,
        json: async () => body,
      };
    }) as unknown as typeof fetch;
  };

  it('reads the document map and the archived epoch list', async () => {
    mockHosts({ network: 'mainnet' }, ROOT);
    const result = await fetchAnalyzerAvailability('mainnet');

    expect(result.networkMatches).toBe(true);
    expect(result.documents.sort()).toEqual([
      'epochs',
      'findings',
      'gateways',
      'network',
      'observers',
    ]);
    // Knowing which epochs exist means an epoch outside the window costs no
    // request at all.
    expect(result.archivedEpochs).toEqual([523, 522]);
  });

  it("refuses a host serving another network's analysis", async () => {
    // The archive documents carry no network stamp of their own, so without
    // this they would render as though they described the current network.
    mockHosts({ network: 'devnet' }, ROOT);
    const result = await fetchAnalyzerAvailability('mainnet');

    expect(result.networkMatches).toBe(false);
    expect(result.documents).toEqual([]);
    expect(result.archivedEpochs).toEqual([]);
  });

  it('refuses a host that publishes no network stamp at all', async () => {
    // Unverifiable identity is treated as unavailable: these panels are
    // additive, so refusing costs less than being wrong.
    mockHosts({}, ROOT);
    expect((await fetchAnalyzerAvailability('mainnet')).networkMatches).toBe(
      false,
    );
  });

  it('reports no documents when the archive is not published', async () => {
    // Devnet serves the portal documents and no archive. Without this every
    // historical epoch pays a doomed round trip before falling back to RPC.
    mockHosts({ network: 'devnet' }, null);
    expect(await fetchAnalyzerAvailability('devnet')).toEqual({
      networkMatches: true,
      documents: [],
      archivedEpochs: [],
      network: 'devnet',
    });
  });
});
