import { Gateway, IOToken, mIOToken } from '@ar.io/sdk/web';

const EPOCHS_PER_YEAR = 52;
const EPOCH_DISTRIBUTION_RATIO = 0.0025; // 0.25%
const GATEWAY_REWARDS_RATIO = 0.95; // 95%
// const OBSERVER_REWARDS_RATIO = .05; // 5%

export interface GatewayRewards {
  totalDelegatedStake: IOToken;
  rewardsSharedPerEpoch: IOToken;
  EEY: number;
  EAY: number;
}

export interface UserRewards {
  EEY: number;
  EAY: number;
}

export const calculateGatewayRewards = (
  protocolBalance: IOToken,
  totalGateways: number,
  gateway: Gateway,
): GatewayRewards => {
  const epochRewards = protocolBalance.valueOf() * EPOCH_DISTRIBUTION_RATIO;
  const baseGatewayReward =
    (epochRewards * GATEWAY_REWARDS_RATIO) / totalGateways;

  const gatewayRewardShareRatio =
    gateway.settings.delegateRewardShareRatio / 100;
  const totalDelegatedStake = new mIOToken(gateway.totalDelegatedStake).toIO();

  const rewardsSharedPerEpoch = new IOToken(
    baseGatewayReward * gatewayRewardShareRatio,
  );

  // Return -1 if totalDelegatedStake is 0. This signals 0 stake and allows calling 
  // code to use the value for sorting purposes.
  const EEY =
    totalDelegatedStake.valueOf() > 0
      ? rewardsSharedPerEpoch.valueOf() / totalDelegatedStake.valueOf()
      : -1;
  const EAY = EEY * EPOCHS_PER_YEAR;

  return {
    totalDelegatedStake,
    rewardsSharedPerEpoch,
    EEY,
    EAY,
  };
};

export const calculateUserRewards = (
  gatewayRewards: GatewayRewards,
  userDelegatedStake: IOToken,
): UserRewards => {
  const delegatedStake = userDelegatedStake.valueOf();
  const stakeProportion =
    delegatedStake /
    (gatewayRewards.totalDelegatedStake.valueOf() + delegatedStake);
  const epochReward =
    gatewayRewards.rewardsSharedPerEpoch.valueOf() * stakeProportion;

  const EEY = epochReward / delegatedStake;
  const EAY = EEY * EPOCHS_PER_YEAR;

  return {
    EEY,
    EAY,
  };
};
