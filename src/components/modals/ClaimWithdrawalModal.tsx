import { mARIOToken } from '@ar.io/sdk/web';
import { WRITE_OPTIONS } from '@src/constants';
import useBalances from '@src/hooks/useBalances';
import useGarGasEstimate from '@src/hooks/useGarGasEstimate';
import { useGlobalState } from '@src/store';
import {
  formatDateTime,
  formatWithCommas,
  getTransactionExplorerUrl,
} from '@src/utils';
import { describeGarError } from '@src/utils/garErrors';
import { invalidateWrittenDocuments } from '@src/utils/snapshotFreshness';
import { showErrorToast } from '@src/utils/toast';
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
 * Claim a matured withdrawal in full.
 *
 * `claim_withdrawal` is gated only on `clock.unix_timestamp >=
 * withdrawal.available_at` and transfers the whole amount — no fee, unlike an
 * expedited withdrawal, which floors at a 10% penalty and never stops charging
 * it. The owner must sign: nothing credits a matured withdrawal automatically
 * on Solana, where AO released one by itself.
 *
 * Non-destructive (the user receives their own tokens), so there is no "type
 * CONFIRM" gate — the same call ReleaseVaultModal makes for a vault.
 */
const ClaimWithdrawalModal = ({
  withdrawalId,
  balance,
  endTimestamp,
  onClose,
}: {
  withdrawalId: string;
  /** Withdrawal balance in mARIO, as the SDK reports it. */
  balance: number;
  endTimestamp: number;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const ticker = useGlobalState((state) => state.ticker);

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txid, setTxid] = useState<string>();

  // Claiming closes the withdrawal vault — its rent deposit comes back.
  const { data: gasEstimate, isLoading: isLoadingGas } = useGarGasEstimate({
    workflow: 'claim-withdrawal',
    fromAddress: walletAddress?.toString(),
    vaultId: withdrawalId,
  });

  // The wallet most likely to be short of SOL is the one whose ARIO is
  // stranded in a matured withdrawal, so say so rather than letting the
  // wallet fail.
  const { data: balances } = useBalances(walletAddress);
  const insufficientSol =
    !!gasEstimate &&
    balances !== undefined &&
    balances.sol * 1_000_000_000 < gasEstimate.totalLamports;

  // `insufficientSol` is false while either read is still in flight, and
  // `Button` has no disabled state of its own — so without this the user can
  // sign before the check that exists to stop them has an answer. Only the
  // in-flight case blocks: if the estimate *failed* we cannot prove they are
  // short, and refusing to let them try on our own failed read is worse than
  // letting the wallet answer.
  const checksPending = isLoadingGas || balances === undefined;
  const blocked = insufficientSol || checksPending;

  const processClaimWithdrawal = async () => {
    if (blocked) return;
    if (!walletAddress || !arIOWriteableSDK) {
      showErrorToast('Connect a signing wallet before claiming.');
      return;
    }

    {
      setShowBlockingMessageModal(true);

      try {
        const { id: txID } = await arIOWriteableSDK.claimWithdrawal(
          { withdrawalId },
          WRITE_OPTIONS,
        );
        setTxid(txID);

        // Only `balances` changes: the tokens leave the program's stake
        // account for the user's wallet. Gateway stake totals dropped when
        // the withdrawal was created, not now.
        invalidateWrittenDocuments(queryClient, 'balances');
        // Default `refetchType: 'active'`, matching `invalidateWrittenDocuments`
        // above: each of these is a program scan, and refetching one from a
        // page where its table is not mounted spends that scan on nothing.
        // They are marked stale either way and reload when next rendered.
        queryClient.invalidateQueries({ queryKey: ['delegateStakes'] });
        queryClient.invalidateQueries({ queryKey: ['gatewayVaults'] });
        queryClient.invalidateQueries({ queryKey: ['withdrawals'] });

        setShowSuccessModal(true);
      } catch (e: any) {
        // A browser clock ahead of the network's can offer a claim the chain
        // still refuses; `describeGarError` says so in words.
        showErrorToast(describeGarError(e));
      } finally {
        setShowBlockingMessageModal(false);
      }
    }
  };

  return (
    <>
      <BaseModal onClose={onClose} useDefaultPadding={false}>
        <div className="w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]">
          <div className="px-8 pb-4 pt-6">
            <div className="text-lg text-high">Claim Withdrawal</div>
          </div>

          <div className="border-y border-grey-800 p-8 text-sm text-mid">
            <div>
              This withdrawal has unlocked. Claiming transfers the full amount
              to your wallet — no fee — and closes the withdrawal.
            </div>
          </div>

          <div className="flex flex-col p-8">
            <div className="flex flex-col gap-2">
              <LabelValueRow
                label="Amount:"
                value={`${formatWithCommas(
                  new mARIOToken(balance).toARIO().valueOf(),
                )} ${ticker}`}
              />

              <LabelValueRow
                label="Unlocked On:"
                value={formatDateTime(new Date(endTimestamp))}
              />

              <GasEstimateRows
                gasEstimate={gasEstimate}
                isLoading={isLoadingGas}
                insufficientSol={insufficientSol}
              />
            </div>
          </div>

          <div className="bg-containerL0 px-8 pb-8 pt-6">
            <div className="flex grow justify-center">
              <Button
                onClick={processClaimWithdrawal}
                buttonType={ButtonType.PRIMARY}
                title={
                  insufficientSol ? 'Insufficient SOL' : 'Claim Withdrawal'
                }
                text={
                  <div className="py-2">
                    {insufficientSol ? 'Insufficient SOL' : 'Claim Withdrawal'}
                  </div>
                }
                className={`w-full ${
                  insufficientSol ? 'pointer-events-none opacity-30' : ''
                }`}
              />
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
          }}
          title="Confirmed"
          // FIXME: This uses a button as using a standard <a> tag does not work. Needs further investigation.
          bodyText={
            <div className="mb-8 text-sm text-mid">
              <div>
                You have successfully claimed your withdrawal. The tokens are in
                your wallet.
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

export default ClaimWithdrawalModal;
