import { AoGatewayWithAddress, ARIOToken, mARIOToken } from '@ar.io/sdk/web';
import { REDELEGATION_FEE_TOOLTIP_TEXT } from '@src/constants';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateways from '@src/hooks/useGateways';
import useRedelegationFee from '@src/hooks/useRedelegationFee';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { InfoIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button, { ButtonType } from '../Button';
import GatewaySelector from '../GatewaySelector';
import LabelValueRow from '../LabelValueRow';
import Tooltip from '../Tooltip';
import ErrorMessageIcon from '../forms/ErrorMessageIcon';
import { validateARIOAmount } from '../forms/validation';
import BaseModal from './BaseModal';
import ReviewRedelegateModal from './ReviewRedelegateModal';

export type RedelegateModalProps = {
  onClose: () => void;
  sourceGateway: AoGatewayWithAddress;
  vaultId?: string;
  maxRedelegationStake: ARIOToken;
};

const RedelegateModal = ({
  onClose,
  sourceGateway,
  vaultId,
  maxRedelegationStake,
}: RedelegateModalProps) => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const { data: delegateStakes } = useDelegateStakes(walletAddress?.toString());

  const [targetGateway, setTargetGateway] = useState<AoGatewayWithAddress>();
  const [targetGatewayCurrentStake, setTargetGatewayCurrentStake] =
    useState<number>();

  const [amountToRedelegate, setAmountToRedelegate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const [showReviewRedelegateModal, setShowReviewRedelegateModal] =
    useState(false);

  const { data: redelegationFee } = useRedelegationFee(
    walletAddress?.toString(),
  );

  const { data: gateways } = useGateways();
  const [filteredGateways, setFilteredGateways] =
    useState<AoGatewayWithAddress[]>();

  useEffect(() => {
    if (gateways) {
      const filteredGateways = Object.entries(gateways)
        .map(([address, gateway]) => {
          return { ...gateway, gatewayAddress: address };
        })
        .filter(
          (gateway) =>
            gateway.status === 'joined' &&
            gateway.settings.allowDelegatedStaking &&
            gateway.gatewayAddress !== sourceGateway.gatewayAddress,
        );
      setFilteredGateways(filteredGateways);
    }
  }, [gateways, sourceGateway.gatewayAddress]);

  useEffect(() => {
    if (targetGateway && walletAddress) {
      if (targetGateway.gatewayAddress === walletAddress.toString()) {
        setTargetGatewayCurrentStake(
          new mARIOToken(targetGateway.operatorStake).toARIO().valueOf(),
        );
      } else if (delegateStakes) {
        const stake = delegateStakes.stakes.find(
          (stake) => stake.gatewayAddress === targetGateway.gatewayAddress,
        )?.balance;
        setTargetGatewayCurrentStake(
          new mARIOToken(stake ?? 0).toARIO().valueOf(),
        );
      }
    }
  }, [targetGateway, delegateStakes, walletAddress]);

  const minDelegatedStake = targetGateway
    ? new mARIOToken(targetGateway?.settings.minDelegatedStake)
        .toARIO()
        .valueOf()
    : 10;
  const minRequiredStakeToAdd =
    (targetGatewayCurrentStake ?? 0) > 0 ? 1 : minDelegatedStake;

  const validators = useMemo(
    () => ({
      redelegationAmount: validateARIOAmount(
        'Redelegation Amount',
        ticker,
        minRequiredStakeToAdd,
        maxRedelegationStake.valueOf(),
      ),
    }),
    [ticker, minRequiredStakeToAdd, maxRedelegationStake],
  );

  useEffect(() => {
    if (!targetGateway) {
      setIsFormValid(false);
      return;
    }

    const amount = parseFloat(amountToRedelegate);
    const maxStake = maxRedelegationStake.valueOf();

    const sourceMinStakeARIO = new mARIOToken(
      sourceGateway.settings.minDelegatedStake,
    )
      .toARIO()
      .valueOf();

    if (
      // checking if redelegation source is from a stake rather than a vault
      vaultId === undefined &&
      amount != maxStake &&
      maxStake - amount < sourceMinStakeARIO
    ) {
      setErrorMessage(
        `Amount to redelegate must either leave enough stake to meet the source gateway's minimum delegated stake (${formatWithCommas(sourceMinStakeARIO)} ${ticker}) or move the entire stake completely.`,
      );
      setIsFormValid(false);
      return;
    }

    const redelegationAmountError =
      validators.redelegationAmount(amountToRedelegate);

    if (redelegationAmountError !== undefined) {
      setErrorMessage(redelegationAmountError);
      setIsFormValid(false);
      return;
    }

    if (maxStake < minRequiredStakeToAdd) {
      setErrorMessage(
        `Insufficient redelegation balance, at least ${minRequiredStakeToAdd} ${ticker} required for target gateway.`,
      );
      setIsFormValid(false);
      return;
    }

    setErrorMessage(undefined);
    setIsFormValid(true);
  }, [
    amountToRedelegate,
    maxRedelegationStake,
    minRequiredStakeToAdd,
    sourceGateway.settings.minDelegatedStake,
    targetGateway,
    ticker,
    validators,
    vaultId,
  ]);

  const fee = useMemo(() => {
    if (redelegationFee && amountToRedelegate && isFormValid) {
      const feeAmount =
        (redelegationFee.redelegationFeeRate / 100) *
        parseFloat(amountToRedelegate);
      return feeAmount;
    }
    return 0;
  }, [redelegationFee, amountToRedelegate, isFormValid]);

  const totalRedelegatedStake = parseFloat(amountToRedelegate) - fee;
  const newTotalStake =
    (targetGatewayCurrentStake ?? 0) + totalRedelegatedStake;

  const parsedStake = parseFloat(
    amountToRedelegate.length === 0 ? '0' : amountToRedelegate,
  );
  const remainingBalance =
    parsedStake <= maxRedelegationStake.valueOf()
      ? maxRedelegationStake.valueOf() - parsedStake
      : -1;

  const setMaxAmount = () => {
    setAmountToRedelegate(maxRedelegationStake + '');
  };

  const disableInput =
    !targetGateway || maxRedelegationStake.valueOf() < minRequiredStakeToAdd;

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="w-[28.5rem]">
        <div className="border-b border-b-stroke-low">
          <div className="rounded-tr-xl border-b border-red-400 bg-grey-700 py-3 text-center">
            <span className={'text-gradient'}>Redelegate</span>
          </div>
        </div>
        <div className="flex flex-col p-8 pb-2">
          <div className="flex flex-col gap-2">
            <div className="mb-1">
              <GatewaySelector
                selectedGateway={targetGateway}
                setSelectedGateway={setTargetGateway}
                gateways={filteredGateways}
              />
            </div>

            <LabelValueRow
              label="Label:"
              value={targetGateway ? targetGateway.settings.label : '-'}
            />

            <LabelValueRow
              label="Domain:"
              isLink={true}
              value={targetGateway ? targetGateway.settings.fqdn : '-'}
            />

            <LabelValueRow
              label="Current Stake:"
              value={`${targetGatewayCurrentStake ? formatWithCommas(targetGatewayCurrentStake) : '0'} ${ticker}`}
            />
          </div>

          <div className="mt-8 flex items-center">
            <div className="text-left text-sm text-mid">Amount:</div>
            <div className="grow"></div>
            <div className="text-left text-xs text-low">
              {`Available: ${
                remainingBalance >= 0
                  ? formatWithCommas(+remainingBalance)
                  : '-'
              } ${ticker}`}
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
              value={amountToRedelegate}
              onChange={(e) => {
                const textValue = e.target.value;

                if (textValue && isNaN(+e.target.value)) {
                  return;
                }

                setAmountToRedelegate(textValue);
              }}
            />
            {targetGateway &&
              (amountToRedelegate?.length > 0 ||
                maxRedelegationStake.valueOf() < minRequiredStakeToAdd) &&
              errorMessage && (
                <ErrorMessageIcon
                  errorMessage={errorMessage}
                  tooltipPadding={'3'}
                />
              )}
            <Button
              className="mr-3 max-h-7"
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
            {fee > 0 && (
              <LabelValueRow
                label="Fee:"
                value={`${fee} ${ticker}`}
                rightIcon={
                  <Tooltip
                    message={
                      <div>
                        <p>{REDELEGATION_FEE_TOOLTIP_TEXT}</p>
                      </div>
                    }
                  >
                    <InfoIcon className="size-4 text-text-red" />
                  </Tooltip>
                }
              />
            )}

            <LabelValueRow
              label="Total Redelegated Stake:"
              value={`${isFormValid ? formatWithCommas(totalRedelegatedStake) : '-'} ${ticker}`}
            />

            <LabelValueRow
              label="New Total Stake:"
              value={`${
                isFormValid ? formatWithCommas(newTotalStake) : '-'
              } ${ticker}`}
            />
          </div>
          <div
            className={
              isFormValid ? undefined : 'pointer-events-none opacity-30'
            }
          >
            <Button
              className="mt-4 h-[3.25rem] w-full"
              onClick={() => {
                setShowReviewRedelegateModal(true);
              }}
              buttonType={ButtonType.PRIMARY}
              title="Review"
              text="Review"
            />
          </div>
        </div>
        {showReviewRedelegateModal && targetGateway && walletAddress && (
          <ReviewRedelegateModal
            amountToRedelegate={new ARIOToken(parseFloat(amountToRedelegate))}
            fee={fee}
            newTotalStake={newTotalStake}
            sourceGateway={sourceGateway}
            targetGateway={targetGateway}
            onClose={() => setShowReviewRedelegateModal(false)}
            onSuccess={() => onClose()}
            ticker={ticker}
            walletAddress={walletAddress}
            vaultId={vaultId}
          />
        )}
      </div>
    </BaseModal>
  );
};

export default RedelegateModal;
