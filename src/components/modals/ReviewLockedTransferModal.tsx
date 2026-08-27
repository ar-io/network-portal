import { ARIOToken } from '@ar.io/sdk/web';
import { WRITE_OPTIONS } from '@src/constants';
import useBalances from '@src/hooks/useBalances';
import useVaultGasEstimate from '@src/hooks/useVaultGasEstimate';
import { useGlobalState, useSettings } from '@src/store';
import {
  formatAddress,
  formatDate,
  formatWithCommas,
  getTransactionExplorerUrl,
} from '@src/utils';
import { refreshVaultAfterCreate } from '@src/utils/postWriteRefresh';
import { showErrorToast } from '@src/utils/toast';
import { describeVaultError } from '@src/utils/vaultErrors';
import {
  formatLockDuration,
  lockDaysToMs,
  unlockDateFromDays,
} from '@src/utils/vaultLock';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import GasEstimateRows from '../GasEstimateRows';
import LabelValueRow from '../LabelValueRow';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

/**
 * Confirmation step for a locked transfer.
 *
 * Plain sends stay one-step; this exists because a locked transfer is
 * irreversible, time-locked, and costs materially more SOL than the send it
 * sits next to. A non-revocable lock additionally requires typing CONFIRM,
 * matching `RevokeVaultModal` — it is the only other flow in the app that
 * cannot be undone.
 */
