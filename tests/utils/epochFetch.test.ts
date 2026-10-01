import {
  type EpochDataWithCounters,
  REWARD_TOTALS_VERSION,
  epochRewardTotals,
  forfeitedGatewayReward,
  forfeitedObserverReward,
  upgradeCachedEpoch,
} from '@src/utils/epochFetch';

/** Mainnet epoch 546, read from the Epoch PDA on 2026-09-16. All mARIO. */
const EPOCH_546 = {
  totalEligibleRewards: 60_592_913_037,
  perGatewayReward: 158_412_844,
  perObserverReward: 242_371_652,
  observerCount: 50,
  prescriptionsDone: 1,
  observationsSubmitted: 43,
  rewardsDistributed: 1,
};
/** Every registry slot, leavers included. Not the reward divisor. */
const ACTIVE_GATEWAY_COUNT = 620;

describe('epochRewardTotals', () => {
  it('splits the epoch reward into two pools that sum to the total', () => {
    const { distributions: t } = epochRewardTotals(EPOCH_546);

    expect(
      t.totalEligibleGatewayReward + t.totalEligibleObserverReward,
    ).toEqual(EPOCH_546.totalEligibleRewards);
  });

  it('matches the ratios mainnet actually runs, 80/20', () => {
    const { distributions: t } = epochRewardTotals(EPOCH_546);

    expect(
      t.totalEligibleGatewayReward / EPOCH_546.totalEligibleRewards,
    ).toBeCloseTo(0.8, 6);
    expect(
      t.totalEligibleObserverReward / EPOCH_546.totalEligibleRewards,
    ).toBeCloseTo(0.2, 6);
  });

  /**
   * The gateway pool used to be `perGatewayReward * activeGatewayCount`, which
   * multiplies by every registry slot rather than by the gateways eligible to
   * earn. On this epoch that is 620 against 306.
   */
  it('does not multiply by the registry slot count, which overstated it 2x', () => {
    const { distributions: t } = epochRewardTotals(EPOCH_546);
    const old = EPOCH_546.perGatewayReward * ACTIVE_GATEWAY_COUNT;

    expect(old / t.totalEligibleGatewayReward).toBeCloseTo(2.03, 2);
    expect(old).toBeGreaterThan(EPOCH_546.totalEligibleRewards);
  });

  it('reports the 306 gateways the protocol divided by, not 620 slots', () => {
    expect(
      epochRewardTotals(EPOCH_546).distributions.totalEligibleGateways,
    ).toEqual(306);
  });

  /**
   * `create_epoch` sets the total but leaves both per-unit rewards at zero
   * until `prescribe_epoch`. The remainder formula would then count the whole
   * pool as gateway reward; it must report no split instead.
   */
  it('reports no split for an epoch that has not been prescribed', () => {
    const { distributions: t, splitKnown } = epochRewardTotals({
      totalEligibleRewards: EPOCH_546.totalEligibleRewards,
      perGatewayReward: 0,
      perObserverReward: 0,
      observerCount: 0,
      prescriptionsDone: 0,
      observationsSubmitted: 0,
      rewardsDistributed: 0,
    });

    expect(splitKnown).toBe(false);

    expect(t.totalEligibleRewards).toEqual(EPOCH_546.totalEligibleRewards);
    expect(t.totalEligibleGatewayReward).toEqual(0);
    expect(t.totalEligibleObserverReward).toEqual(0);
    expect(t.totalEligibleGateways).toEqual(0);
  });

  /**
   * ADR-0034 addendum: an epoch nobody observed is marked complete and pays
   * nothing. It is prescribed first, so it keeps a full, plausible split that
   * was never paid — the reason this needs its own branch rather than falling
   * through to the real-split arithmetic below.
   */
  it('flags a distributed epoch with no observations as unpaid', () => {
    const r = epochRewardTotals({ ...EPOCH_546, observationsSubmitted: 0 });

    expect(r.skipped).toBe(true);
  });

  /**
   * The split it was prescribed is a real fact about the epoch, the eligible
   * count is read by other panels, and for a cached row this is the only
   * surviving copy once the account closes. Flagging the epoch must not
   * destroy it — the renderer decides what to draw.
   */
  it('keeps the split it was prescribed rather than zeroing it', () => {
    const skipped = epochRewardTotals({
      ...EPOCH_546,
      observationsSubmitted: 0,
    });
    const paid = epochRewardTotals(EPOCH_546);

    expect(skipped.distributions).toEqual(paid.distributions);
    expect(skipped.distributions.totalEligibleGateways).toBeGreaterThan(0);
  });

  /** Nobody has submitted *yet* is routine early in a live epoch. */
  it('does not call an undistributed epoch with no observations skipped', () => {
    const r = epochRewardTotals({
      ...EPOCH_546,
      observationsSubmitted: 0,
      rewardsDistributed: 0,
    });

    expect(r.skipped).toBe(false);
    expect(r.distributions.totalEligibleGatewayReward).toBeGreaterThan(0);
  });

  it('leaves an observed epoch alone', () => {
    expect(epochRewardTotals(EPOCH_546).skipped).toBe(false);
  });

  /**
   * A prescribed epoch with no eligible gateway keeps `per_gateway_reward` at
   * zero (epoch.rs, joined_count == 0). Inferring prescription from a non-zero
   * reward called that epoch pending forever; it is a known split of zero.
   */
  it('treats a prescribed epoch with no eligible gateway as a known zero split', () => {
    const r = epochRewardTotals({
      ...EPOCH_546,
      perGatewayReward: 0,
      perObserverReward: 0,
      observerCount: 0,
    });

    expect(r.splitKnown).toBe(true);
    expect(r.distributions.totalEligibleGatewayReward).toEqual(0);
    expect(r.distributions.totalEligibleGateways).toEqual(0);
  });

  /**
   * With gateways eligible but no observers selected, the observer share stays
   * in the treasury, so the remainder is not the gateway pool. It must not be
   * credited to gateways.
   */
  it('reports the split as unknown when no observers were selected', () => {
    const r = epochRewardTotals({
      ...EPOCH_546,
      perObserverReward: 0,
      observerCount: 0,
    });

    expect(r.splitKnown).toBe(false);
    expect(r.distributions.totalEligibleGatewayReward).toEqual(0);
  });

  it('never reports a negative gateway pool', () => {
    const { distributions: t } = epochRewardTotals({
      ...EPOCH_546,
      totalEligibleRewards: 0,
    });

    expect(t.totalEligibleGatewayReward).toEqual(0);
  });
});

