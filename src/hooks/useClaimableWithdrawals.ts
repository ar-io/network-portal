import { mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useMemo } from 'react';
import useWithdrawals from './useWithdrawals';

/**
 * Matured withdrawals this wallet can claim right now, in ARIO.
 *
 * Exists so a claimable balance can be signalled on every page. Nothing pays a
 * matured vault out by itself — it takes a signed `claim_withdrawal` — and the
 * only place that said so was a card on the Balances page which renders solely
 * when there is already something to claim. A gateway operator whose 20,000
 * ARIO minimum stake matured in September reported it as lost tokens a month
 * later, having followed their gateway's URL, found the gateway gone from the
 * registry, and had nothing anywhere tell them a claim was waiting.
 *
 * **Withdrawals only, deliberately.** `ClaimableRewardsSection` also counts
 * unlocked locked-transfer vaults, which needs `useVaults` — the whole-program
 * scan served by the `vaults.json` snapshot. That is fine on one page; making
 * it a condition of rendering the header would download the snapshot for every
 * connected visitor on every route, to serve a rare state. `getWithdrawals` is
 * memcmp-filtered on the owner, so this costs one narrow read.
 *
 * The consequence to keep in mind: this can read zero while a matured vault
 * exists. It is a signal that there is something, never a statement of the
 * total — the Balances card remains the complete figure, and the copy here
 * points at it rather than quoting a number as final.
 */
const useClaimableWithdrawals = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data: withdrawals, isLoading } = useWithdrawals(
    walletAddress?.toString(),
  );

  return useMemo(() => {
    const now = Date.now();
    const matured = (withdrawals ?? []).filter(
      (withdrawal) => now >= withdrawal.endTimestamp,
    );

    const total = matured.reduce(
      (sum, withdrawal) =>
        sum + new mARIOToken(withdrawal.balance).toARIO().valueOf(),
      0,
    );

    return { count: matured.length, total, isLoading };
  }, [withdrawals, isLoading]);
};

export default useClaimableWithdrawals;
