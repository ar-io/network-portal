import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The archive path cannot be exercised in a browser against mainnet without a
 * working RPC endpoint, so it is pinned here against a real
 * `/api/v1/epochs/522.json` payload instead.
 */

vi.mock('@src/constants', () => ({
  log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('@src/store', () => ({
  useGlobalState: Object.assign(() => undefined, { getState: () => ({}) }),
  useSettings: Object.assign(() => undefined, {
    getState: () => ({ portalApiUrl: 'https://analyzer.example' }),
  }),
}));

vi.mock('@src/store/settings', () => ({
  useSettings: {
    getState: () => ({ portalApiUrl: 'https://analyzer.example' }),
  },
}));

import { fetchObservationsFromArchive } from '@src/hooks/useObservations';

// Two observers citing the SAME report transaction with DIFFERENT bitmaps —
// the shape live epoch 522 actually has (16 observations, 11 distinct txs).
const EPOCH_522 = {
  epochIndex: 522,
  generatedAt: new Date().toISOString(),
  observationCount: 2,
  distinctReportTxIds: 1,
  registryCaptured: true,
  observations: [
    {
      observer: '2GF1gbN6wcPPMoZqRD5s2VzWU1tU4RpBWcJLx1MpFxJt',
      reportTxId: 'S7yECAYEodE7gafZVxHBiiYegUVDTyPhnQqhDAkhETc',
      gatewayCount: 8,
      gatewayResultsBase64: btoa(String.fromCharCode(0b00000111)),
      gatewayResultsEncoding: 'gar-bitmap-v1-lsb',
    },
    {
      observer: '5btZbthm1VMKZY4RnKxxxxxxxxxxxxxxxxxxxxxxxxxx',
      reportTxId: 'S7yECAYEodE7gafZVxHBiiYegUVDTyPhnQqhDAkhETc',
      gatewayCount: 8,
      gatewayResultsBase64: btoa(String.fromCharCode(0b00000001)),
      gatewayResultsEncoding: 'gar-bitmap-v1-lsb',
    },
  ],
};

/**
 * Routes by path, because the archive read now fetches the epoch document and
 * its registry slot order together. A registry of `undefined` answers 404,
 * which is the ordinary case for the six epochs that publish no slot order.
 */
const mockJson = (body: unknown, status = 200, registry?: unknown) => {
  global.fetch = vi.fn(async (input: unknown) => {
    const url = String(input);
    if (url.includes('/api/v1/registry/')) {
      return registry === undefined
        ? { ok: false, status: 404, json: async () => ({}) }
        : { ok: true, status: 200, json: async () => registry };
    }
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    };
  }) as unknown as typeof fetch;
};

const REGISTRY_522 = {
  epochIndex: 522,
  gatewayCount: 8,
  inEpoch: true,
  approximate: false,
  digest: 'digest-522',
  gateways: ['gw-0', 'gw-1', 'gw-2', 'gw-3', 'gw-4', 'gw-5', 'gw-6', 'gw-7'],
};

// EPOCH_522's two bitmaps are 0b00000111 and 0b00000001 over 8 slots, so the
// failures (cleared bits) are slots 3-7 for the first and 1-7 for the second.
const FAILURE_COUNTS_522 = [0, 1, 1, 2, 2, 2, 2, 2];

afterEach(() => vi.restoreAllMocks());

describe('fetchObservationsFromArchive', () => {
  it('recovers the observer-to-report map and per-observer totals', async () => {
    mockJson(EPOCH_522);
    const result = await fetchObservationsFromArchive(522);

    expect(result?.source).toBe('archive');
    expect(result?.reports).toEqual({
      '2GF1gbN6wcPPMoZqRD5s2VzWU1tU4RpBWcJLx1MpFxJt':
        'S7yECAYEodE7gafZVxHBiiYegUVDTyPhnQqhDAkhETc',
      '5btZbthm1VMKZY4RnKxxxxxxxxxxxxxxxxxxxxxxxxxx':
        'S7yECAYEodE7gafZVxHBiiYegUVDTyPhnQqhDAkhETc',
    });
    expect(
      result?.totalsByObserver['2GF1gbN6wcPPMoZqRD5s2VzWU1tU4RpBWcJLx1MpFxJt'],
    ).toMatchObject({ passed: 3, failed: 5, total: 8 });
    expect(
      result?.totalsByObserver['5btZbthm1VMKZY4RnKxxxxxxxxxxxxxxxxxxxxxxxxxx'],
    ).toMatchObject({ passed: 1, failed: 7, total: 8 });
  });

  it('carries the report-sharing counts the epoch document reports', async () => {
    // Fewer distinct transactions than observers is the independence signal;
    // it must come from the publisher's own counts, not be re-derived from
    // however many rows happened to be returned.
    mockJson(EPOCH_522);
    const result = await fetchObservationsFromArchive(522);

    expect(result?.observationCount).toBe(2);
    expect(result?.distinctReportTxIds).toBe(1);
  });

  it('falls back to deriving the counts when the document omits them', async () => {
    const {
      observationCount: _a,
      distinctReportTxIds: _b,
      ...rest
    } = EPOCH_522;
    mockJson(rest);
    const result = await fetchObservationsFromArchive(522);

    expect(result?.observationCount).toBe(2);
    // Both observations cite the same transaction.
    expect(result?.distinctReportTxIds).toBe(1);
  });

  it('refuses to attribute when no registry slot order is published', async () => {
    // Six mainnet epochs are archived without one. A consumer must be able to
    // tell "cannot attribute" from "no failures".
    mockJson(EPOCH_522);
    const result = await fetchObservationsFromArchive(522);

    expect(result?.hasGatewayAttribution).toBe(false);
    expect(result?.failureSummaries).toEqual({});
  });

  it('attributes failures to gateways when the registry pairs', async () => {
    mockJson(
      {
        ...EPOCH_522,
        registryDigest: 'digest-522',
        failureCounts: FAILURE_COUNTS_522,
      },
      200,
      REGISTRY_522,
    );
    const result = await fetchObservationsFromArchive(522);

    expect(result?.hasGatewayAttribution).toBe(true);
    // Slot 0 passed for both; slots 1 and 2 differ between the two bitmaps.
    expect(result?.failureSummaries['gw-0']).toBeUndefined();
    expect(result?.failureSummaries['gw-1']).toEqual([
      '5btZbthm1VMKZY4RnKxxxxxxxxxxxxxxxxxxxxxxxxxx',
    ]);
    expect(result?.failureSummaries['gw-7']).toHaveLength(2);
  });

  it('skips the registry request entirely when it is not published', async () => {
    // The manifest already says which epochs have one, so a miss should cost
    // no request rather than a 404 on every view.
    mockJson({ ...EPOCH_522, registryDigest: 'digest-522' }, 200, REGISTRY_522);
    await fetchObservationsFromArchive(522, { registryAvailable: false });

    const calls = (global.fetch as unknown as { mock: { calls: unknown[][] } })
      .mock.calls;
    expect(calls.some(([url]) => String(url).includes('/registry/'))).toBe(
      false,
    );
  });

  it('refuses a registry document for a different epoch', async () => {
    // Its own index is the only identity it carries, exactly as for the epoch
    // document; pairing the wrong one would attribute this epoch's results to
    // another epoch's slot order.
    mockJson(
      {
        ...EPOCH_522,
        registryDigest: 'digest-522',
        failureCounts: FAILURE_COUNTS_522,
      },
      200,
      {
        ...REGISTRY_522,
        epochIndex: 999,
      },
    );
    const result = await fetchObservationsFromArchive(522);

    expect(result?.hasGatewayAttribution).toBe(false);
    expect(result?.failureSummaries).toEqual({});
  });

  it('still returns counts when attribution is refused', async () => {
    // Degrading to counts is the whole point: a refused attribution must not
    // cost the panel the totals it could always show.
    mockJson(
      {
        ...EPOCH_522,
        registryDigest: 'digest-522',
        failureCounts: FAILURE_COUNTS_522,
      },
      200,
      {
        ...REGISTRY_522,
        inEpoch: false,
      },
    );
    const result = await fetchObservationsFromArchive(522);

    expect(result?.hasGatewayAttribution).toBe(false);
    expect(
      result?.totalsByObserver['2GF1gbN6wcPPMoZqRD5s2VzWU1tU4RpBWcJLx1MpFxJt'],
    ).toMatchObject({ passed: 3, failed: 5, total: 8 });
  });

  it('refuses a document for a different epoch than the one requested', async () => {
    // Portal documents are stamped with a network and program ids and refused
    // on mismatch. An epoch document has no such stamp, so its own epochIndex
    // is the only identity claim available to check.
    mockJson({ ...EPOCH_522, epochIndex: 999 });
    expect(await fetchObservationsFromArchive(522)).toBeNull();
  });

  it('refuses a document that claims no epoch at all', async () => {
    // `epochIndex` is the document's only identity claim. One that makes none
    // cannot be shown as the epoch that was asked for.
    const { epochIndex: _drop, ...anonymous } = EPOCH_522;
    mockJson(anonymous);
    expect(await fetchObservationsFromArchive(522)).toBeNull();
  });

  it('returns null for an epoch outside the retained window', async () => {
    // A 404 here is ordinary, and must leave the caller free to try the live
    // read rather than surfacing an error.
    mockJson({}, 404);
    expect(await fetchObservationsFromArchive(1)).toBeNull();
  });

  it('answers for a complete epoch that genuinely nobody observed', async () => {
    // Epochs 550, 553 and 554 are real: `complete` with zero observations,
    // and the chain counted zero too. Returning null here would send the
    // caller to a live scan to rediscover the same zero.
    mockJson({
      ...EPOCH_522,
      observations: [],
      observationCount: 0,
      distinctReportTxIds: 0,
      capture: 'complete',
      chain: { observationsSubmitted: 0 },
    });
    const result = await fetchObservationsFromArchive(522);

    expect(result).not.toBeNull();
    expect(result?.capture).toBe('complete');
    expect(result?.observationCount).toBe(0);
    expect(result?.chainObservationsSubmitted).toBe(0);
  });

  it('keeps the chain tally for an epoch whose reports were never captured', async () => {
    // Epoch 509: the chain counted eight observations and the archive holds
    // none. This is the case the whole module turns on — the live read agrees
    // with the zero because `close_observation` deleted the accounts, so
    // without the tally there is nothing left to contradict "nobody
    // reported".
    mockJson({
      ...EPOCH_522,
      observations: [],
      observationCount: 0,
      distinctReportTxIds: 0,
      capture: 'missing',
      chain: { observationsSubmitted: 8 },
    });
    const result = await fetchObservationsFromArchive(522);

    expect(result?.capture).toBe('missing');
    expect(result?.observationCount).toBe(0);
    expect(result?.chainObservationsSubmitted).toBe(8);
  });

  it('leaves capture undefined when the document does not state one', async () => {
    // Absent must not be read as complete; the consumer treats it as unknown.
    mockJson(EPOCH_522);
    const result = await fetchObservationsFromArchive(522);

    expect(result?.capture).toBeUndefined();
    expect(result?.chainObservationsSubmitted).toBeUndefined();
  });
});
