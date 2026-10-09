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
 *
 * The decay is measured across this vault's own start and end. The program
 * measures it across `settings.withdrawal_period` from `created_at`, which is
 * the same span for every vault this quote is offered on — a stake decrease.
 * It diverges for the 90-day protected exit vault, where `instant_withdrawal`
 * refuses outright (`ProtectedVault`), and for a vault outliving an
 * `admin_set_withdrawal_period` change.
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
 * How far past maturity a withdrawal must be before the expedited option is
 * withdrawn.
 *
 * The chain gates on `Clock::unix_timestamp`, a stake-weighted validator
 * estimate, while this comparison uses the browser's clock, which is whatever
 * the machine says. Claim is offered the moment the browser thinks it is due —
 * a rejected claim costs nothing but a retry — but expediting is only taken
 * away once the two clocks cannot plausibly disagree, so a user whose clock
 * runs fast is never left with no working action.
 */
export const UNLOCK_SKEW_MARGIN_MS = 2 * 60 * 1000;

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
 * Whether expediting is worth offering on this vault.
 *
 * Two reasons it is not. Past the unlock (plus `UNLOCK_SKEW_MARGIN_MS`)
 * claiming returns the full amount, so expediting is only a way to pay the
 * penalty for nothing. And a **protected** vault — the minimum operator stake
 * of a departing gateway — is rejected outright:
 * `require!(!withdrawal.is_protected, GarError::ProtectedVault)`
 * (withdrawal.rs:66). Offering it there is offering a transaction that cannot
 * succeed for the whole leave period, which is what a gateway operator hit.
 *
 * Takes the vault rather than a timestamp so the flag cannot be left out. The
 * SDK made `isProtected` required for the same reason: read as `undefined` it
 * is falsy, and the bug comes straight back with nothing to catch it.
 */
export const canStillExpedite = (
  vault: { endTimestamp: number; isProtected: boolean },
  now: number = Date.now(),
) => !vault.isProtected && vault.endTimestamp + UNLOCK_SKEW_MARGIN_MS > now;

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
