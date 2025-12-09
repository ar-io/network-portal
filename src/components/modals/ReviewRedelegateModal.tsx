import { ARIOToken, AoGatewayWithAddress } from '@ar.io/sdk/web';
import { WRITE_OPTIONS, log } from '@src/constants';
import useRedelegationFee from '@src/hooks/useRedelegationFee';
import { useGlobalState } from '@src/store';
import { AoAddress } from '@src/types';
import { formatAddress, formatWithCommas } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import LabelValueRow from '../LabelValueRow';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

type ReviewRedelegateModalProps = {
  sourceGateway: AoGatewayWithAddress;
  targetGateway: AoGatewayWithAddress;
  amountToRedelegate: ARIOToken;
  fee: number;
  newTotalStake: number;
  walletAddress: AoAddress;
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
  const [confirmationInput, setConfirmationInput] = useState('');

  const { data: redelegationFee } = useRedelegationFee();
  const hasFee = fee > 0;

  const totalRedelegatedStake = amountToRedelegate.valueOf() - fee;

  const isDisabled =
    showBlockingMessageModal || (hasFee && confirmationInput !== 'CONFIRM');

  const submitForm = async () => {
    if (isDisabled) return;
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
        <div className="w-[calc(100vw-2rem)] lg:w-[28.5rem]">
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
            <div>
              <div className="flex gap-3 rounded bg-containerL3 p-4">
                <div className="grow text-[0.8125rem] text-mid">
                  Users get one free redelegation every 7 days. Fees then
                  increase incrementally (10%, 20%, ... up to 60%) and stay at
                  60% until resetting after 7 days of no action.
                </div>
              </div>
            </div>
          </div>

          <div className="flex size-full flex-col bg-containerL0 px-8 pb-2 pt-6">
            {hasFee && (
              <div className="mb-6">
                <label
                  htmlFor="confirmation-input"
                  className="mb-2 block text-sm font-medium text-mid"
                >
                  Please type CONFIRM to acknowledge there will be a fee of{' '}
                  {fee} {ticker} for redelegating.
                </label>
                <input
                  type="text"
                  id="confirmation-input"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="h-7 w-full rounded-md border border-grey-700 bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high"
                />
              </div>
            )}
            <div
              className={
                showBlockingMessageModal ||
                (hasFee && confirmationInput !== 'CONFIRM')
                  ? 'pointer-events-none opacity-30'
                  : ''
              }
            >
              <Button
                className="h-12 w-full"
                onClick={submitForm}
                buttonType={ButtonType.PRIMARY}
                title={
                  hasFee && confirmationInput !== 'CONFIRM'
                    ? 'Please type CONFIRM to acknowledge the fee and continue'
                    : `Redelegate ${ticker}`
                }
                text={
                  showBlockingMessageModal
                    ? 'Processing...'
                    : `Redelegate ${ticker}`
                }
              />
            </div>
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
                  className="flex items-center justify-center break-all"
                  title="View transaction on AR.IO Scan"
                  onClick={async () => {
                    window.open(
                      `https://scan.ar.io/#/message/${txid}`,
                      '_blank',
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

export default ReviewRedelegateModal;
