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
