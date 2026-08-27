import { WRITE_OPTIONS } from '@src/constants';
import { useGlobalState } from '@src/store';
import {
  formatAddress,
  formatDate,
  formatWithCommas,
  getTransactionExplorerUrl,
} from '@src/utils';
import { refreshAfterVaultClosed } from '@src/utils/postWriteRefresh';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import LabelValueRow from '../LabelValueRow';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

const RevokeVaultModal = ({
  recipient,
  vaultId,
  balance,
  endTimestamp,
  onClose,
}: {
  recipient: string;
  vaultId: string;
  balance: number;
  endTimestamp: number;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const ticker = useGlobalState((state) => state.ticker);

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txid, setTxid] = useState<string>();

  const [confirmText, setConfirmText] = useState('');

  const termsAccepted = confirmText === 'CONFIRM';

  const processRevokeVault = async () => {
    if (walletAddress && arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        const { id: txID } = await arIOWriteableSDK.revokeVault(
          { recipient: recipient, vaultId: vaultId },
          WRITE_OPTIONS,
        );
        setTxid(txID);

        setShowBlockingMessageModal(false);
        setShowSuccessModal(true);

        // The transaction has landed and the receipt is ready, so show it before
        // the follow-up reads: these are best-effort cache freshening, and
        // awaiting them here left the user staring at "sign with your wallet"
        // through further round trips behind a 10 req/s bucket.
        // Hide the closed vault and re-read the credited balance: the
        // published snapshot still lists both in their pre-write state.
        await refreshAfterVaultClosed(arIOReadSDK, {
          owner: recipient,
          vaultId,
          creditedTo: walletAddress.toString(),
        });

        queryClient.invalidateQueries({
          queryKey: ['vaults'],
          refetchType: 'active',
        });
        queryClient.invalidateQueries({
          queryKey: ['balances'],
          refetchType: 'active',
        });
      } catch (e: any) {
        showErrorToast(`${e}`);
      } finally {
        setShowBlockingMessageModal(false);
      }
    }
  };

  return (
    <>
      <BaseModal onClose={onClose} useDefaultPadding={false}>
        <div className="w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]">
          <div className="px-8  pb-4 pt-6">
            <div className="text-lg text-high">Revoke Vault</div>
          </div>

          <div className="border-y border-grey-800 p-8 text-sm text-mid">
            <div>
              This action will revoke the vault and return the balance to you.
              This action cannot be undone.
            </div>
          </div>

          <div className="flex flex-col p-8">
            <div className="flex flex-col gap-2">
              <LabelValueRow
                label="Recipient:"
                value={formatAddress(recipient)}
              />

              <LabelValueRow
                label="Balance:"
                value={`${formatWithCommas(balance)} ${ticker}`}
              />

              <LabelValueRow
                label="End Date:"
                value={formatDate(new Date(endTimestamp))}
              />
            </div>
          </div>

          <div className="bg-containerL0 px-8 pb-8 pt-6">
            <div className="mb-6 flex flex-col items-center gap-2 text-sm text-mid">
              <div>
                Please type &quot;CONFIRM&quot; in the text box to proceed.
              </div>
              <input
                type="text"
                onChange={(e) => setConfirmText(e.target.value)}
                className={
                  'h-7 w-full rounded-md border border-grey-700 bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
                }
                value={confirmText}
              />
            </div>

            <div className="flex grow justify-center">
              <Button
                onClick={processRevokeVault}
                buttonType={ButtonType.PRIMARY}
                title="Revoke Vault"
                text={<div className="py-2">Revoke Vault</div>}
                className={`w-full ${!termsAccepted && 'pointer-events-none opacity-30'}`}
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
              <div>You have successfully revoked the vault.</div>
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

export default RevokeVaultModal;
