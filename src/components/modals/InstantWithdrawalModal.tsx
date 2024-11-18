import { AoGateway, AoVaultData, mIOToken } from '@ar.io/sdk/web';
import { WRITE_OPTIONS } from '@src/constants';
import { useGlobalState } from '@src/store';
import { formatAddress, formatDateTime, formatWithCommas } from '@src/utils';
import { calculateInstantWithdrawalPenaltyRate } from '@src/utils/stake';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import LabelValueRow from '../LabelValueRow';
import Tooltip from '../Tooltip';
import { InfoIcon, LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

const InstantWithdrawalModal = ({
  gateway,
  gatewayAddress,
  vaultId,
  vault,
  onClose,
}: {
  gateway: AoGateway;
  gatewayAddress: string;
  vaultId: string;
  vault: AoVaultData;
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

  const [confirmText, setConfirmText] = useState('');

  const [calculatedFeeAndAmountReturning, setCalculatedFeeAndAmountReturning] =
    useState<{ penaltyRate: number; fee: number; amountReturning: number }>();

  useEffect(() => {
    const penaltyRate = calculateInstantWithdrawalPenaltyRate(
      vault,
      new Date(),
    );

    const fee = Math.floor(penaltyRate * vault.balance);
    const amountReturning = Math.round(vault.balance - fee);

    setCalculatedFeeAndAmountReturning({
      penaltyRate,
      fee: new mIOToken(fee).toIO().valueOf(),
      amountReturning: new mIOToken(amountReturning).toIO().valueOf(),
    });
  }, [setCalculatedFeeAndAmountReturning, vault]);

  const termsAccepted = confirmText === 'WITHDRAW';

  const processInstantWithdrawal = async () => {
    if (walletAddress && arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        const { id: txID } = await arIOWriteableSDK.instantWithdrawal(
          { gatewayAddress: gatewayAddress, vaultId: vaultId },
          WRITE_OPTIONS,
        );
        setTxid(txID);

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
      <BaseModal onClose={onClose} useDefaultPadding={false}>
        <div className="w-[28.4375rem] text-left">
          <div className="px-8  pb-4 pt-6">
            <div className="text-lg text-high">Expedited Withdrawal</div>
          </div>

          <div className="flex flex-col gap-1 px-8">
            <LabelValueRow label="Label:" value={gateway.settings.label} />
            <LabelValueRow
              label="Domain:"
              value={gateway.settings.fqdn}
              isLink={true}
            />
            <LabelValueRow
              label="Address:"
              value={formatAddress(gatewayAddress)}
            />
            <LabelValueRow
              label="Original Date of Return:"
              value={formatDateTime(new Date(vault.endTimestamp))}
            />
          </div>

          <div className="mx-8 mt-4 flex flex-col gap-3 rounded bg-containerL3 p-4  text-[0.8125rem]">
            <div className="grow text-high">
              You are about to expedite your withdrawal, subject to a dynamic
              fee. Please note:
            </div>
            <ul className="list-disc space-y-2 pl-4">
              <li>
                A fee of{' '}
                {calculatedFeeAndAmountReturning
                  ? (calculatedFeeAndAmountReturning.penaltyRate * 100).toFixed(
                      2,
                    )
                  : ''}
                % will be applied to your withdrawal based on the current time
                remaining until your original return date.
              </li>
              <li>This action is irreversible once confirmed.</li>
              <li>
                Your staked tokens will return immediately to your wallet.
              </li>
            </ul>
          </div>

          <div className="mt-4 flex flex-col gap-1 px-8">
            <LabelValueRow
              label="Stake Withdrawing:"
              value={`${formatWithCommas(new mIOToken(vault.balance).toIO().valueOf())} ${ticker}`}
            />

            <LabelValueRow
              label="Early Withdrawal Fee:"
              value={
                calculatedFeeAndAmountReturning
                  ? `${formatWithCommas(calculatedFeeAndAmountReturning.fee)} ${ticker}`
                  : ''
              }
              rightIcon={
                <Tooltip
                  message={
                    <div>
                      <p>
                        Expedited withdrawal fee starts at 50% and declines
                        linearly to 10% over the withdrawal period.
                      </p>
                    </div>
                  }
                >
                  <InfoIcon className="size-[1.125rem]" />
                </Tooltip>
              }
            />
            <LabelValueRow
              label="Amount Returning:"
              value={
                calculatedFeeAndAmountReturning
                  ? `${formatWithCommas(calculatedFeeAndAmountReturning.amountReturning)} ${ticker}`
                  : ''
              }
            />
          </div>

          <div className="px-8 pb-8 pt-6">
            <div className="mb-6 flex flex-col items-center gap-2 text-sm text-mid">
              <div>
                Please type &quot;WITHDRAW&quot; in the text box to proceed.
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
                onClick={processInstantWithdrawal}
                buttonType={ButtonType.PRIMARY}
                title="Leave Network"
                text={<div className="py-2">Withdraw</div>}
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

export default InstantWithdrawalModal;
