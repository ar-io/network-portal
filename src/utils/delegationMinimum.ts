import { mARIOToken } from '@ar.io/sdk/web';

/**
 * The smallest delegation the portal will submit, in ARIO.
 *
 * One rule in one place, because two callers now depend on it and they must
 * not drift: the staking form enforces it, and Smart Delegate must not rank a
 * gateway it would then refuse. Phase 0 of the Smart Delegate work exists
 * because a reward figure was derived two different ways in two places.
 *
 * `delegate_stake` applies the gateway's `min_delegation_amount` only when
 * `delegation.amount == 0`, read before the handler mutates it. So a wallet
 * already holding stake there may add any amount above zero, which is what
 * stops an operator raising their minimum from stranding delegators already
 * in. The program's own floor is 1 mARIO (`require!(amount > 0)`).
 *
 * The portal asks for 1 ARIO rather than 1 mARIO from an existing delegator,
 * matching every other stake form in the app. That is a portal convention, not
 * a protocol limit.
 */
export const EXISTING_DELEGATOR_MIN_ARIO = 1;

/**
 * The minimum this wallet must add to delegate to this gateway, in ARIO.
 *
 * `protocolMinStake` is the network floor beneath the gateway's own setting
 * (`delegates.minStake`), both in mARIO.
 */
export const minimumDelegationFor = ({
  gatewayMinDelegatedStake,
  protocolMinStake,
  hasExistingStake,
}: {
  /** `gateway.settings.minDelegatedStake`, in mARIO. */
  gatewayMinDelegatedStake: number | undefined;
  /** `delegates.minStake` from the registry settings, in mARIO. */
  protocolMinStake: number | undefined;
  /** Whether this wallet already holds delegated stake at this gateway. */
  hasExistingStake: boolean;
}): number => {
  if (hasExistingStake) {
    return EXISTING_DELEGATOR_MIN_ARIO;
  }

  const gatewayFloor = new mARIOToken(gatewayMinDelegatedStake ?? 0)
    .toARIO()
    .valueOf();
  const protocolFloor = new mARIOToken(protocolMinStake ?? 0)
    .toARIO()
    .valueOf();

  return Math.max(gatewayFloor, protocolFloor);
};
