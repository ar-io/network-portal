import type { AnalyzerRewardsDocument } from '@src/utils/analyzerApi';
import {
  networkAnnualisedReturn,
  summariseWalletRewards,
} from '@src/utils/walletRewards';

const M = 1_000_000;

const doc = (
  over: Partial<AnalyzerRewardsDocument> = {},
): AnalyzerRewardsDocument => ({
  epochs: [1, 2, 3, 4],
  totalEpochsRecorded: 4,
  counts: { delegate: 1, operator: 0 },
  positions: [],
  ...over,
});

describe('summariseWalletRewards', () => {
  it('reports lifetime earnings, not the windowed sum', () => {
    // The window is capped, so windowRewards understates once history exceeds
    // it. Binding to it would look correct until the day it silently does not.
    const s = summariseWalletRewards(
      doc({
        totalEpochsRecorded: 60,
        positions: [
          {
            kind: 'delegate',
            address: 'me',
            windowRewards: 10 * M,
            lifetimeRewards: 90 * M,
            currentStake: 1000 * M,
          },
        ],
      }),
      'me',
    );
    expect(s?.earned).toBe(90);
  });

  it('divides by recorded history, not by the window or epochs rewarded', () => {
    // 100 earned on 1000 staked over 50 recorded epochs = 0.2%/epoch = 73%/yr.
    // Using epochs.length (4) would give 912%; epochsRewarded (2) would give 1825%.
    const s = summariseWalletRewards(
      doc({
        epochs: [1, 2, 3, 4],
        totalEpochsRecorded: 50,
        positions: [
          {
            kind: 'delegate',
            address: 'me',
            lifetimeRewards: 100 * M,
            currentStake: 1000 * M,
            epochsRewarded: 2,
          },
        ],
      }),
      'me',
    );
    expect(s?.annualisedReturn).toBeCloseTo(0.73, 5);
  });

  it('leaves the return undefined for an exited position', () => {
    for (const currentStake of [null, 0, undefined]) {
      const s = summariseWalletRewards(
        doc({
          positions: [
            {
              kind: 'delegate',
              address: 'me',
              lifetimeRewards: 5 * M,
              currentStake,
            },
          ],
        }),
        'me',
      );
      expect(s?.earned).toBe(5);
      expect(s?.annualisedReturn).toBeUndefined();
      expect(s?.positions[0].annualisedReturn).toBeUndefined();
    }
  });

  it('sums every position a wallet holds and keeps the split', () => {
    const s = summariseWalletRewards(
      doc({
        positions: [
          {
            kind: 'delegate',
            address: 'me',
            gatewayAddress: 'a',
            lifetimeRewards: 3 * M,
            currentStake: 100 * M,
          },
          {
            kind: 'delegate',
            address: 'me',
            gatewayAddress: 'b',
            lifetimeRewards: 7 * M,
            currentStake: 100 * M,
          },
          {
            kind: 'delegate',
            address: 'other',
            gatewayAddress: 'c',
            lifetimeRewards: 99 * M,
            currentStake: 100 * M,
          },
        ],
      }),
      'me',
    );
    expect(s?.earned).toBe(10);
    // Largest first, so the gateway carrying the position leads.
    expect(s?.positions.map((p) => p.gatewayAddress)).toEqual(['b', 'a']);
  });

  describe('gaps', () => {
    it('keeps a null epoch null rather than zero-filling it', () => {
      const s = summariseWalletRewards(
        doc({
          positions: [
            {
              kind: 'delegate',
              address: 'me',
              rewards: [1 * M, null, 3 * M, null],
              lifetimeRewards: 4 * M,
              currentStake: 100 * M,
            },
          ],
        }),
        'me',
      );
      expect(s?.perEpoch.map((p) => p.ario)).toEqual([1, null, 3, null]);
    });

    it('only nulls an epoch where every position had a gap', () => {
      const s = summariseWalletRewards(
        doc({
          epochs: [1, 2],
          totalEpochsRecorded: 2,
          positions: [
            {
              kind: 'delegate',
              address: 'me',
              gatewayAddress: 'a',
              rewards: [1 * M, null],
              lifetimeRewards: 1 * M,
              currentStake: 10 * M,
            },
            {
              kind: 'delegate',
              address: 'me',
              gatewayAddress: 'b',
              rewards: [null, null],
              lifetimeRewards: 0,
              currentStake: 10 * M,
            },
          ],
        }),
        'me',
      );
      expect(s?.perEpoch.map((p) => p.ario)).toEqual([1, null]);
    });

    it('reports real lifetime earnings even when the window is all gaps', () => {
      // Earned only outside the retained window: "no recent activity", not
      // "earned nothing".
      const s = summariseWalletRewards(
        doc({
          totalEpochsRecorded: 90,
          positions: [
            {
              kind: 'delegate',
              address: 'me',
              rewards: [null, null, null, null],
              lifetimeRewards: 42 * M,
              currentStake: 100 * M,
            },
          ],
        }),
        'me',
      );
      expect(s?.earned).toBe(42);
      expect(s?.perEpoch.every((p) => p.ario === null)).toBe(true);
    });
  });

  it('flags inferred positions so they are never silently totalled as measured', () => {
    const s = summariseWalletRewards(
      doc({
        positions: [
          {
            kind: 'delegate',
            address: 'me',
            lifetimeRewards: 1 * M,
            currentStake: 10 * M,
            basis: 'events',
          },
          {
            kind: 'operator',
            address: 'me',
            lifetimeRewards: 2 * M,
            currentStake: 10 * M,
            basis: 'inferred',
          },
        ],
      }),
      'me',
    );
    expect(s?.hasInferred).toBe(true);
  });

  it('returns undefined for a wallet with no positions', () => {
    expect(summariseWalletRewards(doc(), 'nobody')).toBeUndefined();
    expect(summariseWalletRewards(doc(), undefined)).toBeUndefined();
  });
});