const baseRow = (
  distributions: EpochDataWithCounters['distributions'],
  extra: Partial<EpochDataWithCounters> = {},
) =>
  ({
    epochIndex: 546,
    rewardsDistributed: 1,
    observationsSubmitted: 43,
    distributions,
    ...extra,
  }) as EpochDataWithCounters;

describe('upgradeCachedEpoch', () => {
  const correct = epochRewardTotals(EPOCH_546).distributions;

  /**
   * A row cached before this change stored the 2x gateway total and the slot
   * count. Returning visitors kept those in IndexedDB, which would have shown a
   * false halving at the boundary between cached and freshly read epochs.
   */
  it('recomputes a version-1 row exactly from its own fields', () => {
    const v1 = baseRow({
      totalEligibleGateways: ACTIVE_GATEWAY_COUNT,
      totalEligibleRewards: EPOCH_546.totalEligibleRewards,
      totalEligibleObserverReward:
        EPOCH_546.perObserverReward * EPOCH_546.observerCount,
      totalEligibleGatewayReward:
        EPOCH_546.perGatewayReward * ACTIVE_GATEWAY_COUNT,
    });

    const up = upgradeCachedEpoch(v1);

    expect(up.perGatewayReward).toEqual(EPOCH_546.perGatewayReward);
    expect(up.distributions).toEqual(correct);
    expect(up.rewardsPrescribed).toBe(true);
    expect(up.rewardsSplitKnown).toBe(true);
    expect(up.rewardTotalsVersion).toEqual(REWARD_TOTALS_VERSION);
  });

  /**
   * Version 2 rows inferred prescription from a non-zero reward and carry no
   * split flag. Every cached row was distributed, so it was prescribed.
   */
  it('re-derives a version-2 row, which may have mislabelled a zero-reward epoch', () => {
    const v2 = baseRow(
      {
        totalEligibleGateways: 0,
        totalEligibleRewards: 1_000,
        totalEligibleObserverReward: 0,
        totalEligibleGatewayReward: 0,
      },
      { perGatewayReward: 0, rewardsPrescribed: false, rewardTotalsVersion: 2 },
    );

    const up = upgradeCachedEpoch(v2);

    expect(up.rewardsPrescribed).toBe(true);
    expect(up.rewardsSplitKnown).toBe(true);
    expect(up.rewardTotalsVersion).toEqual(REWARD_TOTALS_VERSION);
  });

  /**
   * Rows written by the first revision of this fix carry `perGatewayReward`,
   * and their gateway total no longer encodes it, so it must be read directly.
   */
  it('uses perGatewayReward directly on a row that carries it', () => {
    const interim = baseRow(
      {
        totalEligibleGateways: ACTIVE_GATEWAY_COUNT,
        totalEligibleRewards: EPOCH_546.totalEligibleRewards,
        totalEligibleObserverReward:
          EPOCH_546.perObserverReward * EPOCH_546.observerCount,
        totalEligibleGatewayReward: correct.totalEligibleGatewayReward,
      },
      { perGatewayReward: EPOCH_546.perGatewayReward },
    );

    expect(upgradeCachedEpoch(interim).distributions).toEqual(correct);
  });

  it('returns a current row untouched, so reads do not rewrite it', () => {
    const current = baseRow(correct, {
      perGatewayReward: EPOCH_546.perGatewayReward,
      rewardsPrescribed: true,
      rewardsSplitKnown: true,
      rewardTotalsVersion: REWARD_TOTALS_VERSION,
    });

    expect(upgradeCachedEpoch(current)).toBe(current);
  });

  it('upgrades an old row that had no eligible gateways to a known zero split', () => {
    const empty = baseRow({
      totalEligibleGateways: 0,
      totalEligibleRewards: 1_000,
      totalEligibleObserverReward: 0,
      totalEligibleGatewayReward: 0,
    });

    const up = upgradeCachedEpoch(empty);

    // Distributed, so prescribed; nobody eligible, so a real split of zero.
    expect(up.rewardsPrescribed).toBe(true);
    expect(up.rewardsSplitKnown).toBe(true);
    expect(up.distributions.totalEligibleGatewayReward).toEqual(0);
  });

  it('is idempotent', () => {
    const v1 = baseRow({
      totalEligibleGateways: ACTIVE_GATEWAY_COUNT,
      totalEligibleRewards: EPOCH_546.totalEligibleRewards,
      totalEligibleObserverReward:
        EPOCH_546.perObserverReward * EPOCH_546.observerCount,
      totalEligibleGatewayReward:
        EPOCH_546.perGatewayReward * ACTIVE_GATEWAY_COUNT,
    });
    const once = upgradeCachedEpoch(v1);

    expect(upgradeCachedEpoch(once)).toBe(once);
  });
});

