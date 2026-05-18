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

const ClaimableRewardsSection = () => {
  const queryClient = useQueryClient();
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals(
    walletAddress?.toString(),
  );
  const { data: allVaults, isLoading: vaultsLoading } = useVaults();

  const [isClaiming, setIsClaiming] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string>();
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

  const refreshRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    queryClient.invalidateQueries({ queryKey: ['vaults'] });
    queryClient.invalidateQueries({ queryKey: ['balances'] });
    queryClient.invalidateQueries({ queryKey: ['delegateStakes'] });
    queryClient.invalidateQueries({ queryKey: ['gatewayVaults'] });
  };

  const claimAllWithdrawals = async () => {
    if (!walletAddress || !arIOWriteableSDK || isClaiming) {
      return;
    }
    if (claimableWithdrawals.length === 0) {
      return;
    }

    setIsClaiming(true);
    setActionMessage(undefined);

    let successCount = 0;
    const txs: Array<TxResult> = [];

    try {
      for (const withdrawal of claimableWithdrawals) {
        const { id } = await arIOWriteableSDK.claimWithdrawal(
          {
            withdrawalId: withdrawal.vaultId,
          },
          WRITE_OPTIONS,
        );

        successCount += 1;
        txs.push({
          txid: id,
          label: `Claimed withdrawal ${withdrawal.vaultId}`,
        });
      }

      setRecentTxs((prev) => [...txs, ...prev].slice(0, 8));
      setActionMessage(
        `Claimed ${successCount} withdrawal${successCount === 1 ? '' : 's'} totaling ${formatWithCommas(claimableWithdrawalAmount)} ${ticker}.`,
      );
      refreshRelatedQueries();
    } catch (error: any) {
      showErrorToast(`${error}`);
      setActionMessage(
        `Claim completed for ${successCount} withdrawal${successCount === 1 ? '' : 's'} before an error interrupted the batch.`,
      );
      if (txs.length > 0) {
        setRecentTxs((prev) => [...txs, ...prev].slice(0, 8));
        refreshRelatedQueries();
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const releaseAllVaults = async () => {
    if (!walletAddress || !arIOWriteableSDK || isReleasing) {
      return;
    }
    if (unlockedVaults.length === 0) {
      return;
    }

    setIsReleasing(true);
    setActionMessage(undefined);

    let successCount = 0;
    const txs: Array<TxResult> = [];

    try {
      for (const vault of unlockedVaults) {
        const { id } = await arIOWriteableSDK.releaseVault(
          {
            vaultId: vault.vaultId,
          },
          WRITE_OPTIONS,
        );

        successCount += 1;
        txs.push({
          txid: id,
          label: `Released vault ${vault.vaultId}`,
        });
      }

      setRecentTxs((prev) => [...txs, ...prev].slice(0, 8));
      setActionMessage(
        `Released ${successCount} unlocked vault${successCount === 1 ? '' : 's'} totaling ${formatWithCommas(claimableVaultAmount)} ${ticker}.`,
      );
      refreshRelatedQueries();
    } catch (error: any) {
      showErrorToast(`${error}`);
      setActionMessage(
        `Release completed for ${successCount} vault${successCount === 1 ? '' : 's'} before an error interrupted the batch.`,
      );
      if (txs.length > 0) {
        setRecentTxs((prev) => [...txs, ...prev].slice(0, 8));
        refreshRelatedQueries();
      }
    } finally {
      setIsReleasing(false);
    }
  };

  const shouldRender =
    !!walletAddress &&
    (hasClaimableRewards || isClaiming || isReleasing || !!actionMessage);

  if (!shouldRender) {
    return null;
  }

  const hasWriteSupport = !!arIOWriteableSDK;
  const loading = withdrawalsLoading || vaultsLoading;
  const claimWithdrawalsDisabled =
    !hasWriteSupport ||
    loading ||
    claimableWithdrawals.length === 0 ||
    isClaiming ||
    isReleasing;
  const releaseVaultsDisabled =
    !hasWriteSupport ||
    loading ||
    unlockedVaults.length === 0 ||
    isClaiming ||
    isReleasing;

  return (
    <div className="rounded-xl border border-grey-600 bg-containerL1 p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-gradient text-sm font-semibold">
            Claimable Rewards
          </div>
          <div className="mt-1 text-xs text-mid">
            Withdrawals and unlocked vaults are claimed with separate
            transactions.
          </div>
        </div>
      </div>

      {!hasWriteSupport && (
        <div className="mb-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          This wallet is connected in read-only mode. Connect a signing wallet
          to claim or release funds.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-grey-700 bg-grey-800/40 p-3">
          <div className="text-xs text-mid">Matured Withdrawals</div>
          <div className="mt-1 text-sm text-high">
            {loading
              ? 'Loading...'
              : `${claimableWithdrawals.length} ready • ${formatWithCommas(claimableWithdrawalAmount)} ${ticker}`}
          </div>
          <div className="mt-3 w-fit">
            <Button
              buttonType={ButtonType.PRIMARY}
              title="Claim all matured withdrawals"
              text={isClaiming ? 'Claiming...' : 'Claim All Matured'}
              className={`w-fit ${claimWithdrawalsDisabled ? 'pointer-events-none opacity-40' : ''}`}
              onClick={claimAllWithdrawals}
            />
          </div>
          <div
            className={`mt-2 text-xs text-mid ${claimWithdrawalsDisabled ? 'opacity-40' : ''}`}
          >
            One transaction per matured withdrawal.
          </div>
        </div>

        <div className="rounded-lg border border-grey-700 bg-grey-800/40 p-3">
          <div className="text-xs text-mid">Unlocked Vaults</div>
          <div className="mt-1 text-sm text-high">
            {loading
              ? 'Loading...'
              : `${unlockedVaults.length} ready • ${formatWithCommas(claimableVaultAmount)} ${ticker}`}
          </div>
          <div className="mt-3 w-fit">
            <Button
              buttonType={ButtonType.PRIMARY}
              title="Release all unlocked vaults"
              text={isReleasing ? 'Releasing...' : 'Release All Unlocked'}
              className={`w-fit ${releaseVaultsDisabled ? 'pointer-events-none opacity-40' : ''}`}
              onClick={releaseAllVaults}
            />
          </div>
          <div
            className={`mt-2 text-xs text-mid ${releaseVaultsDisabled ? 'opacity-40' : ''}`}
          >
            One transaction per unlocked vault.
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="mt-3 rounded-md border border-grey-600 bg-containerL0 px-3 py-2 text-xs text-high">
          {actionMessage}
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
