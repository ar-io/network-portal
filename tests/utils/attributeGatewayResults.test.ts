import { describe, expect, it, vi } from 'vitest';

import {
  type AnalyzerRegistryDocument,
  attributeGatewayResults,
} from '@src/utils/analyzerApi';

vi.mock('@src/constants', () => ({
  log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('@src/store/settings', () => ({
  useSettings: {
    getState: () => ({ portalApiUrl: 'https://analyzer.example' }),
  },
}));

const DIGEST =
  '7604dde571d4ba93e50d32c52d0511a9ac5bd6e99f24f701be6bc31a8184e11c';

/** LSB-first, a SET bit meaning the observer found the gateway healthy. */
const bitmap = (bits: number[]) => {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  bits.forEach((bit, i) => {
    if (bit) bytes[i >> 3] |= 1 << (i & 7);
  });
  return btoa(String.fromCharCode(...bytes));
};

const observation = (observer: string, bits: number[]) => ({
  observer,
  reportTxId: `tx-${observer}`,
  gatewayCount: bits.length,
  gatewayResultsBase64: bitmap(bits),
  gatewayResultsEncoding: 'gar-bitmap-v1-lsb',
});

// Four slots, two observers. A and C fail slot 1; only A fails slot 3.
const GATEWAYS = ['gw-zero', 'gw-one', 'gw-two', 'gw-three'];
const OBSERVATIONS = [
  observation('obsA', [1, 0, 1, 0]),
  observation('obsC', [1, 0, 1, 1]),
];
const FAILURE_COUNTS = [0, 2, 0, 1];

const epoch = (over: Record<string, unknown> = {}) => ({
  registryDigest: DIGEST,
  failureCounts: FAILURE_COUNTS,
  observations: OBSERVATIONS,
  ...over,
});

const registry = (
  over: Partial<AnalyzerRegistryDocument> = {},
): AnalyzerRegistryDocument => ({
  epochIndex: 559,
  gatewayCount: GATEWAYS.length,
  inEpoch: true,
  approximate: false,
  digest: DIGEST,
  gateways: GATEWAYS,
  ...over,
});

describe('attributeGatewayResults', () => {
  it('names the observers that failed each gateway', () => {
    expect(attributeGatewayResults(epoch(), registry())).toEqual({
      'gw-one': ['obsA', 'obsC'],
      'gw-three': ['obsA'],
    });
  });

  it('omits gateways nobody failed rather than listing them empty', () => {
    const result = attributeGatewayResults(epoch(), registry());
    expect(result).not.toBeNull();
    expect(Object.keys(result ?? {})).not.toContain('gw-zero');
  });

  it('refuses when the registry digest does not pair', () => {
    expect(
      attributeGatewayResults(epoch(), registry({ digest: 'different' })),
    ).toBeNull();
  });

  it('refuses when either side states no digest at all', () => {
    // The digest is the only identity these two documents share. One that
    // makes no claim cannot be taken to match.
    expect(
      attributeGatewayResults(epoch({ registryDigest: undefined }), registry()),
    ).toBeNull();
    expect(
      attributeGatewayResults(epoch(), registry({ digest: null })),
    ).toBeNull();
  });

  it('refuses a slot order captured after the epoch closed', () => {
    // Mainnet epochs 510 and 511: `inEpoch: false`, so bit i may not name
    // gateways[i]. Counts stay available; names do not.
    expect(
      attributeGatewayResults(
        epoch(),
        registry({ inEpoch: false, approximate: true }),
      ),
    ).toBeNull();
    expect(
      attributeGatewayResults(epoch(), registry({ inEpoch: undefined })),
    ).toBeNull();
  });

  it('ignores a registry that carries MORE gateways than the epoch', () => {
    // Mainnet epochs 523 and 533 do exactly this — 645 registry entries for a
    // 644-slot epoch — and they pass the digest check. The extra entry must
    // not be attributed, and must not abort attribution either.
    const result = attributeGatewayResults(
      epoch(),
      registry({
        gatewayCount: GATEWAYS.length + 1,
        gateways: [...GATEWAYS, 'gw-not-in-this-epoch'],
      }),
    );

    expect(result).toEqual({
      'gw-one': ['obsA', 'obsC'],
      'gw-three': ['obsA'],
    });
    expect(Object.keys(result ?? {})).not.toContain('gw-not-in-this-epoch');
  });

  it('refuses when the registry is shorter than the epoch needs', () => {
    expect(
      attributeGatewayResults(
        epoch(),
        registry({ gateways: GATEWAYS.slice(0, 3), gatewayCount: 3 }),
      ),
    ).toBeNull();
  });

  it('refuses an observation covering a different number of slots', () => {
    expect(
      attributeGatewayResults(
        epoch({
          observations: [OBSERVATIONS[0], observation('obsShort', [1, 0, 1])],
        }),
        registry(),
      ),
    ).toBeNull();
  });

  it('refuses when the decoded tally disagrees with the chain', () => {
    // Guard 5. The protocol counted three failures at slot 1; the bitmaps say
    // two. Something is misaligned and no name here can be trusted.
    expect(
      attributeGatewayResults(
        epoch({ failureCounts: [0, 3, 0, 1] }),
        registry(),
      ),
    ).toBeNull();
  });

  it('refuses an inverted decoder outright', () => {
    // If polarity ever flipped, every tally would invert. `failureCounts`
    // catches it before a single healthy gateway is drawn as failing.
    const inverted = [
      observation('obsA', [0, 1, 0, 1]),
      observation('obsC', [0, 1, 0, 0]),
    ];
    expect(
      attributeGatewayResults(epoch({ observations: inverted }), registry()),
    ).toBeNull();
  });

  it('refuses an unrecognised bitmap encoding', () => {
    expect(
      attributeGatewayResults(
        epoch({
          observations: [
            { ...OBSERVATIONS[0], gatewayResultsEncoding: 'gar-bitmap-v2-msb' },
          ],
        }),
        registry(),
      ),
    ).toBeNull();
  });

  it('refuses when there is no registry, no slot order, or no observations', () => {
    expect(attributeGatewayResults(epoch(), null)).toBeNull();
    expect(
      attributeGatewayResults(epoch(), registry({ gateways: undefined })),
    ).toBeNull();
    expect(
      attributeGatewayResults(epoch({ failureCounts: null }), registry()),
    ).toBeNull();
    expect(
      attributeGatewayResults(epoch({ observations: [] }), registry()),
    ).toBeNull();
  });
});
