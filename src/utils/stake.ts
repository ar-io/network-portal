import { VaultData } from '@ar.io/sdk/web';

const MAX_EXPEDITED_WITHDRAWAL_PENALTY_RATE = 0.5;
const MIN_EXPEDITED_WITHDRAWAL_PENALTY_RATE = 0.1;

/**
 * The fee an expedited withdrawal pays, as a rate between the 50% floor and
 * the 10% minimum.
 *
 * **Clamped to that range, because the program clamps.** `instant_withdrawal`
 * has no maturity gate: it takes `min_penalty` once the full period has
 * elapsed, and otherwise `rate_after_decay.max(min_penalty).min(max_penalty)`
 * (withdrawal.rs). The decay alone keeps falling past maturity, so an
 * unclamped rate quoted a matured withdrawal a fee below 10% — 7.3% two days
 * past a 30-day period, and negative from 42 days on — while the chain still
 * charged 10%. A withdrawal that has matured should be claimed in full
 * instead; see `isWithdrawalUnlocked`.
 */
export const calculateInstantWithdrawalPenaltyRate = (
  vault: VaultData,
  date: Date,
) => {
  const elapsedTimeMs = Math.max(0, date.getTime() - vault.startTimestamp);
  const totalWithdrawalTimeMs = vault.endTimestamp - vault.startTimestamp;

  // A zero-length period is fully elapsed, not a division by zero.
  if (!(totalWithdrawalTimeMs > 0)) {
    return MIN_EXPEDITED_WITHDRAWAL_PENALTY_RATE;
  }

  const penaltyRate =
    MAX_EXPEDITED_WITHDRAWAL_PENALTY_RATE -
    (MAX_EXPEDITED_WITHDRAWAL_PENALTY_RATE -
      MIN_EXPEDITED_WITHDRAWAL_PENALTY_RATE) *
      (elapsedTimeMs / totalWithdrawalTimeMs);

  return Math.min(
    MAX_EXPEDITED_WITHDRAWAL_PENALTY_RATE,
    Math.max(MIN_EXPEDITED_WITHDRAWAL_PENALTY_RATE, penaltyRate),
  );
};

/**
 * Whether a withdrawal has matured and can be claimed in full.
 *
 * Nothing credits it automatically: on Solana `claim_withdrawal` must be
 * signed by the owner, where AO released a matured withdrawal by itself. A
 * matured withdrawal therefore sits in the table indefinitely until the user
 * acts, which is what made this look like lost tokens.
 *
 * `endTimestamp` is milliseconds — every hook feeding these tables goes
 * through the SDK's `secToMs`.
 */
export const isWithdrawalUnlocked = (
  endTimestamp: number,
  now: number = Date.now(),
) => endTimestamp <= now;

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
