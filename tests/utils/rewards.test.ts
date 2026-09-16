import { ARIOToken, Gateway } from '@ar.io/sdk/web';
import {
  GatewayRewards,
  calculateGatewayRewards,
  calculateOperatorRewards,
  calculateUserRewards,
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
});
