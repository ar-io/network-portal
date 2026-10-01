import { ARIOToken, Gateway } from '@ar.io/sdk/web';
import {
  GatewayRewards,
  calculateGatewayRewards,
  calculateOperatorRewards,
  calculateUserRewards,
  knownYield,
  observedPassRate,
} from '@src/utils/rewards';

/**
 * Mainnet epoch 546, read from the Epoch PDA on 2026-09-16.
 * `per_gateway_reward` was 158_412_844 mARIO against a protocol balance of
 * 120,463,047.79 ARIO, a reward rate of 503/1e6, a gateway reward ratio of
 * 800_000/1e6 and 306 eligible gateways.
 */
const MAINNET_PER_GATEWAY_REWARD = new ARIOToken(158.412844);

const gatewayWith = (shareRatioPct: number, delegatedARIO: number): Gateway =>
  ({
    totalDelegatedStake: new ARIOToken(delegatedARIO).toMARIO().valueOf(),
    settings: { delegateRewardShareRatio: shareRatioPct },
  }) as Gateway;

/** The same gateway, plus the epoch record the weighting reads. */
const withHistory = (
  gateway: Gateway,
  passed: number,
  total: number,
): Gateway =>
  ({
    ...gateway,
    stats: { passedEpochCount: passed, totalEpochCount: total },
  }) as Gateway;