describe('upgradeCachedEpoch, skipped epochs', () => {
  /** A v3 row cached before the skip was understood reported a full payout. */
  it('relabels a cached zero-observation epoch as unpaid', () => {
    const v3 = baseRow(epochRewardTotals(EPOCH_546).distributions, {
      observationsSubmitted: 0,
      perGatewayReward: EPOCH_546.perGatewayReward,
      rewardsPrescribed: true,
      rewardsSplitKnown: true,
      rewardTotalsVersion: 3,
    });

    const up = upgradeCachedEpoch(v3);

    expect(up.rewardsSkipped).toBe(true);
    // Non-destructive: a row this gets wrong can still be re-derived later.
    expect(up.distributions.totalEligibleGatewayReward).toBeGreaterThan(0);
    expect(up.rewardTotalsVersion).toEqual(REWARD_TOTALS_VERSION);
  });

  it('leaves an observed cached epoch as a real split', () => {
    const v3 = baseRow(epochRewardTotals(EPOCH_546).distributions, {
      perGatewayReward: EPOCH_546.perGatewayReward,
      rewardTotalsVersion: 3,
    });

    const up = upgradeCachedEpoch(v3);

    expect(up.rewardsSkipped).toBe(false);
    expect(up.distributions.totalEligibleGatewayReward).toBeGreaterThan(0);
  });
});

