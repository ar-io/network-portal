import { useGlobalState } from '@src/store';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import { WRITE_OPTIONS } from '@src/constants';

const CancelWithdrawalModal = ({
  gatewayAddress,
  vaultId,
  onClose,
}: {
  gatewayAddress:string;
  vaultId: string;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txid, setTxid] = useState<string>();

  const [confirmText, setConfirmText] = useState('');

  const termsAccepted = confirmText === 'CONFIRM';

  const processCancelWithdrawal = async () => {
    if (walletAddress && arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        const { id: txID } = await arIOWriteableSDK.cancelWithdrawal(
          { gatewayAddress: gatewayAddress, vaultId: vaultId },
          WRITE_OPTIONS,
        );
        setTxid(txID);

        queryClient.invalidateQueries({
          queryKey: ['gateways'],
          refetchType: 'all',
        });

        setShowSuccessModal(true);
        // onClose();
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
        <div className="w-[28.4375rem] text-left">
          <div className="px-8  pb-4 pt-6">
            <div className="text-lg text-high">Cancel Pending Withdrawal</div>
          </div>

          <div className="border-y border-grey-800 p-8 text-sm text-mid">
            <div>
              This action will cancel your withdrawal and return its stake to
              the original gateway. This action cannot be undone.
            </div>
          </div>

          <div className="px-8 pb-8 pt-6">
            <div className="mb-6 flex flex-col items-center gap-2 text-sm text-mid">
              <div>
                Please type &quot;CONFIRM&quot; in the text box to proceed.
              </div>
              <input
                type="text"
                onChange={(e) => setConfirmText(e.target.value)}
                className={
                  'h-7 w-full rounded-md border border-grey-700 bg-grey-1000 p-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
                }
                value={confirmText}
              />
            </div>

            <div className="flex grow justify-center">
              <Button
                onClick={processCancelWithdrawal}
                buttonType={ButtonType.PRIMARY}
                title="Leave Network"
                text={<div className="py-2">Cancel Withdrawal</div>}
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
          bodyText={
            <div className="mb-8 text-sm text-mid">
              <div>You have successfully canceled the withdrawal.</div>
              <div className="my-2 flex flex-col justify-center gap-2">
                <div>Transaction ID:</div>
                <button
                  className="flex items-center justify-center"
                  title="View transaction on ao.link"
                  onClick={async () => {
                    window.open(`https://ao.link/#/message/${txid}`, '_blank');
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

export default CancelWithdrawalModal;
