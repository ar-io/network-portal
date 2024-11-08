import { AoVaultData } from '@ar.io/sdk/web';

const MAX_EXPEDITED_WITHDRAWAL_PENALTY_RATE = 0.5;
const MIN_EXPEDITED_WITHDRAWAL_PENALTY_RATE = 0.1;

export const calculateInstantWithdrawalPenaltyRate = (
  vault: AoVaultData,
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
