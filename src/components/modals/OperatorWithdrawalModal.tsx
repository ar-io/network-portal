import { AoGatewayWithAddress, mARIOToken } from '@ar.io/sdk/web';
import { Label, Radio, RadioGroup } from '@headlessui/react';
import useBalances from '@src/hooks/useBalances';
import { useGlobalState } from '@src/store';
import { WithdrawalType } from '@src/types';
import { formatAddress, formatWithCommas } from '@src/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button, { ButtonType } from '../Button';
import LabelValueRow from '../LabelValueRow';
import ErrorMessageIcon from '../forms/ErrorMessageIcon';
import { validateOperatorWithdrawAmount } from '../forms/validation';
import { CircleCheckIcon, CircleIcon } from '../icons';
import BaseModal from './BaseModal';
import ReviewWithdrawalModal from './ReviewWithdrawalModal';

const OperatorStakingModal = ({
  onClose,
  gateway,
}: {
  open: boolean;
  onClose: () => void;
  gateway: AoGatewayWithAddress;
}) => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data: balances } = useBalances(walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const [currentStake, setCurrentStake] = useState<number>(0);
  const [amountToWithdraw, setAmountToWithdraw] = useState<string>('');
  const [withdrawalType, setWithdrawalType] =
    useState<WithdrawalType>('standard');

  const [showReviewWithdrawalModal, setShowReviewWithdrawalModal] =
    useState(false);

  useEffect(() => {
    if (!gateway) {
      return;
    }
    setCurrentStake(new mARIOToken(gateway.operatorStake).toARIO().valueOf());
  }, [gateway]);

  const newTotalStake = currentStake - parseFloat(amountToWithdraw);

  const minDelegatedStake = gateway
    ? new mARIOToken(gateway?.settings.minDelegatedStake).toARIO().valueOf()
    : 10;
  const minRequiredStakeToAdd = currentStake > 0 ? 1 : minDelegatedStake;

  const withdrawalFee =
    withdrawalType === 'expedited' ? 0.5 * parseFloat(amountToWithdraw) : 0;
  const returningAmount = isNaN(parseFloat(amountToWithdraw))
    ? '-'
    : +(
        isNaN(withdrawalFee)
          ? parseFloat(amountToWithdraw)
          : parseFloat(amountToWithdraw) - withdrawalFee
      ).toFixed(4);

  const validators = useMemo(
    () => ({
      withdrawAmount: validateOperatorWithdrawAmount(
        'Withdraw Amount',
        ticker,
        currentStake,
      ),
    }),
    [ticker, currentStake],
  );

  const isFormValid = useCallback(() => {
    return validators.withdrawAmount(amountToWithdraw) == undefined;
  }, [amountToWithdraw, validators]);

  const parsedWithdrawing = parseFloat(
    amountToWithdraw.length === 0 ? '0' : amountToWithdraw,
  );
  const remainingWithdrawalBalance = currentStake - 10000 - parsedWithdrawing;

  const setMaxAmount = () => {
    setAmountToWithdraw(currentStake + '');
  };

  const disableInput = !gateway || currentStake <= 0;

  const errorMessages = {
    withdrawAmount: validators.withdrawAmount(amountToWithdraw),
    cannotStake:
      (balances?.io || 0) < minRequiredStakeToAdd
        ? `Insufficient balance, at least ${minRequiredStakeToAdd} IO required.`
        : undefined,
  };

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="w-[28.5rem]">
        <div className="border-b border-b-stroke-low">
          <div className="rounded-tr-xl border-b border-red-400 bg-grey-700 py-3 text-center">
            <span className={'text-gradient'}>Withdraw</span>
          </div>
        </div>
        <div className="flex flex-col p-8 pb-2">
          <div className="flex flex-col gap-2">
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
          </div>

          <div className="mt-8 flex items-center">
            <div className="text-left text-sm text-mid">Amount:</div>
            <div className="grow"></div>
            <div className="text-left text-xs text-low">
              {`Available to Withdraw: ${remainingWithdrawalBalance >= 0 ? formatWithCommas(remainingWithdrawalBalance) : '-'} ${ticker}`}
            </div>
          </div>
          <div className="mt-3 flex h-[3.25rem] items-center overflow-hidden rounded-md border border-grey-800">
            <input
              className={
                'size-full grow  bg-grey-1000 px-6 py-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
              }
              disabled={disableInput}
              readOnly={disableInput}
              type="text"
              placeholder={`Enter amount of ${ticker} to withdraw'}`}
              value={amountToWithdraw}
              onChange={(e) => {
                const textValue = e.target.value;

                if (textValue && isNaN(+e.target.value)) {
                  return;
                }

                setAmountToWithdraw(textValue);
              }}
            ></input>

            {amountToWithdraw?.length > 0 && errorMessages.withdrawAmount && (
              <ErrorMessageIcon
                errorMessage={errorMessages.withdrawAmount}
                tooltipPadding={'3'}
              />
            )}
            <Button
              className="mr-3 h-7"
              onClick={disableInput ? undefined : setMaxAmount}
              buttonType={ButtonType.SECONDARY}
              active={true}
              title="Max"
              text="Max"
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <RadioGroup
              className="my-2 flex flex-col gap-4 text-sm"
              value={withdrawalType}
              onChange={(v) => setWithdrawalType(v)}
            >
              <Radio
                value="standard"
                className="group flex w-full cursor-pointer rounded 
                  from-gradient-primary-start to-gradient-primary-end data-[checked]:bg-gradient-to-r"
              >
                <div className="m-px flex size-full flex-col gap-1 rounded  bg-containerL3 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <CircleIcon className="visible size-4 group-data-[checked]:hidden" />
                    <CircleCheckIcon className="hidden size-4 group-data-[checked]:block" />
                    <Label>Standard Withdrawal</Label>
                  </div>
                  <p className="pl-6 text-left text-xs text-mid">
                    90 day withdrawal period with no fees.
                  </p>
                </div>
              </Radio>

              <Radio
                value="expedited"
                className="group flex w-full cursor-pointer rounded 
                  from-gradient-primary-start to-gradient-primary-end data-[checked]:bg-gradient-to-r"
              >
                <div className="m-px flex size-full flex-col gap-1 rounded  bg-containerL3 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <CircleIcon className="visible size-4 group-data-[checked]:hidden" />
                    <CircleCheckIcon className="hidden size-4 group-data-[checked]:block" />
                    <Label>Expedited Withdrawal</Label>
                  </div>
                  <p className="pl-6 text-left text-xs text-mid">
                    Instant withdrawal with 50% fee.
                  </p>
                </div>
              </Radio>
            </RadioGroup>
          </div>
        </div>
        <div className="flex size-full flex-col gap-2 bg-containerL0 px-8 pb-8 pt-4">
          {withdrawalType == 'expedited' && (
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

          <div className="flex flex-col gap-2">
            <LabelValueRow
              label="New Total Stake:"
              value={`${
                isFormValid() ? formatWithCommas(newTotalStake) : '-'
              } ${ticker}`}
            />
          </div>
          <div
            className={
              isFormValid() ? undefined : 'pointer-events-none opacity-30'
            }
          >
            <Button
              className="mt-4 h-[3.25rem] w-full"
              onClick={() => {
                setShowReviewWithdrawalModal(true);
              }}
              buttonType={ButtonType.PRIMARY}
              title="Review"
              text="Review"
            />
          </div>
        </div>
        {showReviewWithdrawalModal && gateway && walletAddress && (
          <ReviewWithdrawalModal
            amountToWithdraw={parseFloat(amountToWithdraw)}
            withdrawalType={withdrawalType}
            gateway={gateway}
            onClose={() => setShowReviewWithdrawalModal(false)}
            onSuccess={() => onClose()}
            ticker={ticker}
            walletAddress={walletAddress}
            withdrawalFee={withdrawalFee}
            returningAmount={returningAmount}
          />
        )}
      </div>
    </BaseModal>
  );
};

export default OperatorStakingModal;