describe('rewards.ts', () => {
  describe('calculateGatewayRewards', () => {
    it('returns sentinel rewards when the per-gateway reward is unknown', () => {
      const result = calculateGatewayRewards(
        new ARIOToken(0),
        gatewayWith(50, 0),
      );

      expect(result.totalDelegatedStake.valueOf()).toEqual(0);
      expect(result.rewardsSharedPerEpoch.valueOf()).toEqual(0);
      expect(result.EEY).toEqual(-1);
      expect(result.EAY).toEqual(-365);
    });

    it('reports zero yield, not a sentinel, when stake exists but the reward is unknown', () => {
      const result = calculateGatewayRewards(
        new ARIOToken(0),
        gatewayWith(50, 50_000),
      );

      expect(result.rewardsSharedPerEpoch.valueOf()).toEqual(0);
      expect(result.EEY).toEqual(0);
    });

    it('shares the epoch reward in proportion to the reward share ratio', () => {
      const result = calculateGatewayRewards(
        new ARIOToken(150),
        gatewayWith(50, 50_000),
      );

      expect(result.totalDelegatedStake.valueOf()).toEqual(50_000);
      expect(result.rewardsSharedPerEpoch.valueOf()).toBeCloseTo(75, 6);
      expect(result.EEY).toBeCloseTo(0.0015, 6);
      expect(result.EAY).toBeCloseTo(0.5475, 6);
    });

    it('gives delegates nothing at a zero share ratio', () => {
      const result = calculateGatewayRewards(
        new ARIOToken(150),
        gatewayWith(0, 50_000),
      );

      expect(result.rewardsSharedPerEpoch.valueOf()).toEqual(0);
      expect(result.EEY).toEqual(0);
    });

    it('caps at the protocol maximum share ratio of 95 percent', () => {
      const result = calculateGatewayRewards(
        new ARIOToken(150),
        gatewayWith(95, 50_000),
      );

      expect(result.rewardsSharedPerEpoch.valueOf()).toBeCloseTo(142.5, 6);
    });

    /**
     * The reward the protocol pays is not recoverable from the protocol
     * balance. Reconstructing it needed three assumptions and two were wrong:
     * `reward_rate` is a decaying range rather than 0.0005, and mainnet's
     * `gateway_reward_ratio` is 80% against a hardcoded 90%.
     */
    it('matches the chain, where the old reconstruction overstated by 11.8 percent', () => {
      const PROTOCOL_BALANCE = 120_463_047.79;
      const JOINED = 306;
      const reconstructed = (PROTOCOL_BALANCE * 0.0005 * 0.9) / JOINED;

      expect(reconstructed).toBeCloseTo(177.15, 1);
      expect(
        reconstructed / MAINNET_PER_GATEWAY_REWARD.valueOf() - 1,
      ).toBeCloseTo(0.118, 2);
    });
  });

  describe('calculateOperatorRewards', () => {
    it('returns sentinel rewards when the per-gateway reward is unknown', () => {
      const operatorStake = new ARIOToken(0);
      const result = calculateOperatorRewards(
        new ARIOToken(0),
        gatewayWith(50, 0),
        operatorStake,
      );

      expect(result.operatorStake).toBe(operatorStake);
      expect(result.rewardsSharedPerEpoch.valueOf()).toEqual(0);
      expect(result.EEY).toEqual(-1);
      expect(result.EAY).toEqual(-365);
    });

    it('keeps the remainder of the epoch reward after the delegate share', () => {
      const result = calculateOperatorRewards(
        new ARIOToken(150),
        gatewayWith(50, 50_000),
        new ARIOToken(10_000),
      );

      expect(result.rewardsSharedPerEpoch.valueOf()).toBeCloseTo(75, 6);
      expect(result.EEY).toBeCloseTo(0.0075, 6);
    });

    /**
     * The protocol pays a delegate pool only when the gateway had delegated
     * stake at tally. Subtracting a share nobody is owed understated the
     * operator's yield for every gateway with delegation on and no delegates.
     */
    it('keeps the whole epoch reward when nobody delegates', () => {
      const result = calculateOperatorRewards(
        new ARIOToken(150),
        gatewayWith(50, 0),
        new ARIOToken(10_000),
      );

      expect(result.rewardsSharedPerEpoch.valueOf()).toBeCloseTo(150, 6);
    });

    it('keeps the whole epoch reward at a zero share ratio', () => {
      const result = calculateOperatorRewards(
        new ARIOToken(150),
        gatewayWith(0, 0),
        new ARIOToken(10_000),
      );

      expect(result.rewardsSharedPerEpoch.valueOf()).toBeCloseTo(150, 6);
    });

    /**
     * Operator and delegate shares are complementary, so a gateway's two
     * rewards must sum to the epoch reward at any ratio. The old signature
     * took the gateway count separately in each call, which is how the staking
     * table and the staking modal came to disagree by 24.9%.
     */
    it('splits the epoch reward without creating or losing any of it', () => {
      for (const ratio of [0, 1, 25, 50, 90, 95]) {
        const gateway = gatewayWith(ratio, 50_000);
        const delegate = calculateGatewayRewards(
          MAINNET_PER_GATEWAY_REWARD,
          gateway,
        );
        const operator = calculateOperatorRewards(
          MAINNET_PER_GATEWAY_REWARD,
          gateway,
          new ARIOToken(20_000),
        );

        expect(
          delegate.rewardsSharedPerEpoch.valueOf() +
            operator.rewardsSharedPerEpoch.valueOf(),
        ).toBeCloseTo(MAINNET_PER_GATEWAY_REWARD.valueOf(), 6);
      }
    });
  });

  describe('calculateUserRewards', () => {
    it('should calculate user rewards correctly', () => {
      const gatewayRewards: GatewayRewards = {
        totalDelegatedStake: new ARIOToken(50000),
        rewardsSharedPerEpoch: new ARIOToken(197.91),
        EEY: 0.0038,
        EAY: 0.2058,
      };
      const userDelegatedStake = new ARIOToken(5000);

      const result = calculateUserRewards(gatewayRewards, userDelegatedStake);

      expect(result.EEY).toBeCloseTo(0.0036);
      expect(result.EAY).toBeCloseTo(1.3134027272727273);
    });

    /** The projection the staking modal shows: yield after the new stake. */
    it('dilutes the yield by the amount being added', () => {
      const gatewayRewards = calculateGatewayRewards(
        MAINNET_PER_GATEWAY_REWARD,
        gatewayWith(50, 10_000),
      );

      const small = calculateUserRewards(gatewayRewards, new ARIOToken(1_000));
      const large = calculateUserRewards(gatewayRewards, new ARIOToken(90_000));

      expect(small.EAY).toBeGreaterThan(large.EAY);
      expect(large.EAY).toBeCloseTo(
        (gatewayRewards.rewardsSharedPerEpoch.valueOf() / 100_000) * 365,
        6,
      );
    });
  });

  describe('observedPassRate', () => {
    it('is the share of epochs the gateway was paid for', () => {
      expect(
        observedPassRate({
          stats: { passedEpochCount: 9, totalEpochCount: 10 },
        } as Gateway),
      ).toBe(0.9);
    });

    it('is undefined for a gateway with no epochs yet', () => {
      // No history is absence of evidence, not evidence of failure. A new
      // gateway must not be penalised for being new.
      expect(
        observedPassRate({
          stats: { passedEpochCount: 0, totalEpochCount: 0 },
        } as Gateway),
      ).toBeUndefined();
      expect(observedPassRate({} as Gateway)).toBeUndefined();
    });

    it('clamps rather than trusting the two counters against each other', () => {
      expect(
        observedPassRate({
          stats: { passedEpochCount: 12, totalEpochCount: 10 },
        } as Gateway),
      ).toBe(1);
    });
  });

  describe('yields weighted by the pass rate', () => {
    it('leaves a gateway with no history exactly as it was', () => {
      // The whole existing suite relies on this: an unweighted fixture must
      // keep its old numbers.
      const plain = gatewayWith(25, 1000);
      expect(
        calculateOperatorRewards(
          MAINNET_PER_GATEWAY_REWARD,
          plain,
          new ARIOToken(10000),
        ).EAY,
      ).toBe(
        calculateOperatorRewards(
          MAINNET_PER_GATEWAY_REWARD,
          withHistory(plain, 10, 10),
          new ARIOToken(10000),
        ).EAY,
      );
    });

    it('halves the operator yield for a gateway that passes half its epochs', () => {
      const stake = new ARIOToken(10000);
      const full = calculateOperatorRewards(
        MAINNET_PER_GATEWAY_REWARD,
        gatewayWith(25, 1000),
        stake,
      );
      const half = calculateOperatorRewards(
        MAINNET_PER_GATEWAY_REWARD,
        withHistory(gatewayWith(25, 1000), 5, 10),
        stake,
      );
      // 6 dp: ARIOToken quantises to mARIO, so expect ~1e-8 of rounding.
      expect(half.EAY).toBeCloseTo(full.EAY / 2, 6);
    });

    it('shrinks the delegate share by the same factor', () => {
      // A failed epoch pays neither side, so operator and delegates move
      // together rather than one absorbing the loss.
      const full = calculateGatewayRewards(
        MAINNET_PER_GATEWAY_REWARD,
        gatewayWith(50, 5000),
      );
      const half = calculateGatewayRewards(
        MAINNET_PER_GATEWAY_REWARD,
        withHistory(gatewayWith(50, 5000), 5, 10),
      );
      // 6 dp: ARIOToken quantises to mARIO, so expect ~1e-8 of rounding.
      expect(half.EAY).toBeCloseTo(full.EAY / 2, 6);
    });

    it("carries through to a delegate's own projected yield", () => {
      const half = calculateGatewayRewards(
        MAINNET_PER_GATEWAY_REWARD,
        withHistory(gatewayWith(50, 5000), 5, 10),
      );
      const full = calculateGatewayRewards(
        MAINNET_PER_GATEWAY_REWARD,
        gatewayWith(50, 5000),
      );
      const a = calculateUserRewards(half, new ARIOToken(100));
      const b = calculateUserRewards(full, new ARIOToken(100));
      expect(a.EAY).toBeLessThan(b.EAY);
    });

    it('reports zero — not a sentinel — for a gateway that has never passed', () => {
      // Distinct from "no reward this epoch". The reward exists; this gateway
      // does not collect it. Zero is the accurate number and must sort as one.
      const r = calculateOperatorRewards(
        MAINNET_PER_GATEWAY_REWARD,
        withHistory(gatewayWith(25, 1000), 0, 30),
        new ARIOToken(10000),
      );
      expect(r.EAY).toBe(0);
      expect(knownYield(r.EAY)).toBe(0);
    });

    it('matches the measured mainnet median', () => {
      // 95.4% was the median pass rate across 306 joined gateways on
      // 2026-10-01, so a typical yield moves by about -4.6%.
      const stake = new ARIOToken(10000);
      const full = calculateOperatorRewards(
        MAINNET_PER_GATEWAY_REWARD,
        gatewayWith(0, 0),
        stake,
      );
      const typical = calculateOperatorRewards(
        MAINNET_PER_GATEWAY_REWARD,
        withHistory(gatewayWith(0, 0), 954, 1000),
        stake,
      );
      expect(typical.EAY / full.EAY).toBeCloseTo(0.954, 6);
    });
  });

  describe('knownYield', () => {
    it('passes a real yield through, including zero', () => {
      expect(knownYield(0.0842)).toEqual(0.0842);
      expect(knownYield(0)).toEqual(0);
    });

    /**
     * -1 is `calculateGatewayRewards`' "no delegated stake" sentinel. A gateway
     * with no delegates has an undefined yield, not the lowest one, and a table
     * sorting ascending must not lead with it.
     */
    it('treats the no-stake sentinel as unknown rather than as a low yield', () => {
      expect(knownYield(-1)).toBeUndefined();
      expect(knownYield(-365)).toBeUndefined();
    });

    it('treats a non-finite yield as unknown', () => {
      expect(knownYield(Number.NaN)).toBeUndefined();
      expect(knownYield(Number.POSITIVE_INFINITY)).toBeUndefined();
    });

    /** Sorting relies on this: undefined is never comparable to a number. */
    it('never returns a value that sorts below a real yield', () => {
      const sentinel = calculateGatewayRewards(
        MAINNET_PER_GATEWAY_REWARD,
        gatewayWith(50, 0),
      ).EAY;
      const real = calculateGatewayRewards(
        MAINNET_PER_GATEWAY_REWARD,
        gatewayWith(1, 5_000_000),
      ).EAY;

      expect(sentinel).toBeLessThan(real);
      expect(knownYield(sentinel)).toBeUndefined();
      expect(knownYield(real)).toBeGreaterThan(0);
    });
  });
});
