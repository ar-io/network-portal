import { ARIOToken, type GatewayWithAddress } from '@ar.io/sdk/web';
import {
  EPOCHS_PER_YEAR,
  MIN_EPOCH_HISTORY,
  RESULT_COUNT,
  SMART_DELEGATE_VERSION,
  STREAK_DECAY,
  expectedEAY,
  explainEmptyRanking,
  isEligible,
  rankGateways,
  streakPenalty,
} from '@src/utils/smartDelegate';

/**
 * The ranking engine behind Smart Delegate.
 *
 * Every case is a unit test: the engine is pure, so nothing is mocked beyond
 * these fixtures. Amounts the caller passes are ARIO; everything read off a
 * gateway is mARIO, which is where the 1e6 factors come from.
 */

const M = 1_000_000;

const gw = (over: Record<string, unknown> = {}): GatewayWithAddress => {
  const {
    address = 'GW1111111111111111111111111111111111111111',
    status = 'joined',
    totalDelegatedStake = 10_000 * M,
    allowDelegatedStaking = true,
    minDelegatedStake = 500 * M,
    delegateRewardShareRatio = 25,
    passedEpochCount = 300,
    totalEpochCount = 300,
    failedConsecutiveEpochs = 0,
  } = over as Record<string, never>;

  return {
    gatewayAddress: address,
    status,
    totalDelegatedStake,
    stats: { passedEpochCount, totalEpochCount, failedConsecutiveEpochs },
    settings: {
      allowDelegatedStaking,
      minDelegatedStake,
      delegateRewardShareRatio,
    },
  } as unknown as GatewayWithAddress;
};

const REWARD = new ARIOToken(100);
const NO_STAKE: Record<string, number> = {};

const eligible = (over = {}, extra = {}) =>
  isEligible({
    gateway: gw(over),
    walletAddress: 'WALLET1111111111111111111111111111111111111',
    amount: 1_000,
    protocolMinStake: 10 * M,
    existingStake: 0,
    ...extra,
  });

describe('streakPenalty', () => {
  it('is a no-op on a gateway with no current streak', () => {
    expect(streakPenalty(gw({ failedConsecutiveEpochs: 0 }))).toBe(1);
  });

  it('decays geometrically, reaching effectively zero before the prune threshold', () => {
    expect(streakPenalty(gw({ failedConsecutiveEpochs: 1 }))).toBeCloseTo(
      0.7,
      10,
    );
    expect(streakPenalty(gw({ failedConsecutiveEpochs: 3 }))).toBeCloseTo(
      0.343,
      10,
    );
    expect(streakPenalty(gw({ failedConsecutiveEpochs: 6 }))).toBeCloseTo(
      STREAK_DECAY ** 6,
      10,
    );
    // The prune threshold is 30 consecutive failures; by then this must be
    // indistinguishable from zero rather than merely reduced.
    expect(streakPenalty(gw({ failedConsecutiveEpochs: 30 }))).toBeLessThan(
      1e-4,
    );
  });

  it('is not linear against maxConsecutiveFailures', () => {
    // A linear scale against 30 would leave five failures at 0.83, which is
    // the mistake this constant exists to avoid.
    expect(streakPenalty(gw({ failedConsecutiveEpochs: 5 }))).toBeLessThan(0.2);
  });
});

