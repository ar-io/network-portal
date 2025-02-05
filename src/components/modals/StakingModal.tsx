import { mARIOToken } from '@ar.io/sdk/web';
import { EAY_TOOLTIP_FORMULA, EAY_TOOLTIP_TEXT } from '@src/constants';
import useBalances from '@src/hooks/useBalances';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateway from '@src/hooks/useGateway';
import useRewardsInfo from '@src/hooks/useRewardsInfo';
import { useGlobalState } from '@src/store';
import { formatAddress, formatWithCommas } from '@src/utils';
import { MathJax } from 'better-react-mathjax';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import LabelValueRow from '../LabelValueRow';
import Tooltip from '../Tooltip';
import ErrorMessageIcon from '../forms/ErrorMessageIcon';
import { validateARIOAmount, validateWalletAddress } from '../forms/validation';
import { InfoIcon } from '../icons';
import BaseModal from './BaseModal';
import ReviewStakeModal from './ReviewStakeModal';

const StakingModal = ({
  onClose,
  ownerWallet,
}: {
  open: boolean;
  onClose: () => void;
  ownerWallet: string;
}) => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data: balances } = useBalances(walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const [currentStake, setCurrentStake] = useState<number>(0);
  const [amountToStake, setAmountToStake] = useState<string>('');

  const [showReviewStakeModal, setShowReviewStakeModal] = useState(false);

  const { data: gateway } = useGateway({
    ownerWalletAddress: ownerWallet,
  });

  const { data: delegateStakes } = useDelegateStakes(walletAddress?.toString());

  useEffect(() => {
    if (!gateway || !delegateStakes) {
      return;
    }
    const stake = delegateStakes.stakes.find(
      (stake) => stake.gatewayAddress === gateway.gatewayAddress,
    )?.balance;
    setCurrentStake(new mARIOToken(stake ?? 0).toARIO().valueOf());
  }, [delegateStakes, gateway]);

  const allowDelegatedStaking =
    gateway?.settings.allowDelegatedStaking ?? false;

  const newTotalStake = currentStake + parseFloat(amountToStake);
  const newStake = parseFloat(amountToStake);
  const rewardsInfo = useRewardsInfo(gateway, newStake);
  const EAY =
    rewardsInfo && newTotalStake > 0 && !isNaN(rewardsInfo.EAY)
      ? (rewardsInfo.EAY * 100).toLocaleString('en-us', {
          maximumFractionDigits: 2,
        }) + '%'
      : '-';

  const minDelegatedStake = gateway
    ? new mARIOToken(gateway?.settings.minDelegatedStake).toARIO().valueOf()
    : 10;
  const minRequiredStakeToAdd = currentStake > 0 ? 1 : minDelegatedStake;

  const validators = {
    address: validateWalletAddress('Gateway Owner'),
    stakeAmount: validateARIOAmount(
      'Stake Amount',
      ticker,
      minRequiredStakeToAdd,
      balances?.ario,
    ),
  };

  const isFormValid = () => {
    if (!gateway || !allowDelegatedStaking) {
      return false;
    }
    return validators.stakeAmount(amountToStake) == undefined;
  };

  const parsedStake = parseFloat(
    amountToStake.length === 0 ? '0' : amountToStake,
  );
  const remainingBalance =
    balances && parsedStake <= balances.ario ? balances.ario - parsedStake : -1;

  const setMaxAmount = () => {
    setAmountToStake((balances?.ario || 0) + '');
  };

  const disableInput =
    !gateway ||
    (balances?.ario || 0) < minRequiredStakeToAdd ||
    !allowDelegatedStaking;

  const errorMessages = {
    stakeAmount: validators.stakeAmount(amountToStake),
    cannotStake:
      (balances?.ario || 0) < minRequiredStakeToAdd
        ? `Insufficient balance, at least ${minRequiredStakeToAdd} IO required.`
        : !allowDelegatedStaking
          ? 'Gateway does not allow delegated staking.'
          : undefined,
  };

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="w-[28.5rem]">
        <div className="border-b border-b-stroke-low">
          <div className="rounded-tr-xl border-b border-red-400 bg-grey-700 py-3 text-center">
            <span className={'text-gradient'}>Stake</span>
          </div>
        </div>
        <div className="flex flex-col p-8 pb-2">
          <div className="flex flex-col gap-2">
            <LabelValueRow
              label="Gateway Owner:"
              value={formatAddress(ownerWallet)}
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
              {balances &&
                `Available: ${remainingBalance >= 0
                ? formatWithCommas(+remainingBalance)
                : '-'} ${ticker}`}
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
              placeholder={`Enter amount of ${ticker} to stake`}
              value={amountToStake}
              onChange={(e) => {
                const textValue = e.target.value;

                if (textValue && isNaN(+e.target.value)) {
                  return;
                }

                setAmountToStake(textValue);
              }}
            />
            {gateway &&
              (amountToStake?.length > 0 ||
                (balances?.ario || 0) < minRequiredStakeToAdd ||
                !allowDelegatedStaking) &&
              (errorMessages.cannotStake || errorMessages.stakeAmount) && (
                <ErrorMessageIcon
                  errorMessage={
                    errorMessages.cannotStake ?? errorMessages.stakeAmount!
                  }
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
        </div>
        <div className="flex size-full flex-col gap-2 bg-containerL0 px-8 pb-8 pt-4">
          <div className="flex flex-col gap-2">
            <LabelValueRow
              label="Existing Stake:"
              value={`${currentStake} ${ticker}`}
            />

            <LabelValueRow
              label="New Total Stake:"
              value={`${
                isFormValid()
                  ? formatWithCommas(currentStake + parseFloat(amountToStake))
                  : '-'
              } ${ticker}`}
            />

            <LabelValueRow
              label="Delegate EAY:"
              value={EAY}
              rightIcon={
                <Tooltip
                  message={
                    <div>
                      <p>{EAY_TOOLTIP_TEXT}</p>
                      <MathJax className="mt-4">{EAY_TOOLTIP_FORMULA}</MathJax>
                    </div>
                  }
                >
                  <InfoIcon className="size-[1.125rem]" />
                </Tooltip>
              }
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
                setShowReviewStakeModal(true);
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
      </div>
    </BaseModal>
  );
};

export default StakingModal;