describe('forfeitedGatewayReward', () => {
  const base = {
    failureCounts: [0, 20, 1, 19, 0],
    observationsSubmitted: 34,
    perGatewayReward: 100,
    rewardsDistributed: 1,
    totalEligibleGatewayReward: 10_000,
  };

  it('counts only the slots a majority of observers failed', () => {
    // 34 submissions, so the threshold is 17: slots at 20 and 19 failed,
    // the ones at 1 and 0 did not.
    expect(forfeitedGatewayReward(base)).toBe(200);
  });

  it('halves the submission count the way the program does', () => {
    // 7 submissions -> threshold 3, so 4 is a majority. Using 3.5 would not
    // count it and the forfeit would read zero.
    expect(
      forfeitedGatewayReward({
        ...base,
        observationsSubmitted: 7,
        failureCounts: [4],
      }),
    ).toBe(100);
    expect(
      forfeitedGatewayReward({
        ...base,
        observationsSubmitted: 7,
        failureCounts: [3],
      }),
    ).toBe(0);
  });

  it('never exceeds the pool it comes out of', () => {
    // `failureCounts` spans every registry slot; the pool covers only the
    // eligible ones, so enough failures would otherwise overdraw the bar.
    expect(
      forfeitedGatewayReward({
        ...base,
        failureCounts: new Array(500).fill(34),
        totalEligibleGatewayReward: 1_000,
      }),
    ).toBe(1_000);
  });

  it('is undefined — not zero — before the epoch distributes', () => {
    // A live epoch's verdict moves as observers report. Shading it would
    // redraw through the epoch and claim a forfeit that may never happen.
    expect(
      forfeitedGatewayReward({ ...base, rewardsDistributed: 0 }),
    ).toBeUndefined();
  });

  it('is undefined when nobody observed', () => {
    // The program's own guard. `isSkippedEpoch` already covers the epoch
    // that paid nothing at all.
    expect(
      forfeitedGatewayReward({ ...base, observationsSubmitted: 0 }),
    ).toBeUndefined();
  });

  it('is undefined without the tally, rather than claiming nothing was lost', () => {
    // A cached row from an older build, or the SDK fallback path. An
    // unshaded bar must mean "not known", never "nothing forfeited".
    expect(
      forfeitedGatewayReward({ ...base, failureCounts: undefined }),
    ).toBeUndefined();
    expect(
      forfeitedGatewayReward({ ...base, failureCounts: [] }),
    ).toBeUndefined();
  });

  it('is undefined when the epoch has no per-gateway reward', () => {
    expect(
      forfeitedGatewayReward({ ...base, perGatewayReward: 0 }),
    ).toBeUndefined();
  });

  it('reads a Uint16Array, which is what the account carries', () => {
    expect(
      forfeitedGatewayReward({
        ...base,
        failureCounts: new Uint16Array([20, 1, 19]),
      }),
    ).toBe(200);
  });
});

describe('forfeitedObserverReward', () => {
  const base = {
    observerCount: 50,
    observationsSubmitted: 34,
    perObserverReward: 200,
    rewardsDistributed: 1,
  };

  it('counts the prescribed observers that never submitted', () => {
    // 50 prescribed, 34 reported: 16 forfeited their share outright.
    expect(forfeitedObserverReward(base)).toBe(3_200);
  });

  it('is the whole pool when nobody submitted', () => {
    expect(forfeitedObserverReward({ ...base, observationsSubmitted: 0 })).toBe(
      10_000,
    );
  });

  it('is zero when every prescribed observer reported', () => {
    // Zero, not undefined: this is a known result, and the band must not
    // read as "unknown" for a fully observed epoch.
    expect(
      forfeitedObserverReward({ ...base, observationsSubmitted: 50 }),
    ).toBe(0);
  });

  it('never goes negative if more submitted than were prescribed', () => {
    expect(
      forfeitedObserverReward({ ...base, observationsSubmitted: 60 }),
    ).toBe(0);
  });

  it('is undefined before the epoch distributes', () => {
    expect(
      forfeitedObserverReward({ ...base, rewardsDistributed: 0 }),
    ).toBeUndefined();
  });

  it('is undefined without a submission count or an observer reward', () => {
    expect(
      forfeitedObserverReward({ ...base, observationsSubmitted: undefined }),
    ).toBeUndefined();
    expect(
      forfeitedObserverReward({ ...base, perObserverReward: 0 }),
    ).toBeUndefined();
    expect(
      forfeitedObserverReward({ ...base, observerCount: 0 }),
    ).toBeUndefined();
  });
});
