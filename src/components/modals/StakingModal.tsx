import { mIOToken } from '@ar.io/sdk/web';
import { Label, Radio, RadioGroup } from '@headlessui/react';
import { EAY_TOOLTIP_FORMULA, EAY_TOOLTIP_TEXT } from '@src/constants';
import useBalances from '@src/hooks/useBalances';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateway from '@src/hooks/useGateway';
import useRewardsInfo from '@src/hooks/useRewardsInfo';
import { useGlobalState } from '@src/store';
import { WithdrawalType } from '@src/types';
import { formatAddress, formatWithCommas } from '@src/utils';
import { MathJax } from 'better-react-mathjax';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import LabelValueRow from '../LabelValueRow';
import Tooltip from '../Tooltip';
import ErrorMessageIcon from '../forms/ErrorMessageIcon';
import {
  validateIOAmount,
  validateWalletAddress,
  validateWithdrawAmount,
} from '../forms/validation';
import { CircleCheckIcon, CircleIcon, InfoIcon } from '../icons';
import BaseModal from './BaseModal';
import ReviewStakeModal from './ReviewStakeModal';
import ReviewWithdrawalModal from './ReviewWithdrawalModal';

const StakingModal = ({
  onClose,
  ownerWallet,
}: {
  open: boolean;
  onClose: () => void;
  ownerWallet?: string;
}) => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data: balances } = useBalances(walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const [tab, setTab] = useState<number>(0);
  const [userEnteredWalletAddress, setUserEnteredWalletAddress] =
    useState<string>('');

  const [currentStake, setCurrentStake] = useState<number>(0);
  const [amountToStake, setAmountToStake] = useState<string>('');
  const [amountToWithdraw, setAmountToWithdraw] = useState<string>('');
  const [withdrawalType, setWithdrawalType] =
    useState<WithdrawalType>('standard');

  const [showReviewStakeModal, setShowReviewStakeModal] = useState(false);
  const [showReviewWithdrawalModal, setShowReviewWithdrawalModal] =
    useState(false);

  const gatewayOwnerWallet =
    ownerWallet?.toString() ?? userEnteredWalletAddress;

  const { data: gateway } = useGateway({
    ownerWalletAddress: gatewayOwnerWallet,
  });

  const { data: delegateStakes } = useDelegateStakes(walletAddress?.toString());

  useEffect(() => {
    if (!gateway || !delegateStakes) {
      return;
    }
    const stake = delegateStakes.stakes.find(
      (stake) => stake.gatewayAddress === gateway.gatewayAddress,
    )?.balance;
    setCurrentStake(new mIOToken(stake ?? 0).toIO().valueOf());
  }, [delegateStakes, gateway]);

  const allowDelegatedStaking =
    gateway?.settings.allowDelegatedStaking ?? false;

  const newTotalStake =
    tab == 0
      ? currentStake + parseFloat(amountToStake)
      : currentStake - parseFloat(amountToWithdraw);
  const newStake =
    tab == 0 ? parseFloat(amountToStake) : -parseFloat(amountToWithdraw);
  const rewardsInfo = useRewardsInfo(gateway, newStake);
  const EAY =
    rewardsInfo && newTotalStake > 0 && !isNaN(rewardsInfo.EAY)
      ? (rewardsInfo.EAY * 100).toLocaleString('en-us', {
          maximumFractionDigits: 2,
        }) + '%'
      : '-';

  const minDelegatedStake = gateway
    ? new mIOToken(gateway?.settings.minDelegatedStake).toIO().valueOf()
    : 500;
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

  const validators = {
    address: validateWalletAddress('Gateway Owner'),
    stakeAmount: validateIOAmount(
      'Stake Amount',
      ticker,
      minRequiredStakeToAdd,
      balances?.io,
    ),
    withdrawAmount: validateWithdrawAmount(
      'Withdraw Amount',
      ticker,
      currentStake,
      minDelegatedStake,
    ),
  };

  const isFormValid = () => {
    if (!gateway || (tab == 0 && !allowDelegatedStaking)) {
      return false;
    }
    if (tab == 0) {
      return validators.stakeAmount(amountToStake) == undefined;
    } else {
      return validators.withdrawAmount(amountToWithdraw) == undefined;
    }
  };

  const parsedStake = parseFloat(
    amountToStake.length === 0 ? '0' : amountToStake,
  );
  const remainingBalance =
    balances && parsedStake <= balances.io ? balances.io - parsedStake : -1;

  const parsedWithdrawing = parseFloat(amountToWithdraw.length === 0 ? '0' : amountToWithdraw);
  const remainingWithdrawalBalance = currentStake - parsedWithdrawing;

  const baseTabClassName = 'text-center py-3';
  const selectedTabClassNames = `${baseTabClassName} bg-grey-700 border-b border-red-400`;
  const nonSelectedTabClassNames = `${baseTabClassName} bg-grey-1000 text-low`;

  const setMaxAmount = () => {
    if (tab == 0) {
      setAmountToStake((balances?.io || 0) + '');
    } else {
      setAmountToWithdraw(currentStake + '');
    }
  };

  const disableInput =
    !gateway ||
    (tab == 0 &&
      ((balances?.io || 0) < minRequiredStakeToAdd ||
        !allowDelegatedStaking)) ||
    (tab == 1 && currentStake <= 0);

  const errorMessages = {
    gatewayOwner: validators.address(gatewayOwnerWallet),
    stakeAmount: validators.stakeAmount(amountToStake),
    withdrawAmount: validators.withdrawAmount(amountToWithdraw),
    cannotStake:
      (balances?.io || 0) < minRequiredStakeToAdd
        ? `Insufficient balance, at least ${minRequiredStakeToAdd} IO required.`
        : !allowDelegatedStaking
          ? 'Gateway does not allow delegated staking.'
          : undefined,
  };

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="w-[28.5rem]">
        <div className="grid grid-cols-2 border-b border-b-stroke-low">
          <button
            className={`${tab == 0 ? selectedTabClassNames : nonSelectedTabClassNames} rounded-tl-xl`}
            onClick={() => setTab(0)}
          >
            <span className={tab == 0 ? 'text-gradient' : ''}>Stake</span>
          </button>
          <button
            className={`${tab == 1 ? selectedTabClassNames : nonSelectedTabClassNames} rounded-tr-xl`}
            onClick={() => setTab(1)}
          >
            <span className={tab == 1 ? 'text-gradient' : ''}>Withdraw</span>
          </button>
        </div>
        <div className="flex flex-col p-8 pb-2">
          <div className="flex flex-col gap-2">
            {ownerWallet ? (
              <LabelValueRow
                label="Gateway Owner:"
                value={formatAddress(ownerWallet)}
              />
            ) : (
              <>
                <div className="text-left text-sm text-mid">Gateway Owner:</div>
                <input
                  className={
                    'mb-2 size-full rounded-md border border-grey-800 bg-grey-1000 px-6 py-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
                  }
                  type="text"
                  placeholder="Enter wallet address for Gateway"
                  value={userEnteredWalletAddress}
                  onChange={(e) => {
                    setUserEnteredWalletAddress(e.target.value);
                  }}
                  maxLength={43}
                />
              </>
            )}

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
              {tab == 0
                ? balances &&
                  `Available: ${remainingBalance >= 0 ? formatWithCommas(+remainingBalance) : '-'} ${ticker}`
                : `Available to Withdraw: ${remainingWithdrawalBalance >= 0 ? formatWithCommas(remainingWithdrawalBalance) : '-'} ${ticker}`}
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
              placeholder={`Enter amount of ${ticker} to ${tab == 0 ? 'stake' : 'withdraw'}`}
              value={tab == 0 ? amountToStake : amountToWithdraw}
              onChange={(e) => {
                const textValue = e.target.value;

                if (textValue && isNaN(+e.target.value)) {
                  return;
                }

                if (tab == 0) {
                  setAmountToStake(textValue);
                } else {
                  setAmountToWithdraw(textValue);
                }
              }}
            ></input>
            {tab == 0 &&
              gateway &&
              (amountToStake?.length > 0 ||
                (balances?.io || 0) < minRequiredStakeToAdd ||
                !allowDelegatedStaking) &&
              (errorMessages.cannotStake || errorMessages.stakeAmount) && (
                <ErrorMessageIcon
                  errorMessage={
                    errorMessages.cannotStake ?? errorMessages.stakeAmount!
                  }
                  tooltipPadding={'3'}
                />
              )}
            {tab == 1 &&
              amountToWithdraw?.length > 0 &&
              errorMessages.withdrawAmount && (
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
            {tab == 1 && (
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
                      30 day withdrawal period with no fees.
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
            )}
          </div>
        </div>
        <div className="flex size-full flex-col gap-2 bg-containerL0 px-8 pt-4 pb-8">
          {tab == 1 && withdrawalType == 'expedited' && (
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
            {tab == 0 && (
              <LabelValueRow
                label="Existing Stake:"
                value={`${currentStake} ${ticker}`}
              />
            )}

            <LabelValueRow
              label="New Total Stake:"
              value={`${
                isFormValid()
                  ? tab == 0
                    ? formatWithCommas(currentStake + parseFloat(amountToStake))
                    : formatWithCommas(
                        currentStake - parseFloat(amountToWithdraw),
                      )
                  : '-'
              } ${ticker}`}
            />

            {tab == 0 && (
              <LabelValueRow
                label="Delegate EAY:"
                value={EAY}
                rightIcon={
                  <Tooltip
                    message={
                      <div>
                        <p>{EAY_TOOLTIP_TEXT}</p>
                        <MathJax className="mt-4">
                          {EAY_TOOLTIP_FORMULA}
                        </MathJax>
                      </div>
                    }
                  >
                    <InfoIcon className="size-[1.125rem]" />
                  </Tooltip>
                }
              />
            )}
          </div>
          <div
            className={
              isFormValid() ? undefined : 'pointer-events-none opacity-30'
            }
          >
            <Button
              className="mt-4 h-[3.25rem] w-full"
              onClick={() => {
                tab == 0
                  ? setShowReviewStakeModal(true)
                  : setShowReviewWithdrawalModal(true);
              }}
              buttonType={ButtonType.PRIMARY}
              title="Review"
              text="Review"
            />
          </div>
        </div>
        {showReviewStakeModal && gateway && walletAddress && (
          <ReviewStakeModal
            amountToStake={parseFloat(amountToStake)}
            gateway={gateway}
            onClose={() => setShowReviewStakeModal(false)}
            onSuccess={() => onClose()}
            ticker={ticker}
            walletAddress={walletAddress}
          />
        )}
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

export default StakingModal;
