import { WRITE_OPTIONS } from '@src/constants';
import { useGlobalState } from '@src/store';
import {
  formatDate,
  formatWithCommas,
  getTransactionExplorerUrl,
} from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import LabelValueRow from '../LabelValueRow';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

/**
 * Release an unlocked (expired) vault back to its owner.
 *
 * On Solana a vault does not auto-credit at expiry — the owner must call
 * `release_vault`, which transfers the balance to their wallet and closes
 * the vault (BD-050). This is non-destructive (you receive your own
 * tokens), so unlike RevokeVaultModal there is no "type CONFIRM" gate.
 */
const ReleaseVaultModal = ({
  vaultId,
  balance,
  endTimestamp,
  onClose,
}: {
  vaultId: string;
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

  const processReleaseVault = async () => {
    if (walletAddress && arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        const { id: txID } = await arIOWriteableSDK.releaseVault(
          { vaultId: vaultId },
          WRITE_OPTIONS,
        );
        setTxid(txID);

        queryClient.invalidateQueries({
          queryKey: ['vaults'],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['balances'],
          refetchType: 'all',
        });

        setShowSuccessModal(true);
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
            <div className="text-lg text-high">Release Vault</div>
          </div>

          <div className="border-y border-grey-800 p-8 text-sm text-mid">
            <div>
              This vault has unlocked. Releasing it transfers the balance to
              your wallet and closes the vault.
            </div>
          </div>

          <div className="flex flex-col p-8">
            <div className="flex flex-col gap-2">
              <LabelValueRow
                label="Balance:"
                value={`${formatWithCommas(balance)} ${ticker}`}
              />

              <LabelValueRow
                label="Unlocked On:"
                value={formatDate(new Date(endTimestamp))}
              />
            </div>
          </div>

          <div className="bg-containerL0 px-8 pb-8 pt-6">
            <div className="flex grow justify-center">
              <Button
                onClick={processReleaseVault}
                buttonType={ButtonType.PRIMARY}
                title="Release Vault"
                text={<div className="py-2">Release Vault</div>}
                className="w-full"
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
              <div>You have successfully released the vault.</div>
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

export default ReleaseVaultModal;
