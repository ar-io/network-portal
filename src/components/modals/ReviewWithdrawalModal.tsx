import { AoGatewayWithAddress, ARIOToken } from '@ar.io/sdk/web';
import { log, WRITE_OPTIONS } from '@src/constants';
import { useGlobalState } from '@src/store';
import { AoAddress, WithdrawalType } from '@src/types';
import { formatAddress, formatDateTime, formatWithCommas } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import { LinkArrowIcon } from '../icons';
import LabelValueRow from '../LabelValueRow';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

const ReviewWithdrawalModal = ({
  gateway,
  amountToWithdraw,
  withdrawalType,
  onSuccess,
  onClose,
  walletAddress,
  ticker,
  withdrawalFee,
  returningAmount,
}: {
  gateway: AoGatewayWithAddress;
  amountToWithdraw: number;
  withdrawalType: WithdrawalType;
  walletAddress: AoAddress;
  onClose: () => void;
  onSuccess: () => void;
  ticker: string;
  withdrawalFee: number;
  returningAmount?: number | string;
}) => {
  const queryClient = useQueryClient();
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const [txid, setTxid] = useState<string>();

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [dateOfReturn, setDateOfReturn] = useState<string>('');

  const [confirmText, setConfirmText] = useState('');

  const termsAccepted = confirmText === 'WITHDRAW';

  useEffect(() => {
    setDateOfReturn(
      withdrawalType === 'expedited'
        ? 'Instant'
        : formatDateTime(dayjs(new Date()).add(30, 'day').toDate()),
    );
  }, [withdrawalType]);

  const submitForm = async () => {
    if (arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        const instant = withdrawalType === 'expedited';

        if (gateway.gatewayAddress === walletAddress.toString()) {
          const { id: txID } = await arIOWriteableSDK.decreaseOperatorStake(
            {
              decreaseQty: new ARIOToken(amountToWithdraw).toMARIO(),
              instant,
            },
            WRITE_OPTIONS,
          );
          setTxid(txID);

          log.info(`Decrease Operator Stake txID: ${txID}`);
        } else {
          const { id: txID } = await arIOWriteableSDK.decreaseDelegateStake(
            {
              target: gateway.gatewayAddress,
              decreaseQty: new ARIOToken(amountToWithdraw).toMARIO(),
              instant,
            },
            WRITE_OPTIONS,
          );
          setTxid(txID);

          log.info(`Decrease Delegate Stake txID: ${txID}`);
        }

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
              value={`${formatWithCommas(amountToWithdraw)} ${ticker}`}
            />
            <LabelValueRow label="Date of Return:" value={dateOfReturn} />
          </div>

          <div className="flex flex-col gap-2 px-8 pb-8">
            <LabelValueRow
              label="Stake Withdrawing:"
              value={`${formatWithCommas(amountToWithdraw)} ${ticker}`}
            />

            {withdrawalType === 'expedited' && (
              <>
                <LabelValueRow
                  className="first:text-mid last:text-mid"
                  label="Fee:"
                  value={`${isNaN(withdrawalFee) ? '-' : +withdrawalFee.toFixed(4)} ${ticker}`}
                />
                <LabelValueRow
                  className="first:text-mid last:text-mid"
                  label="Returning Amount:"
                  value={`${returningAmount} ${ticker}`}
                />
              </>
            )}
          </div>

          <div className="flex size-full flex-col bg-containerL0 px-8 pb-2 pt-6">
            <div className="mb-6 flex flex-col items-center gap-2 text-sm text-mid">
              <div>
                Please type &quot;WITHDRAW&quot; in the text box to proceed.
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

            <div
              className={
                termsAccepted ? undefined : 'pointer-events-none opacity-30'
              }
            >
              <Button
                className="h-[3.25rem] w-full"
                onClick={submitForm}
                buttonType={ButtonType.PRIMARY}
                title={`Withdraw ${ticker}`}
                text={`Withdraw ${ticker}`}
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

export default ReviewWithdrawalModal;
