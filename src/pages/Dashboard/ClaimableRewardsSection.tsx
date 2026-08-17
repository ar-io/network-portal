import { mARIOToken } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import { LinkArrowIcon } from '@src/components/icons';
import { WRITE_OPTIONS } from '@src/constants';
import useVaults from '@src/hooks/useVaults';
import useWithdrawals from '@src/hooks/useWithdrawals';
import { useGlobalState } from '@src/store';
import { formatWithCommas, getTransactionExplorerUrl } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

type TxResult = {
  txid: string;
  label: string;
};

type ActionFeedback = {
  kind: 'success' | 'error';
  text: string;
};

/**
 * Detect a deliberate wallet decline across the adapters we support (Phantom,
 * Solflare, Backpack, Ledger). When the user cancels a signature we stop the
 * batch rather than re-prompting for every remaining item; other errors are
 * treated as per-item failures and don't halt the rest.
 */
const isUserRejection = (error: unknown): boolean => {
  const err = error as
    | { code?: number; name?: string; message?: string }
    | undefined;
  if (err?.code === 4001) {
    return true;
  }
  const text =
    `${err?.name ?? ''} ${err?.message ?? error ?? ''}`.toLowerCase();
  return /reject|declin|deni|cancel/.test(text);
};

const ClaimableRewardsSection = () => {
  const queryClient = useQueryClient();
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals(
    walletAddress?.toString(),
  );
  const { data: allVaults, isLoading: vaultsLoading } = useVaults();

  const [isProcessingRewards, setIsProcessingRewards] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionFeedback>();
  const [recentTxs, setRecentTxs] = useState<Array<TxResult>>([]);

  const claimableWithdrawals = useMemo(() => {
    if (!withdrawals) {
      return [];
    }

    const now = Date.now();
    return withdrawals.filter((withdrawal) => now >= withdrawal.endTimestamp);
  }, [withdrawals]);

  const unlockedVaults = useMemo(() => {
    if (!allVaults || !walletAddress) {
      return [];
    }

    const now = Date.now();
    return allVaults.filter(
      (vault) =>
        vault.address === walletAddress.toString() && now >= vault.endTimestamp,
    );
  }, [allVaults, walletAddress]);

  const claimableWithdrawalAmount = useMemo(() => {
    return claimableWithdrawals.reduce((sum, withdrawal) => {
      return sum + new mARIOToken(withdrawal.balance).toARIO().valueOf();
    }, 0);
  }, [claimableWithdrawals]);

  const claimableVaultAmount = useMemo(() => {
    return unlockedVaults.reduce((sum, vault) => {
      return sum + new mARIOToken(vault.balance).toARIO().valueOf();
    }, 0);
  }, [unlockedVaults]);

  const hasClaimableRewards =
    claimableWithdrawals.length > 0 || unlockedVaults.length > 0;
  const totalClaimableAmount = claimableWithdrawalAmount + claimableVaultAmount;

  const refreshRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    queryClient.invalidateQueries({ queryKey: ['vaults'] });
    queryClient.invalidateQueries({ queryKey: ['balances'] });
    queryClient.invalidateQueries({ queryKey: ['delegateStakes'] });
    queryClient.invalidateQueries({ queryKey: ['gatewayVaults'] });
  };

  const claimAllRewards = async () => {
    if (!walletAddress || isProcessingRewards) {
      return;
    }

    if (!arIOWriteableSDK) {
      const message = 'Connect a signing wallet before claiming rewards.';
      showErrorToast(message);
      setActionMessage({ kind: 'error', text: message });
      return;
    }

    if (claimableWithdrawals.length === 0 && unlockedVaults.length === 0) {
      const message =
        'No unlocked vaults or matured withdrawals are available yet.';
      showErrorToast(message);
      setActionMessage({ kind: 'error', text: message });
      return;
    }

    setIsProcessingRewards(true);
    setActionMessage(undefined);

    // Alias the (now-guaranteed non-null) SDK so the task closures below keep
    // the narrowed type.
    const sdk = arIOWriteableSDK;

    // One resilient work list for withdrawals + vaults. Each entry is an
    // independent transaction with its own wallet signature, so we run them
    // one at a time and isolate failures: a single failed release/claim must
    // not strand the rest of the batch.
    const tasks = [
      ...claimableWithdrawals.map((withdrawal) => ({
        kind: 'withdrawal' as const,
        noun: `withdrawal ${withdrawal.vaultId}`,
        amount: new mARIOToken(withdrawal.balance).toARIO().valueOf(),
        run: () =>
          sdk.claimWithdrawal(
            { withdrawalId: withdrawal.vaultId },
            WRITE_OPTIONS,
          ),
      })),
      ...unlockedVaults.map((vault) => ({
        kind: 'vault' as const,
        noun: `vault ${vault.vaultId}`,
        amount: new mARIOToken(vault.balance).toARIO().valueOf(),
        run: () => sdk.releaseVault({ vaultId: vault.vaultId }, WRITE_OPTIONS),
      })),
    ];

    const txs: Array<TxResult> = [];
    const failures: Array<{ noun: string; message: string }> = [];
    let claimedWithdrawals = 0;
    let releasedVaults = 0;
    let processedAmount = 0;
    let cancelled = false;

    try {
      for (const task of tasks) {
        try {
          const { id } = await task.run();
          if (task.kind === 'withdrawal') {
            claimedWithdrawals += 1;
            txs.push({ txid: id, label: `Claimed ${task.noun}` });
          } else {
            releasedVaults += 1;
            txs.push({ txid: id, label: `Released ${task.noun}` });
          }
          processedAmount += task.amount;
        } catch (error) {
          // A declined signature is a deliberate stop — don't keep prompting
          // for every remaining item.
          if (isUserRejection(error)) {
            cancelled = true;
            break;
          }
          failures.push({ noun: task.noun, message: `${error}` });
        }
      }

      const succeeded = claimedWithdrawals + releasedVaults;

      if (succeeded > 0) {
        setRecentTxs((prev) => [...txs, ...prev].slice(0, 8));
        refreshRelatedQueries();
      }

      if (failures.length > 0) {
        showErrorToast(
          `${failures.length} of ${tasks.length} reward${tasks.length === 1 ? '' : 's'} failed to process.`,
        );
      }

      const failureNote =
        failures.length > 0
          ? ` Failed: ${failures.map((f) => `${f.noun} (${f.message})`).join('; ')}.`
          : '';
      const cancelledNote = cancelled
        ? ' Remaining items were skipped after you cancelled a signature request.'
        : '';

      if (succeeded === 0) {
        setActionMessage({
          kind: 'error',
          text:
            failures.length > 0
              ? `No rewards were processed.${failureNote}`
              : 'Claim cancelled — no transactions were signed.',
        });
        return;
      }

      setActionMessage({
        kind: failures.length > 0 ? 'error' : 'success',
        text: `Processed ${succeeded} reward${succeeded === 1 ? '' : 's'} (${claimedWithdrawals} withdrawal${claimedWithdrawals === 1 ? '' : 's'}, ${releasedVaults} unlocked vault${releasedVaults === 1 ? '' : 's'}), totaling ${formatWithCommas(processedAmount)} ${ticker}.${cancelledNote}${failureNote}`,
      });
    } finally {
      setIsProcessingRewards(false);
    }
  };

  const shouldRender = !!walletAddress && totalClaimableAmount > 0;

  if (!shouldRender) {
    return null;
  }

  const hasWriteSupport = !!arIOWriteableSDK;
  const loading = withdrawalsLoading || vaultsLoading;
  const claimRewardsDisabled =
    loading || isProcessingRewards || !hasWriteSupport;

  return (
    <div className="rounded-xl border border-grey-600 bg-containerL1 p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-gradient text-sm font-semibold">
            Claimable Rewards
          </div>
        </div>
      </div>

      {!hasWriteSupport && (
        <div className="mb-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          This wallet is connected in read-only mode. Connect a signing wallet
          to claim or release funds.
        </div>
      )}

      <div className="rounded-lg border border-grey-700 bg-grey-800/40 p-3">
        <div className="text-xs text-mid">
          Review available withdrawals and unlocked vaults, then claim all
          rewards in one action.
        </div>
        {!hasClaimableRewards && !loading && (
          <div className="mt-2 text-xs text-low">
            No claimable rewards detected right now. You can still retry a claim
            or release action and the result will be shown here.
          </div>
        )}
        <div className="mt-3 text-sm text-high">
          {loading
            ? 'Loading...'
            : `${unlockedVaults.length} vaults • ${claimableWithdrawals.length} withdrawals • ${formatWithCommas(totalClaimableAmount)} ${ticker}`}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="w-fit">
          <Button
            buttonType={ButtonType.PRIMARY}
            title="Claim all rewards"
            text={isProcessingRewards ? 'Claiming...' : 'Claim All Rewards'}
            className={`w-fit ${claimRewardsDisabled ? 'pointer-events-none opacity-40' : ''}`}
            onClick={claimAllRewards}
          />
        </div>
        <div
          className={`text-xs text-mid ${claimRewardsDisabled ? 'opacity-40' : ''}`}
        >
          One transaction per unlocked vault and pending withdrawal.
        </div>
      </div>

      {actionMessage && (
        <div
          className={`mt-3 rounded-md px-3 py-2 text-xs ${actionMessage.kind === 'error' ? 'border border-red-500/30 bg-red-500/10 text-red-200' : 'border border-grey-600 bg-containerL0 text-high'}`}
        >
          {actionMessage.text}
        </div>
      )}

      {recentTxs.length > 0 && (
        <div className="mt-3 rounded-md border border-grey-600 bg-containerL0 px-3 py-2">
          <div className="mb-2 text-xs text-mid">Recent Transactions</div>
          <div className="flex flex-col gap-2">
            {recentTxs.map((tx) => (
              <button
                key={`${tx.txid}-${tx.label}`}
                className="flex items-center gap-1 break-all text-left text-xs text-primary hover:text-high"
                onClick={() => {
                  window.open(
                    getTransactionExplorerUrl(tx.txid),
                    '_blank',
                    'noopener,noreferrer',
                  );
                }}
                title="View transaction on Solana Explorer"
              >
                <span>{tx.label}</span>
                <LinkArrowIcon className="size-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimableRewardsSection;
