import { AoGateway, IOToken } from '@ar.io/sdk/web';
import {
  GatewayRewards,
  calculateGatewayRewards,
  calculateUserRewards,
} from '@src/utils/rewards';

describe('rewards.ts', () => {
  describe('calculateGatewayRewards', () => {
    it('should calculate gateway rewards correctly', () => {
      const protocolBalance = new IOToken(50_000_000);
      const totalGateways = 300;
      const gateway = {
        totalDelegatedStake: new IOToken(50000).toMIO().valueOf(),
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
        new IOToken(50000).valueOf(),
      );
      expect(result.rewardsSharedPerEpoch.valueOf()).toBeCloseTo(197.91, 1);
      expect(result.EEY).toBeCloseTo(0.004);
      expect(result.EAY).toBeCloseTo(1.4447916691);
    });
  });

  describe('calculateUserRewards', () => {
    it('should calculate user rewards correctly', () => {
      const gatewayRewards: GatewayRewards = {
        totalDelegatedStake: new IOToken(50000),
        rewardsSharedPerEpoch: new IOToken(197.91),
        EEY: 0.0038,
        EAY: 0.2058,
      };
      const userDelegatedStake = new IOToken(5000);

      const result = calculateUserRewards(gatewayRewards, userDelegatedStake);

      expect(result.EEY).toBeCloseTo(0.0036);
      expect(result.EAY).toBeCloseTo(1.3134027272727273);
    });
  });
});
