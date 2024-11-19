import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import { WRITE_OPTIONS } from '@src/constants';

const GATEWAY_OPERATOR_STAKE_MINIMUM = 50000;

const LeaveNetworkModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const ticker = useGlobalState((state) => state.ticker);

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txid, setTxid] = useState<string>();

  const [leaveNetworkText, setLeaveNetworkText] = useState('');

  const termsAccepted = leaveNetworkText === 'LEAVE NETWORK';

  const processLeaveNetwork = async () => {
    if (walletAddress && arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        const { id: txID } = await arIOWriteableSDK.leaveNetwork(WRITE_OPTIONS);
        setTxid(txID);

        queryClient.invalidateQueries({
          queryKey: ['gateway', walletAddress.toString()],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['gateways'],
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
        <div className="w-[28.4375rem] text-left">
          <div className="px-8  pb-4 pt-6">
            <div className="text-lg text-high">Leave Network</div>
            {/* <div className="flex pt-2 text-xs text-low">
              Withdraw all delegated stakes.
            </div> */}
          </div>

          <div className="border-y border-grey-800 p-8 text-sm text-mid">
            <div>
              This action will begin the process of removing your gateway from
              the network. Once confirmed, the following actions will be
              initiated in the next epoch:
            </div>
            <ul className="mt-6 list-disc space-y-2 pl-8">
              <li>
                Your gateway&apos;s primary stake (
                {formatWithCommas(GATEWAY_OPERATOR_STAKE_MINIMUM)} {ticker})
                will be vaulted and subject to a 90-day withdrawal period.
              </li>
              <li>
                Any additional operator stake above the minimum (
                {formatWithCommas(GATEWAY_OPERATOR_STAKE_MINIMUM)} {ticker})
                will be vaulted and subject to a 30-day withdrawal period.
              </li>
              <li>
                Any existing delegated stakes will be vaulted and subject to
                30-day withdrawal period.{' '}
              </li>
              <li>
                Your gateway status will change to leaving and will no longer be
                eligible for protocol rewards or observation duties.
              </li>
            </ul>
          </div>

          <div className="bg-containerL0 px-8 pb-8 pt-6">
            <div className="mb-6 flex flex-col items-center gap-2 text-sm text-mid">
              <div>Please type &quot;LEAVE NETWORK&quot; in the text box to proceed.</div>
              <input
                type="text"
                onChange={(e) => setLeaveNetworkText(e.target.value)}
                className={
                  'h-7 w-full rounded-md border border-grey-700 bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
                }
                value={leaveNetworkText}
              />
            </div>

            <div className="flex grow justify-center">
              <Button
                onClick={processLeaveNetwork}
                buttonType={ButtonType.PRIMARY}
                title="Leave Network"
                text={<div className="py-2">Leave Network</div>}
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
              <div>You have successfully left the network.</div>
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

export default LeaveNetworkModal;
