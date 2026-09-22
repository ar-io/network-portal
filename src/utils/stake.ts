import { VaultData } from '@ar.io/sdk/web';

const MAX_EXPEDITED_WITHDRAWAL_PENALTY_RATE = 0.5;
const MIN_EXPEDITED_WITHDRAWAL_PENALTY_RATE = 0.1;

export const calculateInstantWithdrawalPenaltyRate = (
  vault: VaultData,
  date: Date,
) => {
  const elapsedTimeMs = Math.max(0, date.getTime() - vault.startTimestamp);
  const totalWithdrawalTimeMs = vault.endTimestamp - vault.startTimestamp;

  const penaltyRate =
    MAX_EXPEDITED_WITHDRAWAL_PENALTY_RATE -
    (MAX_EXPEDITED_WITHDRAWAL_PENALTY_RATE -
      MIN_EXPEDITED_WITHDRAWAL_PENALTY_RATE) *
      (elapsedTimeMs / totalWithdrawalTimeMs);

  return penaltyRate;
};

/**
 * Whether a redelegation clears the target gateway's minimum AFTER the fee,
 * and if not, the smallest amount that clears every rule the form enforces.
 *
 * `redelegate_stake` deducts the fee first and then requires
 * `net_amount >= min_delegation_amount`, but only when the wallet holds nothing
 * at the target (delegate.rs, L-4). So an amount that clears the minimum gross
 * can still be rejected on chain.
 *
 * A suggestion has to be one the user can actually submit. It is bounded by
 * `maxAmount`, and for a partial move from a stake it must leave the source
 * gateway's own minimum behind, the same rule the form checks first; where the
 * smallest clearing amount breaks that, moving everything is the only option.
 *
 * `feeRatePct` is a percentage (0-60), as the SDK reports it. Suggestions are
 * rounded UP to cents so they always clear.
 */
export type RedelegationShortfall = {
  net: number;
  /** The amount to suggest, or undefined when no amount the user holds works. */
  suggestion?: number;
  /** True when the suggestion is the whole position, not a partial move. */
  suggestionIsFullAmount: boolean;
};

export const redelegationShortfall = ({
  amount,
  feeRatePct,
  minDelegatedStake,
  targetHasPosition,
  maxAmount = Number.POSITIVE_INFINITY,
  sourceMinimum = 0,
  fromVault = false,
}: {
  amount: number;
  feeRatePct: number;
  minDelegatedStake: number;
  targetHasPosition: boolean;
  maxAmount?: number;
  sourceMinimum?: number;
  fromVault?: boolean;
}): RedelegationShortfall | null => {
  const feeRate = feeRatePct / 100;
  if (targetHasPosition || !(feeRate > 0) || feeRate >= 1) return null;

  const net = amount * (1 - feeRate);
  if (net >= minDelegatedStake) return null;

  const clears = (gross: number) => gross * (1 - feeRate) >= minDelegatedStake;
  const leavesSourceValid = (gross: number) =>
    fromVault || gross === maxAmount || maxAmount - gross >= sourceMinimum;

  const smallest = Math.ceil((minDelegatedStake / (1 - feeRate)) * 100) / 100;

  if (smallest <= maxAmount && leavesSourceValid(smallest)) {
    return { net, suggestion: smallest, suggestionIsFullAmount: false };
  }
  if (Number.isFinite(maxAmount) && clears(maxAmount)) {
    return { net, suggestion: maxAmount, suggestionIsFullAmount: true };
  }
  return { net, suggestion: undefined, suggestionIsFullAmount: false };
};