describe('isEligible', () => {
  it('accepts a healthy gateway for an amount above both minimums', () => {
    expect(eligible()).toBe(true);
  });

  it('rejects a gateway that is leaving', () => {
    expect(eligible({ status: 'leaving' })).toBe(false);
  });

  it('rejects a gateway with delegation turned off', () => {
    expect(eligible({ allowDelegatedStaking: false })).toBe(false);
  });

  it('rejects the wallet’s own gateway', () => {
    expect(
      eligible({ address: 'WALLET1111111111111111111111111111111111111' }),
    ).toBe(false);
  });

  it('rejects an amount below the gateway minimum for a new delegator', () => {
    expect(eligible({}, { amount: 250 })).toBe(false);
  });

  it('rejects an amount below the protocol minimum even where the gateway asks less', () => {
    expect(eligible({ minDelegatedStake: 1 * M }, { amount: 5 })).toBe(false);
  });

  it('accepts an amount exactly at the minimum', () => {
    expect(eligible({}, { amount: 500 })).toBe(true);
  });

  // The PRD predates the on-chain fix and called this case ineligible.
  // `delegate_stake` now applies the gateway minimum only when
  // `delegation.amount == 0`, so excluding it would hide a delegation the
  // network accepts.
  it('accepts a below-minimum top-up where the wallet already delegates there', () => {
    expect(eligible({}, { amount: 250, existingStake: 3_845 * M })).toBe(true);
  });

  it('still rejects a top-up under the portal’s own 1 ARIO floor', () => {
    // The handoff is StakingModal, which asks an existing delegator for 1
    // ARIO. Ranking something the modal would refuse is worse than omitting it.
    expect(eligible({}, { amount: 0.5, existingStake: 3_845 * M })).toBe(false);
  });

  it('rejects zero and negative amounts whatever the standing', () => {
    expect(eligible({}, { amount: 0, existingStake: 3_845 * M })).toBe(false);
    expect(eligible({}, { amount: -1 })).toBe(false);
  });

  describe('allowlist gateways', () => {
    it('is accepted where the wallet already holds stake', () => {
      expect(
        eligible(
          { allowDelegatedStaking: 'allowlist' },
          { existingStake: 600 * M },
        ),
      ).toBe(true);
    });

    it('is omitted where it does not, rather than recommended and refused', () => {
      // The published snapshot carries no allowlist membership, so entitlement
      // is unknowable here. Omitting is the honest answer.
      expect(eligible({ allowDelegatedStaking: 'allowlist' })).toBe(false);
    });
  });

  describe('history floor', () => {
    it('rejects one epoch below the floor', () => {
      expect(eligible({ totalEpochCount: MIN_EPOCH_HISTORY - 1 })).toBe(false);
    });

    it('accepts exactly at the floor', () => {
      expect(eligible({ totalEpochCount: MIN_EPOCH_HISTORY })).toBe(true);
    });
  });
});

describe('expectedEAY', () => {
  const eay = (over = {}, amount = 1_000) =>
    expectedEAY({ gateway: gw(over), amount, perGatewayReward: REWARD });

  it('suppresses rather than estimates when there is no reward to divide', () => {
    expect(
      expectedEAY({
        gateway: gw(),
        amount: 1_000,
        perGatewayReward: undefined,
      }),
    ).toBeUndefined();
    expect(
      expectedEAY({
        gateway: gw(),
        amount: 1_000,
        perGatewayReward: new ARIOToken(0),
      }),
    ).toBeUndefined();
  });

  it('falls strictly as the amount rises', () => {
    const small = eay({}, 1_000) ?? 0;
    const large = eay({}, 50_000) ?? 0;
    expect(small).toBeGreaterThan(large);
  });

  it('prices a gateway with no delegated stake, where the amount is the whole denominator', () => {
    const value = eay({ totalDelegatedStake: 0 }, 1_000);
    expect(value).toBeDefined();
    expect(value).toBeGreaterThan(0);
  });

  it('barely moves when the amount is small against the existing pool', () => {
    const a = eay({ totalDelegatedStake: 10_000_000 * M }, 1_000) ?? 0;
    const b = eay({ totalDelegatedStake: 10_000_000 * M }, 2_000) ?? 0;
    expect(Math.abs(a - b) / a).toBeLessThan(0.001);
  });

  it('scales with the reward share, and is zero at a 0% share', () => {
    const low = eay({ delegateRewardShareRatio: 10 }) ?? 0;
    const high = eay({ delegateRewardShareRatio: 90 }) ?? 0;
    expect(high).toBeGreaterThan(low);
    expect(eay({ delegateRewardShareRatio: 0 })).toBe(0);
  });

  it('weights by pass rate, so a failing record pays less', () => {
    const perfect = eay({ passedEpochCount: 300, totalEpochCount: 300 }) ?? 0;
    const spotty = eay({ passedEpochCount: 150, totalEpochCount: 300 }) ?? 0;
    expect(spotty).toBeCloseTo(perfect / 2, 6);
  });

  it('applies the streak penalty on top of lifetime pass rate', () => {
    const healthy = eay({ failedConsecutiveEpochs: 0 }) ?? 0;
    const struggling = eay({ failedConsecutiveEpochs: 3 }) ?? 0;
    expect(struggling).toBeCloseTo(healthy * STREAK_DECAY ** 3, 6);
  });
});

