import { AoGateway, ARIOToken } from '@ar.io/sdk/web';
import {
  calculateGatewayRewards,
  calculateUserRewards,
  GatewayRewards,
} from '@src/utils/rewards';

describe('rewards.ts', () => {
  describe('calculateGatewayRewards', () => {
    it('should calculate gateway rewards correctly', () => {
      const protocolBalance = new ARIOToken(50_000_000);
      const totalGateways = 300;
      const gateway = {
        totalDelegatedStake: new ARIOToken(50000).toMARIO().valueOf(),
        settings: {
          delegateRewardShareRatio: 50,
        },
      } as AoGateway;

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
