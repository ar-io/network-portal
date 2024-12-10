import { AoGateway, IOToken, mIOToken } from '@ar.io/sdk/web';

const EPOCHS_PER_YEAR = 365;
const EPOCH_DISTRIBUTION_RATIO = 0.0005; // 0.05%
const GATEWAY_REWARDS_RATIO = 0.9; // 90%
// const OBSERVER_REWARDS_RATIO = .05; // 5%

export interface GatewayRewards {
  totalDelegatedStake: IOToken;
  rewardsSharedPerEpoch: IOToken;
  EEY: number;
  EAY: number;
}

export interface OperatorRewards {
  operatorStake: IOToken;
  rewardsSharedPerEpoch: IOToken;
  EEY: number;
  EAY: number;
}

export interface UserRewards {
  EEY: number;
  EAY: number;
}

/** Calculate operator rewards.
 * @param protocolBalance - The total balance of the protocol.
 * @param totalGateways - The total number of active gateways.
 * @param gateway - The gateway to calculate rewards for.
 * @param operatorStake - The operator's stake in the gateway in mARIO. Note: not reading this 
 * from gateway object as the amount of operator stake for rewards can be different from 
 * the gateway object (e.g., when adding/reducing operator's stake and needing to show 
 * user what the EAY will be.)
 */
export const calculateOperatorRewards = (
  protocolBalance: IOToken,
  totalGateways: number,
  gateway: AoGateway,
  operatorStake: IOToken,
): OperatorRewards => {
  const epochRewards = protocolBalance.valueOf() * EPOCH_DISTRIBUTION_RATIO;
  const baseGatewayReward =
    (epochRewards * GATEWAY_REWARDS_RATIO) / totalGateways;

  const gatewayRewardShareRatio =
    gateway.settings.delegateRewardShareRatio / 100;

  const rewardsSharedPerEpoch = new IOToken(
    baseGatewayReward * (1 - gatewayRewardShareRatio),
  );

  // Return -1 if totalDelegatedStake is 0. This signals 0 stake and allows calling
  // code to use the value for sorting purposes.
  const EEY =
    operatorStake.valueOf() > 0
      ? rewardsSharedPerEpoch.valueOf() / operatorStake.valueOf()
      : -1;
  const EAY = EEY * EPOCHS_PER_YEAR;

  return {
    operatorStake,
    rewardsSharedPerEpoch,
    EEY,
    EAY,
  };
};

export const calculateGatewayRewards = (
  protocolBalance: IOToken,
  totalGateways: number,
  gateway: AoGateway,
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
  removingStake = false,
): UserRewards => {
  const multiplier = removingStake ? -1 : 1;
  const delegatedStake = userDelegatedStake.valueOf() * multiplier;

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
