import { IOToken, mIOToken } from '@ar.io/sdk/web';
import useGateway from '@src/hooks/useGateway';
import { useGlobalState } from '@src/store';
import { showErrorToast } from '@src/utils/toast';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import ErrorMessageIcon from '../forms/ErrorMessageIcon';
import {
  validateIOAmount,
  validateUnstakeAmount,
  validateWalletAddress,
} from '../forms/validation';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

const DisplayRow = ({
  label,
  value,
  className,
  isLink = false,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  className?: string;
}) => {
  return (
    <div className={`flex items-center text-[13px] ${className}`}>
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
        <div className="text-left text-low">{value}</div>
      )}
    </div>
  );
};

const StakingModal = ({
  open,
  onClose,
  ownerWallet,
}: {
  open: boolean;
  onClose: () => void;
  ownerWallet?: string;
}) => {
  const balances = useGlobalState((state) => state.balances);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

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

  const delegateData = walletAddress
    ? (gateway?.delegates[walletAddress?.toString()] as any)
    : undefined;

  const existingStake = new mIOToken(delegateData?.delegatedStake ?? 0)
    .toIO()
    .valueOf();
  const minDelegatedStake = gateway
    ? new mIOToken(gateway?.settings.minDelegatedStake).toIO().valueOf()
    : 100;
  const minRequiredStakeToAdd = existingStake > 0 ? 1 : minDelegatedStake;

  const validators = {
    address: validateWalletAddress('Gateway Owner'),
    stakeAmount: validateIOAmount(
      'Stake Amount',
      minRequiredStakeToAdd,
      balances.io,
    ),
    unstakeAmount: validateUnstakeAmount(
      'Unstake Amount',
      existingStake,
      minDelegatedStake,
    ),
  };

  const isFormValid = () => {
    if (!gateway) {
      return false;
    }
    if (tab == 0) {
      return validators.stakeAmount(amountToStake) == undefined;
    } else {
      return validators.unstakeAmount(amountToUnstake) == undefined;
    }
  };

  const currentStake = new mIOToken(
    (delegateData?.delegatedStake as number) ?? 0,
  )
    .toIO()
    .valueOf();
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

  const disableInput = !gateway
    ? true
    : tab == 0
      ? balances.io < minRequiredStakeToAdd
      : currentStake <= 0;

  const submitForm = async () => {
    if (walletAddress && arIOWriteableSDK && gateway && isFormValid()) {
      setShowBlockingMessageModal(true);

      try {
        if (tab == 0) {
          const { id: txID } = await arIOWriteableSDK.increaseDelegateStake({
            target: gatewayOwnerWallet,
            qty: new IOToken(parseFloat(amountToStake)).toMIO(),
          });

          // TODO: replace with logger call at INFO level when logger reinstated
          console.log('Increase Delegate Stake txID:', txID);
        } else {
          const { id: txID } = await arIOWriteableSDK.decreaseDelegateStake({
            target: gatewayOwnerWallet,
            qty: new IOToken(parseFloat(amountToUnstake)).toMIO(),
          });

          // TODO: replace with logger call at INFO level when logger reinstated
          console.log('Decrease Delegate Stake txID:', txID);
        }
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
        : undefined,
  };

  return (
    <BaseModal open={open} onClose={onClose} useDefaultPadding={false}>
      <div className="w-[456px]">
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
        <div className="flex flex-col p-[32px]">
          <div className="text-left text-sm text-mid">Gateway Owner:</div>
          <input
            className={
              'mt-3 size-full rounded-md border border-grey-800 bg-grey-1000 px-[24px] py-[12px] text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
            }
            type="text"
            placeholder="Enter wallet address for Gateway"
            value={userEnteredWalletAddress}
            onChange={(e) => {
              setUserEnteredWalletAddress(e.target.value);
            }}
          />
          <div className="mt-[32px] flex items-center">
            <div className="text-left text-sm text-mid">Amount:</div>
            <div className="grow"></div>
            <div className="text-left text-xs text-low">
              {tab == 0
                ? balances && `Available: ${balances.io} IO`
                : `Available to Unstake: ${currentStake} IO`}
            </div>
          </div>
          <div className="mt-3 flex h-[52px] items-center overflow-hidden rounded-md border border-grey-800">
            <input
              className={
                'size-full grow  bg-grey-1000 px-[24px] py-[12px] text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
              }
              disabled={disableInput}
              readOnly={disableInput}
              type="text"
              placeholder={`Enter amount of IO to ${tab == 0 ? 'stake' : 'unstake'}`}
              value={tab == 0 ? amountToStake : amountToUnstake}
              onChange={(e) => {
                const textValue = e.target.value;

                if (textValue && isNaN(e.target.value as unknown as number)) {
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
              (amountToStake?.length > 0 ||
                balances.io < minRequiredStakeToAdd) &&
              (errorMessages.cannotStake || errorMessages.stakeAmount) && (
                <ErrorMessageIcon errorMessage={errorMessages.cannotStake ?? errorMessages.stakeAmount!} tooltipPadding={12}/>
              )}
            {tab == 1 &&
              amountToUnstake?.length > 0 &&
              errorMessages.unstakeAmount && (
                <ErrorMessageIcon errorMessage={errorMessages.unstakeAmount} tooltipPadding={12}/>
              )}
            <Button
              className="mr-[12px] h-[28px]"
              onClick={disableInput ? undefined : setMaxAmount}
              buttonType={ButtonType.SECONDARY}
              active={true}
              title="Max"
              text="Max"
            />
          </div>
          <div className="mt-[32px]">
            {tab == 0 && (
              <DisplayRow
                className="border-b border-divider pb-[16px]"
                label="Existing Stake:"
                value={`${existingStake} IO`}
              />
            )}
            <DisplayRow
              className="pb-[4px] pt-[16px]"
              label="Label:"
              value={gateway ? gateway.settings.label : '-'}
            />

            <DisplayRow
              className="py-[4px]"
              label="Domain:"
              isLink={true}
              value={gateway ? gateway.settings.fqdn : '-'}
            />

            <DisplayRow className="py-[4px]" label="EEY:" value="-" />

            <DisplayRow
              className="py-[4px]"
              label="Unlock Period:"
              value="21 days"
            />
          </div>
        </div>
        <div className="flex size-full flex-col p-[32px]">
          <DisplayRow
            className="py-[4px] first:text-mid last:text-mid"
            label="Fee:"
            value="- AR"
          />

          {tab == 0 && (
            <DisplayRow
              className="py-[4px]"
              label="Remaining Balance:"
              value={`${remainingBalance} IO`}
            />
          )}
          <DisplayRow
            className="py-[4px]"
            label="New Total Stake:"
            value={`${
              isFormValid()
                ? tab == 0
                  ? currentStake + parseFloat(amountToStake)
                  : currentStake - parseFloat(amountToUnstake)
                : '-'
            } IO`}
          />
          <div
            className={
              isFormValid() ? undefined : 'pointer-events-none opacity-30'
            }
          >
            <Button
              className="mt-[32px] h-[52px] w-full"
              onClick={submitForm}
              buttonType={ButtonType.PRIMARY}
              title={tab == 0 ? 'Stake IO' : 'Unstake IO'}
              text={tab == 0 ? 'Stake IO' : 'Unstake IO'}
            />
          </div>
        </div>
        {showBlockingMessageModal && (
          <BlockingMessageModal
            open={showBlockingMessageModal}
            onClose={() => setShowBlockingMessageModal(false)}
            message="Sign the following data with your wallet to proceed."
          ></BlockingMessageModal>
        )}
        {showSuccessModal && (
          <SuccessModal
            open={showSuccessModal}
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