const ReviewLockedTransferModal = ({
  recipient,
  amount,
  lockDays,
  revocable,
  onClose,
  onSuccess,
}: {
  recipient: string;
  amount: number;
  lockDays: number;
  revocable: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();

  const ticker = useGlobalState((state) => state.ticker);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const rpc = useGlobalState((state) => state.rpc);
  const coreProgramId = useSettings((state) => state.solanaCoreProgramId);
  const { data: balances } = useBalances(walletAddress);

  const { data: gasEstimate, isLoading: isLoadingGas } = useVaultGasEstimate({
    recipient,
  });

  const insufficientSol =
    gasEstimate !== undefined &&
    balances !== undefined &&
    balances.sol * 1e9 < gasEstimate.totalLamports;

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txid, setTxid] = useState<string>();
  const [confirmText, setConfirmText] = useState('');

  // The unlock date is derived at submit time, not modal-open time: the chain
  // stores a duration measured from when the transaction lands.
  const unlockDate = unlockDateFromDays(lockDays);
  const confirmed = revocable || confirmText === 'CONFIRM';
  const canSubmit = confirmed && !insufficientSol;

  const submitLockedTransfer = async () => {
    if (arIOWriteableSDK === undefined || !canSubmit) {
      return;
    }

    setShowBlockingMessageModal(true);
    try {
      const { id: txID } = await arIOWriteableSDK.vaultedTransfer(
        {
          recipient,
          quantity: new ARIOToken(amount).toMARIO(),
          lockLengthMs: lockDaysToMs(lockDays),
          // NB: the SDK spells this `revokable`; the on-chain field is
          // `revocable`. Misspelling it here silently sends a non-revocable
          // vault, which cannot be undone.
          revokable: revocable,
        },
        WRITE_OPTIONS,
      );

      setTxid(txID);

      setShowBlockingMessageModal(false);
      setShowSuccessModal(true);

      // The transaction has landed and the receipt is ready, so show it before
      // the follow-up reads: these are best-effort cache freshening, and
      // awaiting them here left the user staring at "sign with your wallet"
      // through further round trips behind a 10 req/s bucket.
      // Read the vault back off its own account before invalidating, so the
      // row that appears carries the real vault id and end timestamp rather
      // than the snapshot's pre-write view.
      await refreshVaultAfterCreate(
        rpc,
        coreProgramId,
        { recipient, sender: walletAddress?.toString() },
        arIOReadSDK,
      );

      queryClient.invalidateQueries({
        queryKey: ['vaults'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['balances'],
        refetchType: 'active',
      });
    } catch (e) {
      showErrorToast(describeVaultError(e));
    } finally {
      setShowBlockingMessageModal(false);
    }
  };

  return (
    <>
      <BaseModal onClose={onClose} useDefaultPadding={false}>
        <div className="w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]">
          <div className="text-gradient rounded-t-xl border-b border-b-stroke-low bg-containerL3 p-4">
            Review Locked Transfer
          </div>

          <div className="flex flex-col gap-2 p-8">
            <LabelValueRow
              label="Recipient:"
              value={formatAddress(recipient)}
            />
            <LabelValueRow
              label="Amount:"
              value={`${formatWithCommas(amount)} ${ticker}`}
            />
            <LabelValueRow
              label="Unlocks on or around:"
              value={formatDate(unlockDate)}
            />
            <LabelValueRow
              label="Lock duration:"
              value={formatLockDuration(lockDays)}
            />
            <LabelValueRow
              label="Revocable by you:"
              value={revocable ? 'Yes' : 'No'}
            />

            <GasEstimateRows
              gasEstimate={gasEstimate}
              isLoading={isLoadingGas}
              insufficientSol={insufficientSol}
            />
          </div>

          <div className="border-y border-grey-800 px-8 py-6 text-sm text-mid">
            {revocable ? (
              <div>
                The recipient cannot access these tokens until the vault
                unlocks. You may revoke it before then, which returns the
                balance to you.
              </div>
            ) : (
              <div>
                The recipient cannot access these tokens until the vault
                unlocks, and you will not be able to revoke or recover them.
                This cannot be undone.
              </div>
            )}
            <div className="pt-3 text-xs text-low">
              The vault unlocks this long after the transaction confirms, so the
              exact time may differ from the date above by a few moments. If you
              are signing with a hardware wallet, make sure blind signing is
              enabled.
            </div>
          </div>

          <div className="bg-containerL0 px-8 pb-8 pt-6">
            {!revocable && (
              <div className="mb-6 flex flex-col items-center gap-2 text-sm text-mid">
                <div>
                  Please type &quot;CONFIRM&quot; in the text box to proceed.
                </div>
                <input
                  type="text"
                  aria-label="Type CONFIRM to authorise this locked transfer"
                  onChange={(e) => setConfirmText(e.target.value)}
                  className={
                    'h-7 w-full rounded-md border border-grey-700 bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
                  }
                  value={confirmText}
                />
              </div>
            )}

            {/* Footer markup mirrors ReviewStakeModal: the primary button
                carries its own height rather than padding a text wrapper, which
                is what kept the gradient border from rendering fully. */}
            <Button
              className={`h-[3.25rem] w-full ${
                !canSubmit ? 'pointer-events-none opacity-30' : ''
              }`}
              onClick={submitLockedTransfer}
              buttonType={ButtonType.PRIMARY}
              title={
                insufficientSol ? 'Insufficient SOL' : `Send Locked ${ticker}`
              }
              text={
                insufficientSol ? 'Insufficient SOL' : `Send Locked ${ticker}`
              }
            />
            <div className="flex justify-center">
              <button className="h-[3.25rem] p-4 text-sm" onClick={onClose}>
                Back
              </button>
            </div>
          </div>
        </div>
      </BaseModal>

      {showBlockingMessageModal && (
        <BlockingMessageModal
          onClose={() => setShowBlockingMessageModal(false)}
          message="Sign the following data with your wallet to proceed."
        ></BlockingMessageModal>
      )}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => {
            setShowSuccessModal(false);
            onClose();
            onSuccess();
          }}
          title="Confirmed"
          // FIXME: This uses a button as using a standard <a> tag does not work. Needs further investigation.
          bodyText={
            <div className="mb-8 text-sm text-mid">
              <div>
                You have locked {formatWithCommas(amount)} {ticker} for{' '}
                {formatAddress(recipient)} until {formatDate(unlockDate)}.
              </div>
              <div className="my-2 flex flex-col justify-center gap-2">
                <div>Transaction ID:</div>
                <button
                  className="flex items-center justify-center break-all"
                  title="View transaction on Solana Explorer"
                  onClick={async () => {
                    window.open(
                      getTransactionExplorerUrl(txid!),
                      '_blank',
                      'noopener,noreferrer',
                    );
                  }}
                >
                  {txid}
                  <LinkArrowIcon className="ml-1 size-3" />
                </button>
              </div>
            </div>
          }
        />
      )}
    </>
  );
};

export default ReviewLockedTransferModal;
