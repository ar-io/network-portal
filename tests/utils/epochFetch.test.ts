import { epochRewardTotals } from '@src/utils/epochFetch';

/** Mainnet epoch 546, read from the Epoch PDA on 2026-09-16. All mARIO. */
const EPOCH_546 = {
  totalEligibleRewards: 60_592_913_037,
  perObserverReward: 242_371_652,
  observerCount: 50,
  activeGatewayCount: 620,
  perGatewayReward: 158_412_844,
};

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
   * multiplies the per-gateway reward by every registry slot rather than by the
   * gateways eligible to earn. On this epoch that is 620 against 306.
   */
  it('does not multiply by the registry slot count, which overstated it 2x', () => {
    const t = epochRewardTotals(EPOCH_546);
    const old = EPOCH_546.perGatewayReward * EPOCH_546.activeGatewayCount;

    expect(old / t.totalEligibleGatewayReward).toBeCloseTo(2.03, 2);
    expect(old).toBeGreaterThan(EPOCH_546.totalEligibleRewards);
  });

  /** The unpublished divisor is recoverable from the corrected pool. */
  it('implies the 306 eligible gateways the protocol divided by', () => {
    const t = epochRewardTotals(EPOCH_546);

    expect(
      t.totalEligibleGatewayReward / EPOCH_546.perGatewayReward,
    ).toBeCloseTo(306, 4);
  });

  it('never reports a negative gateway pool', () => {
    const t = epochRewardTotals({
      totalEligibleRewards: 0,
      perObserverReward: 242_371_652,
      observerCount: 50,
      activeGatewayCount: 620,
    });

    expect(t.totalEligibleGatewayReward).toEqual(0);
  });
});