describe('rankGateways', () => {
  const rank = (gateways: GatewayWithAddress[], amount = 1_000, extra = {}) =>
    rankGateways({
      gateways,
      amount,
      perGatewayReward: REWARD,
      walletAddress: 'WALLET1111111111111111111111111111111111111',
      protocolMinStake: 10 * M,
      existingStakeByGateway: NO_STAKE,
      ...extra,
    });

  it('orders by expected yield, descending', () => {
    const results = rank([
      gw({ address: 'A', delegateRewardShareRatio: 10 }),
      gw({ address: 'B', delegateRewardShareRatio: 90 }),
      gw({ address: 'C', delegateRewardShareRatio: 50 }),
    ]);
    expect(results.map((r) => r.gateway.gatewayAddress)).toEqual([
      'B',
      'C',
      'A',
    ]);
  });

  it('caps at RESULT_COUNT', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      gw({ address: `G${i}`, delegateRewardShareRatio: 10 + i }),
    );
    expect(rank(many)).toHaveLength(RESULT_COUNT);
  });

  it('is stable for identical inputs, including ties', () => {
    // Gateways identical in every displayed figure now collapse to one row,
    // so stability shows up as which one survives: the tie-break is the
    // address, so it is always the same one and never reshuffles on re-render.
    const tied = [
      gw({ address: 'ZZZ' }),
      gw({ address: 'AAA' }),
      gw({ address: 'MMM' }),
    ];
    const once = rank(tied);
    const twice = rank(tied);
    expect(once.map((r) => r.gateway.gatewayAddress)).toEqual(
      twice.map((r) => r.gateway.gatewayAddress),
    );
    expect(once.map((r) => r.gateway.gatewayAddress)).toEqual(['AAA']);
    expect(once[0].similarCount).toBe(3);
  });

  it('returns only gateways that pass isEligible for the amount asked', () => {
    const results = rank(
      [
        gw({ address: 'OK' }),
        gw({ address: 'LEAVING', status: 'leaving' }),
        gw({ address: 'CLOSED', allowDelegatedStaking: false }),
        gw({ address: 'NEW', totalEpochCount: 5 }),
      ],
      1_000,
    );
    expect(results.map((r) => r.gateway.gatewayAddress)).toEqual(['OK']);
  });

  it('drops a gateway whose yield cannot be computed rather than ranking it last', () => {
    const results = rankGateways({
      gateways: [gw({ address: 'A' })],
      amount: 1_000,
      perGatewayReward: undefined,
      walletAddress: undefined,
      protocolMinStake: 10 * M,
      existingStakeByGateway: NO_STAKE,
    });
    expect(results).toEqual([]);
  });

  it('marks a gateway holding no delegated stake', () => {
    const [result] = rank([gw({ address: 'EMPTY', totalDelegatedStake: 0 })]);
    expect(result.noDelegatesYet).toBe(true);
    expect(result.totalDelegatedStake).toBe(0);
  });

  it('stamps every result with the model version', () => {
    for (const r of rank([gw()])) {
      expect(r.version).toBe(SMART_DELEGATE_VERSION);
    }
  });

  it('reports the inputs behind the headline, so a user can recompute it', () => {
    const [r] = rank([
      gw({
        address: 'A',
        passedEpochCount: 280,
        totalEpochCount: 300,
        failedConsecutiveEpochs: 2,
        delegateRewardShareRatio: 40,
        totalDelegatedStake: 5_000 * M,
      }),
    ]);
    expect(r.passedEpochCount).toBe(280);
    expect(r.totalEpochCount).toBe(300);
    expect(r.passRate).toBeCloseTo(280 / 300, 10);
    expect(r.failedConsecutiveEpochs).toBe(2);
    expect(r.rewardShareRatio).toBe(40);
    expect(r.totalDelegatedStake).toBe(5_000);
  });

  describe('the Horizon case', () => {
    it('ranks a long current streak below a slightly worse lifetime rate with no streak', () => {
      // A gateway on a 12-epoch failure streak still reads 0.87 lifetime after
      // hundreds of good epochs. Raw lifetime rate would promote it.
      const results = rank([
        gw({
          address: 'HORIZON',
          passedEpochCount: 435,
          totalEpochCount: 500,
          failedConsecutiveEpochs: 12,
        }),
        gw({
          address: 'STEADY',
          passedEpochCount: 400,
          totalEpochCount: 500,
          failedConsecutiveEpochs: 0,
        }),
      ]);
      expect(results[0].gateway.gatewayAddress).toBe('STEADY');
    });
  });

  describe('the amount and the ordering', () => {
    it('reorders gateways that already hold stake', () => {
      const gateways = [
        gw({
          address: 'BIG',
          totalDelegatedStake: 1_000_000 * M,
          delegateRewardShareRatio: 90,
        }),
        gw({
          address: 'SMALL',
          totalDelegatedStake: 1_000 * M,
          delegateRewardShareRatio: 30,
        }),
      ];
      const atSmall = rank(gateways, 500).map((r) => r.gateway.gatewayAddress);
      const atHuge = rank(gateways, 5_000_000).map(
        (r) => r.gateway.gatewayAddress,
      );
      expect(atSmall).not.toEqual(atHuge);
    });

    it('leaves gateways with no delegated stake in the same order at any amount', () => {
      // Where delegated stake is zero the amount is the whole denominator, so
      // it cancels out of every comparison between such gateways. Asserting
      // reordering globally would fail for exactly this reason.
      const empties = [
        gw({
          address: 'E1',
          totalDelegatedStake: 0,
          delegateRewardShareRatio: 20,
        }),
        gw({
          address: 'E2',
          totalDelegatedStake: 0,
          delegateRewardShareRatio: 60,
        }),
        gw({
          address: 'E3',
          totalDelegatedStake: 0,
          delegateRewardShareRatio: 40,
        }),
      ];
      const small = rank(empties, 500).map((r) => r.gateway.gatewayAddress);
      const large = rank(empties, 250_000).map((r) => r.gateway.gatewayAddress);
      expect(small).toEqual(large);
      expect(small).toEqual(['E2', 'E3', 'E1']);
    });
  });

  it('honours an existing position when applying the minimum', () => {
    const gateway = gw({ address: 'HELD', minDelegatedStake: 500 * M });
    expect(rank([gateway], 250)).toEqual([]);
    const withStake = rank([gateway], 250, {
      existingStakeByGateway: { HELD: 3_845 * M },
    });
    expect(withStake).toHaveLength(1);
    expect(withStake[0].existingStake).toBe(3_845);
  });
});

