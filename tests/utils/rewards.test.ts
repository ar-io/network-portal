import { ARIOToken, Gateway } from '@ar.io/sdk/web';
import {
  GatewayRewards,
  calculateGatewayRewards,
  calculateOperatorRewards,
  calculateUserRewards,
} from '@src/utils/rewards';

describe('rewards.ts', () => {
  describe('calculateGatewayRewards', () => {
    it('should return sentinel rewards when total gateways and delegated stake are zero', () => {
      const gateway = {
        totalDelegatedStake: 0,
        settings: {
          delegateRewardShareRatio: 50,
        },
      } as Gateway;

      const result = calculateGatewayRewards(
        new ARIOToken(50_000_000),
        0,
        gateway,
      );

      expect(result.totalDelegatedStake.valueOf()).toEqual(0);
      expect(result.rewardsSharedPerEpoch.valueOf()).toEqual(0);
      expect(result.EEY).toEqual(-1);
      expect(result.EAY).toEqual(-365);
    });

    it('should calculate gateway rewards correctly', () => {
      const protocolBalance = new ARIOToken(50_000_000);
      const totalGateways = 300;
      const gateway = {
        totalDelegatedStake: new ARIOToken(50000).toMARIO().valueOf(),
        settings: {
          delegateRewardShareRatio: 50,
        },
      } as Gateway;

      const result = calculateGatewayRewards(
        protocolBalance,
        totalGateways,
        gateway,
      );

      expect(result.totalDelegatedStake.valueOf()).toEqual(
        new ARIOToken(50000).valueOf(),
      );
      expect(result.rewardsSharedPerEpoch.valueOf()).toBeCloseTo(37.5, 1);
      expect(result.EEY).toBeCloseTo(0.004);
      expect(result.EAY).toBeCloseTo(0.27375);
    });
  });

  describe('calculateOperatorRewards', () => {
    it('should return sentinel rewards when total gateways and operator stake are zero', () => {
      const gateway = {
        totalDelegatedStake: 0,
        settings: {
          delegateRewardShareRatio: 50,
        },
      } as Gateway;
      const operatorStake = new ARIOToken(0);

      const result = calculateOperatorRewards(
        new ARIOToken(50_000_000),
        0,
        gateway,
        operatorStake,
      );

      expect(result.operatorStake).toBe(operatorStake);
      expect(result.rewardsSharedPerEpoch.valueOf()).toEqual(0);
      expect(result.EEY).toEqual(-1);
      expect(result.EAY).toEqual(-365);
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
  });
});