describe('networkAnnualisedReturn', () => {
  it('aggregates rewards over stake over recorded epochs', () => {
    // Mirrors live mainnet: 18,204.68 ARIO over 16 epochs on 8,319,422.71
    // staked is 4.99%. An order of magnitude off means the divisor is wrong.
    const r = networkAnnualisedReturn(
      doc({
        totalEpochsRecorded: 16,
        positions: [
          {
            kind: 'delegate',
            address: 'a',
            lifetimeRewards: Math.round(18_204.677999 * M),
            currentStake: Math.round(8_319_422.71 * M),
          },
        ],
      }),
    );
    expect(r).toBeGreaterThan(0.045);
    expect(r).toBeLessThan(0.055);
  });

  it('separates delegate from operator rather than blending the two', () => {
    // Delegates are measured from reward events, operators derived from stake
    // differences. A combined rate would present a derivation as a measurement.
    const d = doc({
      totalEpochsRecorded: 10,
      positions: [
        {
          kind: 'delegate',
          address: 'a',
          lifetimeRewards: 10 * M,
          currentStake: 1000 * M,
        },
        {
          kind: 'operator',
          address: 'b',
          lifetimeRewards: 40 * M,
          currentStake: 1000 * M,
        },
      ],
    });
    expect(networkAnnualisedReturn(d, 'delegate')).toBeCloseTo(0.365, 5);
    expect(networkAnnualisedReturn(d, 'operator')).toBeCloseTo(1.46, 5);
    // Unfiltered blends them, which is why callers pass a kind.
    expect(networkAnnualisedReturn(d)).toBeCloseTo(0.9125, 5);
  });

  it('is undefined for a kind with no positions, not zero', () => {
    // Operators are empty until a second stake snapshot exists; rendering that
    // as 0% would claim they earn nothing.
    const d = doc({
      totalEpochsRecorded: 10,
      counts: { delegate: 1, operator: 0 },
      positions: [
        {
          kind: 'delegate',
          address: 'a',
          lifetimeRewards: 10 * M,
          currentStake: 1000 * M,
        },
      ],
    });
    expect(networkAnnualisedReturn(d, 'operator')).toBeUndefined();
    expect(networkAnnualisedReturn(d, 'delegate')).toBeDefined();
  });

  it('is undefined without stake to divide by', () => {
    expect(
      networkAnnualisedReturn(
        doc({
          positions: [
            {
              kind: 'delegate',
              address: 'a',
              lifetimeRewards: 5 * M,
              currentStake: 0,
            },
          ],
        }),
      ),
    ).toBeUndefined();
  });
});
