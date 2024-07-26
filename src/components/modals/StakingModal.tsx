import { IOToken, mIOToken } from '@ar.io/sdk/web';
import {
  EAY_TOOLTIP_FORMULA,
  EAY_TOOLTIP_TEXT,
  WRITE_OPTIONS,
  log,
} from '@src/constants';
import useGateway from '@src/hooks/useGateway';
import useRewardsInfo from '@src/hooks/useRewardsInfo';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { MathJax } from 'better-react-mathjax';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import Tooltip from '../Tooltip';
import ErrorMessageIcon from '../forms/ErrorMessageIcon';
import {
  validateIOAmount,
  validateUnstakeAmount,
  validateWalletAddress,
} from '../forms/validation';
import { InfoIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import UnstakeWarning from './UnstakeWarning';

const DisplayRow = ({
  label,
  value,
  className,
  isLink = false,
  rightIcon,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  className?: string;
  rightIcon?: React.ReactNode;
}) => {
  return (
    <div className={`flex items-center text-[0.8125rem] ${className}`}>
      <div className="text-left text-low">{label}</div>
      <div className="grow"></div>
      {isLink && value !== '-' ? (
        <a
          className="text-gradient"
          href={`https://${value}`}
          target="_blank"
          rel="noreferrer"
        >
          {value}
        </a>
      ) : (
        <div className="flex gap-1 text-left text-low items-center">
          {value}
          {rightIcon}
        </div>
      )}
    </div>
  );
};

const StakingModal = ({
  onClose,
  ownerWallet,
}: {
  open: boolean;
  onClose: () => void;
  ownerWallet?: string;
}) => {
  const queryClient = useQueryClient();

  const balances = useGlobalState((state) => state.balances);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const ticker = useGlobalState((state) => state.ticker);

  const [tab, setTab] = useState<number>(0);
  const [userEnteredWalletAddress, setUserEnteredWalletAddress] =
    useState<string>('');

  const [amountToStake, setAmountToStake] = useState<string>('');
  const [amountToUnstake, setAmountToUnstake] = useState<string>('');

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const gatewayOwnerWallet =
    ownerWallet?.toString() ?? userEnteredWalletAddress;

  const { data: gateway } = useGateway({
    ownerWalletAddress: gatewayOwnerWallet,
  });

  const allowDelegatedStaking =
    gateway?.settings.allowDelegatedStaking ?? false;

  const delegateData = walletAddress
    ? gateway?.delegates[walletAddress?.toString()]
    : undefined;
  const currentStake = new mIOToken(delegateData?.delegatedStake ?? 0)
    .toIO()
    .valueOf();

  const newTotalStake =
    tab == 0
      ? currentStake + parseFloat(amountToStake)
      : currentStake - parseFloat(amountToUnstake);
  const rewardsInfo = useRewardsInfo(gateway, newTotalStake);
  const EAY =
    rewardsInfo && newTotalStake > 0
      ? (rewardsInfo.EAY * 100).toLocaleString('en-us', {
          maximumFractionDigits: 2,
        }) + '%'
      : '-';

  const existingStake = new mIOToken(delegateData?.delegatedStake ?? 0)
    .toIO()
    .valueOf();
  const minDelegatedStake = gateway
    ? new mIOToken(gateway?.settings.minDelegatedStake).toIO().valueOf()
    : 500;
  const minRequiredStakeToAdd = existingStake > 0 ? 1 : minDelegatedStake;

  const validators = {
    address: validateWalletAddress('Gateway Owner'),
    stakeAmount: validateIOAmount(
      'Stake Amount',
      ticker,
      minRequiredStakeToAdd,
      balances.io,
    ),
    unstakeAmount: validateUnstakeAmount(
      'Unstake Amount',
      ticker,
      existingStake,
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
      return validators.unstakeAmount(amountToUnstake) == undefined;
    }
  };

  const remainingBalance = isFormValid()
    ? balances.io - parseFloat(amountToStake)
    : '-';

  const baseTabClassName = 'text-center py-6';
  const selectedTabClassNames = `${baseTabClassName} bg-grey-700 border-b border-red-400`;
  const nonSelectedTabClassNames = `${baseTabClassName} bg-grey-1000 text-low`;

  const setMaxAmount = () => {
    if (tab == 0) {
      setAmountToStake(balances.io + '');
    } else {
      setAmountToUnstake(currentStake + '');
    }
  };

  const disableInput =
    !gateway ||
    (tab == 0 &&
      (balances.io < minRequiredStakeToAdd || !allowDelegatedStaking)) ||
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
              decreaseQty: new IOToken(parseFloat(amountToUnstake)).toMIO(),
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
    unstakeAmount: validators.unstakeAmount(amountToUnstake),
    cannotStake:
      balances.io < minRequiredStakeToAdd
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
            <span className={tab == 0 ? 'text-gradient' : ''}>Staking</span>
          </button>
          <button
            className={`${tab == 1 ? selectedTabClassNames : nonSelectedTabClassNames} rounded-tr-lg`}
            onClick={() => setTab(1)}
          >
            <span className={tab == 1 ? 'text-gradient' : ''}>Unstaking</span>
          </button>
        </div>
        <div className="flex flex-col p-8">
          <div className="text-left text-sm text-mid">Gateway Owner:</div>
          {ownerWallet ? (
            <div className="py-3 text-left text-sm text-mid">
              {ownerWallet}
            </div>
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
                : `Available to Unstake: ${formatWithCommas(currentStake)} ${ticker}`}
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
              placeholder={`Enter amount of ${ticker} to ${tab == 0 ? 'stake' : 'unstake'}`}
              value={tab == 0 ? amountToStake : amountToUnstake}
              onChange={(e) => {
                const textValue = e.target.value;

                if (textValue && isNaN(+e.target.value)) {
                  return;
                }

                if (tab == 0) {
                  setAmountToStake(textValue);
                } else {
                  setAmountToUnstake(textValue);
                }
              }}
            ></input>
            {tab == 0 &&
              gateway &&
              (amountToStake?.length > 0 ||
                balances.io < minRequiredStakeToAdd ||
                !allowDelegatedStaking) &&
              (errorMessages.cannotStake || errorMessages.stakeAmount) && (
                <ErrorMessageIcon
                  errorMessage={
                    errorMessages.cannotStake ?? errorMessages.stakeAmount!
                  }
                  tooltipPadding={"3"}
                />
              )}
            {tab == 1 &&
              amountToUnstake?.length > 0 &&
              errorMessages.unstakeAmount && (
                <ErrorMessageIcon
                  errorMessage={errorMessages.unstakeAmount}
                  tooltipPadding={"3"}
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
              <DisplayRow
                className="border-b border-divider pb-4"
                label="Existing Stake:"
                value={`${existingStake} ${ticker}`}
              />
            )}
            <DisplayRow
              className="pb-1 pt-4"
              label="Label:"
              value={gateway ? gateway.settings.label : '-'}
            />

            <DisplayRow
              className="py-1"
              label="Domain:"
              isLink={true}
              value={gateway ? gateway.settings.fqdn : '-'}
            />

            <DisplayRow
              className="py-1"
              label="EAY:"
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
                  <InfoIcon className="size-4" />
                </Tooltip>
              }
            />

            <div className="pt-4 text-left">
              <UnstakeWarning />
            </div>
          </div>
        </div>
        <div className="flex size-full flex-col p-8">
          <DisplayRow
            className="py-1 first:text-mid last:text-mid"
            label="Fee:"
            value="- AR"
          />

          {tab == 0 && (
            <DisplayRow
              className="py-1"
              label="Remaining Balance:"
              value={`${remainingBalance !== '-' ? formatWithCommas(+remainingBalance) : remainingBalance} ${ticker}`}
            />
          )}
          <DisplayRow
            className="py-1"
            label="New Total Stake:"
            value={`${
              isFormValid()
                ? tab == 0
                  ? formatWithCommas(currentStake + parseFloat(amountToStake))
                  : formatWithCommas(currentStake - parseFloat(amountToUnstake))
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
              title={tab == 0 ? `Stake ${ticker}` : `Unstake ${ticker}`}
              text={tab == 0 ? `Stake ${ticker}` : `Unstake ${ticker}`}
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
