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
 * Whether a redelegation clears the target gateway's minimum AFTER the fee.
 *
 * `redelegate_stake` deducts the fee first and then requires
 * `net_amount >= min_delegation_amount`, but only when the wallet holds nothing
 * at the target (delegate.rs, L-4). So an amount that clears the minimum gross
 * can still be rejected on chain.
 *
 * Returns null when the amount is fine, otherwise the net that would arrive and
 * the smallest gross that works, rounded UP to cents so the suggestion always
 * clears. `feeRatePct` is a percentage (0-60), as the SDK reports it.
 */
export const redelegationShortfall = ({
  amount,
  feeRatePct,
  minDelegatedStake,
  targetHasPosition,
}: {
  amount: number;
  feeRatePct: number;
  minDelegatedStake: number;
  targetHasPosition: boolean;
}): { net: number; smallestGross: number } | null => {
  const feeRate = feeRatePct / 100;
  if (targetHasPosition || !(feeRate > 0) || feeRate >= 1) return null;

  const net = amount * (1 - feeRate);
  if (net >= minDelegatedStake) return null;

  return {
    net,
    smallestGross: Math.ceil((minDelegatedStake / (1 - feeRate)) * 100) / 100,
  };
};
