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
 * The delegates' share of a gateway's epoch reward, before dilution.
 *
 * This is the gateway reward only. A prescribed observer that submits also
 * earns `per_observer_reward`, split under the same ratio, and neither yield
 * here includes it; the EAY tooltip says so. It is left out because it depends
 * on being prescribed, which is a lottery weighted by stake, and a yield that
 * assumed it would overstate most gateways' returns.
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

  // The protocol carves out the delegate pool only when the gateway carried
  // delegated stake at tally (`split_scaled_reward`, `had_delegation_at_tally`
  // in distribution.rs). With no delegates the operator keeps the whole
  // reward, whatever the share ratio says. Live delegated stake stands in for
  // the tally snapshot, which the app does not read; the two differ only for a
  // gateway whose delegates all arrived or left within the current epoch.
  const delegatePool =
    (gateway.totalDelegatedStake ?? 0) > 0
      ? delegateRewardsPerEpoch(perGatewayReward, gateway)
      : 0;

  const rewardsSharedPerEpoch = new ARIOToken(
    Math.max(0, perGatewayReward.valueOf() - delegatePool),
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

/**
 * An EAY as a number, or `undefined` when there isn't one.
 *
 * Two different things produce "no yield" and neither is a small number.
 * `calculateGatewayRewards` returns -1 for a gateway with no delegated stake,
 * where the yield is undefined rather than low, and a caller with no
 * `perGatewayReward` has a yield that is unknown rather than zero.
 *
 * Tables must not sort either as a value. A -1 sorts below every real yield,
 * so ascending order (the direction someone picks to find the weakest
 * gateways) led with a block of N/A rows; on mainnet that is 134 of 245
 * gateways. Returning `undefined` lets `sortUndefined: 'last'` pin them to the
 * bottom in both directions.
 */
export const knownYield = (eay: number): number | undefined =>
  Number.isFinite(eay) && eay >= 0 ? eay : undefined;
