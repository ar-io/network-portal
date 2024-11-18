import { IOToken, mIOToken } from '@ar.io/sdk/web';
import {
  EAY_TOOLTIP_FORMULA,
  EAY_TOOLTIP_TEXT,
  WRITE_OPTIONS,
  log,
} from '@src/constants';
import useBalances from '@src/hooks/useBalances';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateway from '@src/hooks/useGateway';
import useRewardsInfo from '@src/hooks/useRewardsInfo';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
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
import { InfoIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import WithdrawWarning from './WithdrawWarning';

const StakingModal = ({
  onClose,
  ownerWallet,
}: {
  open: boolean;
  onClose: () => void;
  ownerWallet?: string;
}) => {
  const queryClient = useQueryClient();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data: balances } = useBalances(walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const ticker = useGlobalState((state) => state.ticker);

  const [tab, setTab] = useState<number>(0);
  const [userEnteredWalletAddress, setUserEnteredWalletAddress] =
    useState<string>('');

  const [currentStake, setCurrentStake] = useState<number>(0);
  const [amountToStake, setAmountToStake] = useState<string>('');
  const [amountToWithdraw, setAmountToWithdraw] = useState<string>('');

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    rewardsInfo && newTotalStake > 0
      ? (rewardsInfo.EAY * 100).toLocaleString('en-us', {
          maximumFractionDigits: 2,
        }) + '%'
      : '-';

  const minDelegatedStake = gateway
    ? new mIOToken(gateway?.settings.minDelegatedStake).toIO().valueOf()
    : 500;
  const minRequiredStakeToAdd = currentStake > 0 ? 1 : minDelegatedStake;

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

  const remainingBalance =
    isFormValid() && balances ? balances.io - parseFloat(amountToStake) : '-';

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

  const submitForm = async () => {
    if (walletAddress && arIOWriteableSDK && gateway && isFormValid()) {
      setShowBlockingMessageModal(true);

      try {
        if (tab == 0) {
          const { id: txID } = await arIOWriteableSDK.delegateStake(
            {
              target: gatewayOwnerWallet,
              stakeQty: new IOToken(parseFloat(amountToStake)).toMIO(),
            },
            WRITE_OPTIONS,
          );

          log.info(`Increase Delegate Stake txID: ${txID}`);
        } else {
          const { id: txID } = await arIOWriteableSDK.decreaseDelegateStake(
            {
              target: gatewayOwnerWallet,
              decreaseQty: new IOToken(parseFloat(amountToWithdraw)).toMIO(),
            },
            WRITE_OPTIONS,
          );

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

        setShowSuccessModal(true);
      } catch (e: any) {
        showErrorToast(`${e}`);
      } finally {
        setShowBlockingMessageModal(false);
      }
    }
  };

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
        <div className="grid grid-cols-2">
          <button
            className={`${tab == 0 ? selectedTabClassNames : nonSelectedTabClassNames} rounded-tl-lg`}
            onClick={() => setTab(0)}
          >
            <span className={tab == 0 ? 'text-gradient' : ''}>Stake</span>
          </button>
          <button
            className={`${tab == 1 ? selectedTabClassNames : nonSelectedTabClassNames} rounded-tr-lg`}
            onClick={() => setTab(1)}
          >
            <span className={tab == 1 ? 'text-gradient' : ''}>Withdraw</span>
          </button>
        </div>
        <div className="flex flex-col p-8 pb-2">
          <div className="text-left text-sm text-mid">Gateway Owner:</div>
          {ownerWallet ? (
            <div className="py-3 text-left text-sm text-mid">{ownerWallet}</div>
          ) : (
            <input
              className={
                'mt-3 size-full rounded-md border border-grey-800 bg-grey-1000 px-6 py-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
              }
              type="text"
              placeholder="Enter wallet address for Gateway"
              value={userEnteredWalletAddress}
              onChange={(e) => {
                setUserEnteredWalletAddress(e.target.value);
              }}
              maxLength={43}
            />
          )}
          <div className="mt-8 flex items-center">
            <div className="text-left text-sm text-mid">Amount:</div>
            <div className="grow"></div>
            <div className="text-left text-xs text-low">
              {tab == 0
                ? balances &&
                  `Available: ${formatWithCommas(balances.io)} ${ticker}`
                : `Available to Withdraw: ${formatWithCommas(currentStake)} ${ticker}`}
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
          <div className="mt-8">
            {tab == 0 && (
              <LabelValueRow
                className="border-b border-divider pb-4"
                label="Existing Stake:"
                value={`${currentStake} ${ticker}`}
              />
            )}
            <LabelValueRow
              className="pb-1 pt-4"
              label="Label:"
              value={gateway ? gateway.settings.label : '-'}
            />

            <LabelValueRow
              className="py-1"
              label="Domain:"
              isLink={true}
              value={gateway ? gateway.settings.fqdn : '-'}
            />

            {tab == 0 && (
              <LabelValueRow
                className="py-1"
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
            <div className="pt-4 text-left">
              <WithdrawWarning />
            </div>
          </div>
        </div>
        <div className="flex size-full flex-col p-8">
          <LabelValueRow
            className="py-1 first:text-mid last:text-mid"
            label="Fee:"
            value="- AR"
          />

          {tab == 0 && (
            <LabelValueRow
              className="py-1"
              label="Remaining Balance:"
              value={`${remainingBalance !== '-' ? formatWithCommas(+remainingBalance) : remainingBalance} ${ticker}`}
            />
          )}
          <LabelValueRow
            className="py-1"
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
          <div
            className={
              isFormValid() ? undefined : 'pointer-events-none opacity-30'
            }
          >
            <Button
              className="mt-8 h-[3.25rem] w-full"
              onClick={submitForm}
              buttonType={ButtonType.PRIMARY}
              title={tab == 0 ? `Stake ${ticker}` : `Withdraw ${ticker}`}
              text={tab == 0 ? `Stake ${ticker}` : `Withdraw ${ticker}`}
            />
          </div>
        </div>
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
            title="Congratulations"
            bodyText="You have successfully updated stake."
          />
        )}
      </div>
    </BaseModal>
  );
};

export default StakingModal;
