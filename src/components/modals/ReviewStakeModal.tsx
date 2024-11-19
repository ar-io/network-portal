import { AoGatewayWithAddress, IOToken } from '@ar.io/sdk/web';
import { log, WRITE_OPTIONS } from '@src/constants';
import { useGlobalState } from '@src/store';
import { formatAddress, formatWithCommas } from '@src/utils';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import { LinkArrowIcon } from '../icons';
import LabelValueRow from '../LabelValueRow';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import WithdrawWarning from './WithdrawWarning';

const ReviewStakeModal = ({
  gateway,
  amountToStake,
  onSuccess,
  onClose,
  walletAddress,
  ticker,
}: {
  gateway: AoGatewayWithAddress;
  amountToStake: number;
  walletAddress: ArweaveTransactionID;
  onClose: () => void;
  onSuccess: () => void;
  ticker: string;
}) => {
  const queryClient = useQueryClient();
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const [txid, setTxid] = useState<string>();

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const submitForm = async () => {
    if (arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        const { id: txID } = await arIOWriteableSDK.delegateStake(
          {
            target: gateway.gatewayAddress,
            stakeQty: new IOToken(amountToStake).toMIO(),
          },
          WRITE_OPTIONS,
        );
        setTxid(txID);

        log.info(`Increase Delegate Stake txID: ${txID}`);

        queryClient.invalidateQueries({
          queryKey: ['gateway', walletAddress.toString()],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['gateways'],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['balances'],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['delegateStakes'],
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
      <BaseModal
        onClose={onClose}
        useDefaultPadding={false}
        showCloseButton={false}
      >
        <div className="w-[28.5rem]">
          <div className="text-gradient rounded-t-xl border-b border-b-stroke-low bg-containerL3 p-4">
            Review
          </div>
          <div className="flex flex-col gap-2 p-8">
            <LabelValueRow
              label="Gateway Owner:"
              value={formatAddress(gateway.gatewayAddress)}
            />

            <LabelValueRow
              label="Label:"
              value={gateway ? gateway.settings.label : '-'}
            />

            <LabelValueRow
              label="Domain:"
              isLink={true}
              value={gateway ? gateway.settings.fqdn : '-'}
            />

            <LabelValueRow
              label="Amount:"
              value={`${formatWithCommas(amountToStake)} ${ticker}`}
            />
          </div>

          <div className="px-8 pb-6 text-left">
            <WithdrawWarning />
          </div>

          <div className="flex size-full flex-col bg-containerL0 px-8 py-6">
            <Button
              className="h-[3.25rem] w-full"
              onClick={submitForm}
              buttonType={ButtonType.PRIMARY}
              title={`Stake ${ticker}`}
              text={`Stake ${ticker}`}
            />
            <div>
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
          title="Congratulations"
          bodyText={
            <div className="mb-8 text-sm text-mid">
              <div>You have successfully updated your stake.</div>
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

export default ReviewStakeModal;
