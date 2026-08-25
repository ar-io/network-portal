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

const mockJson = (body: unknown, status = 200) => {
  global.fetch = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
};

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

  it('refuses to attribute results to individual gateways', async () => {
    // The registry slot order for a past epoch is not published, so a
    // consumer must be able to tell "cannot attribute" from "no failures".
    mockJson(EPOCH_522);
    const result = await fetchObservationsFromArchive(522);

    expect(result?.hasGatewayAttribution).toBe(false);
    expect(result?.failureSummaries).toEqual({});
  });

  it('refuses a document for a different epoch than the one requested', async () => {
    // Portal documents are stamped with a network and program ids and refused
    // on mismatch. An epoch document has no such stamp, so its own epochIndex
    // is the only identity claim available to check.
    mockJson({ ...EPOCH_522, epochIndex: 999 });
    expect(await fetchObservationsFromArchive(522)).toBeNull();
  });

  it('returns null for an epoch outside the retained window', async () => {
    // A 404 here is ordinary, and must leave the caller free to try the live
    // read rather than surfacing an error.
    mockJson({}, 404);
    expect(await fetchObservationsFromArchive(1)).toBeNull();
  });

  it('returns null for a published epoch that carries no observations', async () => {
    mockJson({ ...EPOCH_522, observations: [] });
    expect(await fetchObservationsFromArchive(522)).toBeNull();
  });
});