describe('explainEmptyRanking', () => {
  const explain = (
    gateways: GatewayWithAddress[],
    amount: number,
    extra = {},
  ) =>
    explainEmptyRanking({
      gateways,
      amount,
      perGatewayReward: REWARD,
      walletAddress: 'WALLET1111111111111111111111111111111111111',
      protocolMinStake: 10 * M,
      existingStakeByGateway: NO_STAKE,
      ...extra,
    });

  it('names the amount when it is below every minimum, and the figure that would work', () => {
    const reason = explain(
      [
        gw({ address: 'A', minDelegatedStake: 500 * M }),
        gw({ address: 'B', minDelegatedStake: 900 * M }),
      ],
      100,
    );
    expect(reason.kind).toBe('amountBelowEveryMinimum');
    if (reason.kind === 'amountBelowEveryMinimum') {
      // The lowest bar, not the highest — it is the one the user can clear.
      expect(reason.lowestMinimum).toBe(500);
    }
  });

  it('blames the missing reward before blaming the amount', () => {
    // A suppressed reward is ours to fix; telling the user to raise their
    // amount would send them chasing a problem they do not have.
    const reason = explainEmptyRanking({
      gateways: [gw()],
      amount: 1,
      perGatewayReward: undefined,
      walletAddress: undefined,
      protocolMinStake: 10 * M,
      existingStakeByGateway: NO_STAKE,
    });
    expect(reason.kind).toBe('noRewardAvailable');
  });

  it('reports an empty roster distinctly from an empty result', () => {
    expect(explain([], 1_000).kind).toBe('noGateways');
  });

  it('falls back to nothingEligible when the amount is not the obstacle', () => {
    const reason = explain([gw({ status: 'leaving' })], 1_000_000);
    expect(reason.kind).toBe('nothingEligible');
  });

  it('accounts for an existing position when reporting the lowest minimum', () => {
    const reason = explain(
      [gw({ address: 'HELD', minDelegatedStake: 900 * M })],
      0.5,
      {
        existingStakeByGateway: { HELD: 3_845 * M },
      },
    );
    expect(reason.kind).toBe('amountBelowEveryMinimum');
    if (reason.kind === 'amountBelowEveryMinimum') {
      expect(reason.lowestMinimum).toBe(1);
    }
  });
});

