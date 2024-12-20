import { AoGatewayWithAddress, ARIOToken } from '@ar.io/sdk/web';
import {
  log,
  REDELEGATION_FEE_TOOLTIP_TEXT,
  WRITE_OPTIONS,
} from '@src/constants';
import useRedelegationFee from '@src/hooks/useRedelegationFee';
import { useGlobalState } from '@src/store';
import { formatAddress, formatWithCommas } from '@src/utils';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import { LinkArrowIcon } from '../icons';
import LabelValueRow from '../LabelValueRow';
import Tooltip from '../Tooltip';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import WithdrawWarning from './WithdrawWarning';

type ReviewRedelegateModalProps = {
  sourceGateway: AoGatewayWithAddress;
  targetGateway: AoGatewayWithAddress;
  amountToRedelegate: ARIOToken;
  fee: number;
  newTotalStake: number;
  walletAddress: ArweaveTransactionID;
  vaultId?: string;
  onClose: () => void;
  onSuccess: () => void;
  ticker: string;
};

const ReviewRedelegateModal = ({
  sourceGateway,
  targetGateway,
  amountToRedelegate,
  vaultId,
  fee,
  newTotalStake,
  onSuccess,
  onClose,
  walletAddress,
  ticker,
}: ReviewRedelegateModalProps) => {
  const queryClient = useQueryClient();
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const [txid, setTxid] = useState<string>();

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: redelegationFee } = useRedelegationFee();

  const totalRedelegatedStake = amountToRedelegate.valueOf() - fee;

  const submitForm = async () => {
    if (arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        const { id: txID } = await arIOWriteableSDK.redelegateStake(
          {
            source: sourceGateway.gatewayAddress,
            target: targetGateway.gatewayAddress,
            stakeQty: amountToRedelegate.toMARIO(),
            vaultId,
          },
          WRITE_OPTIONS,
        );

        setTxid(txID);

        log.info(`Redelegate Stake txID: ${txID}`);

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
        queryClient.invalidateQueries({
          queryKey: ['gatewayVaults'],
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
              label="Source Gateway Owner:"
              value={formatAddress(sourceGateway.gatewayAddress)}
            />

            <LabelValueRow
              label="Label:"
              value={sourceGateway.settings.label}
            />

            <LabelValueRow
              label="Domain:"
              isLink={true}
              value={sourceGateway.settings.fqdn}
            />

            <div className="h-6"></div>

            <LabelValueRow
              label="Target Gateway Owner:"
              value={formatAddress(targetGateway.gatewayAddress)}
            />

            <LabelValueRow
              label="Label:"
              value={targetGateway.settings.label}
            />

            <LabelValueRow
              label="Domain:"
              isLink={true}
              value={targetGateway.settings.fqdn}
            />

            <div className="h-6"></div>

            <LabelValueRow
              label="Amount:"
              value={`${formatWithCommas(amountToRedelegate.valueOf())} ${ticker}`}
            />

            {fee > 0 && (
              <LabelValueRow
                label="Fee:"
                value={`${fee > 0 && fee} ${redelegationFee ? `(-${redelegationFee.redelegationFeeRate}%)` : ''} ${ticker}`}
                rightIcon={
                  <Tooltip
                    message={
                      <div>
                        <p>{REDELEGATION_FEE_TOOLTIP_TEXT}</p>
                      </div>
                    }
                  >
                    <InfoIcon className="size-[1.125rem]" />
                  </Tooltip>
                }
              />
            )}

            <LabelValueRow
              label="Total Redelegated Stake:"
              value={`${formatWithCommas(totalRedelegatedStake)} ${ticker}`}
            />

            <LabelValueRow
              label="New Total Stake:"
              value={`${formatWithCommas(newTotalStake)} ${ticker}`}
            />
          </div>

          <div className="px-8 pb-6 text-left">
            <WithdrawWarning />
          </div>

          <div className="flex size-full flex-col bg-containerL0 px-8 pb-2 pt-6">
            <Button
              className="h-[3.25rem] w-full"
              onClick={submitForm}
              buttonType={ButtonType.PRIMARY}
              title={`Redelegate ${ticker}`}
              text={`Redelegate ${ticker}`}
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
              <div>You have successfully redelegated your stake.</div>
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

export default ReviewRedelegateModal;
