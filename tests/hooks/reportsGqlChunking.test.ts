import { describe, expect, it, vi } from 'vitest';

vi.mock('@src/constants', () => ({
  log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('@src/store', () => ({
  useGlobalState: Object.assign(() => undefined, { getState: () => ({}) }),
  useSettings: Object.assign(() => undefined, { getState: () => ({}) }),
}));
vi.mock('@src/store/settings', () => ({
  useSettings: { getState: () => ({ portalApiUrl: '' }) },
}));
vi.mock('@src/hooks/useAnalyzerAvailability', () => ({ default: () => ({}) }));
vi.mock('./useEpochs', () => ({ default: () => ({}) }));

import { GQL_MAX_IDS_PER_QUERY } from '@src/hooks/useReports';

describe('Arweave GraphQL id cap', () => {
  it('never asks for more ids than the endpoint accepts', () => {
    // Measured against the configured indexer: nine ids returns nine, ten
    // returns HTTP 400 —
    //   "Too many ids in 'ids' argument: 10 provided, maximum 9 allowed."
    // It is a hard refusal, not a truncated result, so a gateway with ten or
    // more reports loses every row's metadata rather than some of it.
    expect(GQL_MAX_IDS_PER_QUERY).toBeLessThanOrEqual(9);
    expect(GQL_MAX_IDS_PER_QUERY).toBeGreaterThan(0);
  });
});
