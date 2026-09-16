import { ARIOToken, Gateway, mARIOToken } from '@ar.io/sdk/web';

const EPOCHS_PER_YEAR = 365;

export interface GatewayRewards {
  totalDelegatedStake: ARIOToken;
  rewardsSharedPerEpoch: ARIOToken;
  EEY: number;
  EAY: number;
}

export interface OperatorRewards {
  operatorStake: ARIOToken;
  rewardsSharedPerEpoch: ARIOToken;
  EEY: number;
  EAY: number;
}

export interface UserRewards {
  EEY: number;
  EAY: number;
}

/**
 * Split a gateway's epoch reward between its operator and its delegates.
 *
 * `perGatewayReward` is read from the Epoch account, never reconstructed. The
 * protocol computes it as
 * `total_eligible_rewards * gateway_reward_ratio / RATE_SCALE / joined_count`,
 * and none of those three inputs is safe to assume:
 *
 * - `reward_rate` decays linearly from 0.1% to 0.05% per epoch, so it is a
 *   range rather than a constant (mainnet epoch 546 read 503 of 1,000,000).
 * - `gateway_reward_ratio` is governance-settable. Mainnet runs 80/20 against
 *   a program default of 90/10, so the old hardcoded 0.9 overstated by 12.5%.
 * - `joined_count` counts registry slots with a positive composite weight
 *   after tally and is never stored on chain, so it cannot be derived from a
 *   gateway list. Counting `joined` gateways happened to match at the time of
 *   writing; counting only those accepting delegation overstated by 24.9%,
 *   which is why the staking table and the staking modal disagreed.
 */
const delegateRewardsPerEpoch = (
  perGatewayReward: ARIOToken,
  gateway: Gateway,
): number => {
  const shareRatio = (gateway.settings?.delegateRewardShareRatio ?? 0) / 100;
  const value = perGatewayReward.valueOf() * shareRatio;

  return Number.isFinite(value) && value >= 0 ? value : 0;
};

/** Calculate operator rewards.
 * @param perGatewayReward - This epoch's per-gateway reward, in ARIO.
 * @param gateway - The gateway to calculate rewards for.
 * @param operatorStake - The operator's stake in the gateway in ARIO. Note: not reading this
 * from gateway object as the amount of operator stake for rewards can be different from
 * the gateway object (e.g., when adding/reducing operator's stake and needing to show
 * user what the EAY will be.)
 */
export const calculateOperatorRewards = (
  perGatewayReward: ARIOToken,
  gateway: Gateway,
  operatorStake: ARIOToken,
): OperatorRewards => {
  if (perGatewayReward.valueOf() <= 0) {
    const EEY = operatorStake.valueOf() > 0 ? 0 : -1;

    return {
      operatorStake,
      rewardsSharedPerEpoch: new ARIOToken(0),
      EEY,
      EAY: EEY * EPOCHS_PER_YEAR,
    };
  }

  const rewardsSharedPerEpoch = new ARIOToken(
    Math.max(
      0,
      perGatewayReward.valueOf() -
        delegateRewardsPerEpoch(perGatewayReward, gateway),
    ),
  );

  // Return -1 if operatorStake is 0. This signals 0 stake and allows calling
  // code to use the value for sorting purposes.
  const EEY =
    operatorStake.valueOf() > 0
      ? rewardsSharedPerEpoch.valueOf() / operatorStake.valueOf()
      : -1;

  return {
    operatorStake,
    rewardsSharedPerEpoch,
    EEY,
    EAY: EEY * EPOCHS_PER_YEAR,
  };
};

/**
 * @param perGatewayReward - This epoch's per-gateway reward, in ARIO.
 */
export const calculateGatewayRewards = (
  perGatewayReward: ARIOToken,
  gateway: Gateway,
): GatewayRewards => {
  const totalDelegatedStake = new mARIOToken(
    gateway.totalDelegatedStake,
  ).toARIO();

  if (perGatewayReward.valueOf() <= 0) {
    const EEY = totalDelegatedStake.valueOf() > 0 ? 0 : -1;

    return {
      totalDelegatedStake,
      rewardsSharedPerEpoch: new ARIOToken(0),
      EEY,
      EAY: EEY * EPOCHS_PER_YEAR,
    };
  }

  const rewardsSharedPerEpoch = new ARIOToken(
    delegateRewardsPerEpoch(perGatewayReward, gateway),
  );

  // Return -1 if totalDelegatedStake is 0. This signals 0 stake and allows calling
  // code to use the value for sorting purposes.
  const EEY =
    totalDelegatedStake.valueOf() > 0
      ? rewardsSharedPerEpoch.valueOf() / totalDelegatedStake.valueOf()
      : -1;

  return {
    totalDelegatedStake,
    rewardsSharedPerEpoch,
    EEY,
    EAY: EEY * EPOCHS_PER_YEAR,
  };
};

export const calculateUserRewards = (
  gatewayRewards: GatewayRewards,
  userDelegatedStake: ARIOToken,
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