describe('the displayed unit', () => {
  const rank = (over = {}, amount = 1_000) =>
    rankGateways({
      gateways: [gw(over)],
      amount,
      perGatewayReward: REWARD,
      walletAddress: 'WALLET1111111111111111111111111111111111111',
      protocolMinStake: 10 * M,
      existingStakeByGateway: NO_STAKE,
    })[0];

  it('reports the next epoch in ARIO, which is the annual figure undone', () => {
    const r = rank();
    expect(r.expectedEpochReward).toBeCloseTo(
      (r.expectedEAY * 1_000) / EPOCHS_PER_YEAR,
      9,
    );
  });

  it('keeps the per-epoch figure modest where the annual one is absurd', () => {
    // The live-mainnet case that made the annual headline unshippable: an
    // empty gateway and a small delegation annualise past 600%.
    const r = rank(
      {
        totalDelegatedStake: 0,
        delegateRewardShareRatio: 1,
        minDelegatedStake: 10 * M,
      },
      100,
    );
    expect(r.expectedEAY).toBeGreaterThan(3); // >300% a year
    expect(r.expectedEpochReward).toBeLessThan(2); // ~1 ARIO tomorrow
  });

  it('reports owning the whole pool where the gateway has no delegates', () => {
    expect(rank({ totalDelegatedStake: 0 }, 1_000).poolShare).toBe(1);
  });

  it('reports a small share of a large pool', () => {
    const r = rank({ totalDelegatedStake: 999_000 * M }, 1_000);
    expect(r.poolShare).toBeCloseTo(0.001, 6);
  });

  it('ties the pool share to the dilution it predicts', () => {
    // Owning half the pool means one equal delegator halves the share, which
    // is the claim the card makes in words.
    const r = rank({ totalDelegatedStake: 1_000 * M }, 1_000);
    expect(r.poolShare).toBeCloseTo(0.5, 9);
  });
});

describe('near-duplicate results', () => {
  const rank = (gateways: GatewayWithAddress[], amount = 100) =>
    rankGateways({
      gateways,
      amount,
      perGatewayReward: REWARD,
      walletAddress: 'WALLET1111111111111111111111111111111111111',
      protocolMinStake: 10 * M,
      existingStakeByGateway: NO_STAKE,
    });

  // The live mainnet case: one operator brand's fleet swept every slot with
  // identical figures, because ties break on address and siblings sort
  // together.
  const sibling = (addr: string) =>
    gw({
      address: addr,
      totalDelegatedStake: 0,
      delegateRewardShareRatio: 1,
      minDelegatedStake: 10 * M,
      passedEpochCount: 118,
      totalEpochCount: 121,
    });

  it('shows one of a fleet of identical gateways, not three', () => {
    const results = rank([
      sibling('SOL03'),
      sibling('SOL07'),
      sibling('SOL08'),
      gw({
        address: 'DIFFERENT',
        totalDelegatedStake: 0,
        delegateRewardShareRatio: 40,
        minDelegatedStake: 10 * M,
      }),
    ]);
    const shown = results.map((r) => r.gateway.gatewayAddress);
    const siblingsShown = shown.filter((a) => a.startsWith('SOL')).length;
    expect(siblingsShown).toBe(1);
    expect(shown).toContain('DIFFERENT');
  });

  it('keeps gateways that merely rank near each other but differ', () => {
    // Same reward, different share and different pool: a real choice.
    const results = rank(
      [
        gw({
          address: 'A',
          delegateRewardShareRatio: 50,
          totalDelegatedStake: 10_000 * M,
        }),
        gw({
          address: 'B',
          delegateRewardShareRatio: 10,
          totalDelegatedStake: 2_000 * M,
        }),
      ],
      1_000,
    );
    expect(results).toHaveLength(2);
  });

  it('never drops a better gateway in favour of one ranked below it', () => {
    const results = rank([
      sibling('SOL03'),
      sibling('SOL07'),
      gw({
        address: 'BEST',
        totalDelegatedStake: 0,
        delegateRewardShareRatio: 90,
        minDelegatedStake: 10 * M,
      }),
    ]);
    expect(results[0].gateway.gatewayAddress).toBe('BEST');
  });

  it('collapses a uniform roster to one row that says what it stands for', () => {
    // Three identical gateways and nothing else. One row saying "3 similar"
    // beats three rows saying the same thing.
    const results = rank([
      sibling('SOL03'),
      sibling('SOL07'),
      sibling('SOL08'),
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].similarCount).toBe(3);
  });

  it('counts a distinct gateway as standing only for itself', () => {
    const [only] = rank([gw({ minDelegatedStake: 10 * M })], 1_000);
    expect(only.similarCount).toBe(1);
  });
});
