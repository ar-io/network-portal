import {
  type EpochDataWithCounters,
  REWARD_TOTALS_VERSION,
  epochRewardTotals,
  upgradeCachedEpoch,
} from '@src/utils/epochFetch';

/** Mainnet epoch 546, read from the Epoch PDA on 2026-09-16. All mARIO. */
const EPOCH_546 = {
  totalEligibleRewards: 60_592_913_037,
  perGatewayReward: 158_412_844,
  perObserverReward: 242_371_652,
  observerCount: 50,
};
/** Every registry slot, leavers included. Not the reward divisor. */
const ACTIVE_GATEWAY_COUNT = 620;

describe('epochRewardTotals', () => {
  it('splits the epoch reward into two pools that sum to the total', () => {
    const t = epochRewardTotals(EPOCH_546);

    expect(
      t.totalEligibleGatewayReward + t.totalEligibleObserverReward,
    ).toEqual(EPOCH_546.totalEligibleRewards);
  });

  it('matches the ratios mainnet actually runs, 80/20', () => {
    const t = epochRewardTotals(EPOCH_546);

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
    const t = epochRewardTotals(EPOCH_546);
    const old = EPOCH_546.perGatewayReward * ACTIVE_GATEWAY_COUNT;

    expect(old / t.totalEligibleGatewayReward).toBeCloseTo(2.03, 2);
    expect(old).toBeGreaterThan(EPOCH_546.totalEligibleRewards);
  });

  it('reports the 306 gateways the protocol divided by, not 620 slots', () => {
    expect(epochRewardTotals(EPOCH_546).totalEligibleGateways).toEqual(306);
  });

  /**
   * `create_epoch` sets the total but leaves both per-unit rewards at zero
   * until `prescribe_epoch`. The remainder formula would then count the whole
   * pool as gateway reward; it must report no split instead.
   */
  it('reports no split for an epoch that has not been prescribed', () => {
    const t = epochRewardTotals({
      totalEligibleRewards: EPOCH_546.totalEligibleRewards,
      perGatewayReward: 0,
      perObserverReward: 0,
      observerCount: 0,
    });

    expect(t.totalEligibleRewards).toEqual(EPOCH_546.totalEligibleRewards);
    expect(t.totalEligibleGatewayReward).toEqual(0);
    expect(t.totalEligibleObserverReward).toEqual(0);
    expect(t.totalEligibleGateways).toEqual(0);
  });

  it('never reports a negative gateway pool', () => {
    const t = epochRewardTotals({ ...EPOCH_546, totalEligibleRewards: 0 });

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
    distributions,
    ...extra,
  }) as EpochDataWithCounters;

describe('upgradeCachedEpoch', () => {
  const correct = epochRewardTotals(EPOCH_546);

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
      rewardTotalsVersion: REWARD_TOTALS_VERSION,
    });

    expect(upgradeCachedEpoch(current)).toBe(current);
  });

  it('upgrades an old row that had no eligible gateways to an unsplit one', () => {
    const empty = baseRow({
      totalEligibleGateways: 0,
      totalEligibleRewards: 1_000,
      totalEligibleObserverReward: 0,
      totalEligibleGatewayReward: 0,
    });

    const up = upgradeCachedEpoch(empty);

    expect(up.rewardsPrescribed).toBe(false);
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
