import { UpdateGatewaySettingsParams } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import FormRow, { RowType } from '@src/components/forms/FormRow';
import {
  FormRowDef,
  calculateNumFormChanges,
  isFormValid,
} from '@src/components/forms/formData';
import {
  validateDomainName,
  validateIOAmount,
  validateNumberRange,
  validateString,
  validateTransactionId,
  validateWalletAddress,
} from '@src/components/forms/validation';
import { EditIcon, StatsArrowIcon } from '@src/components/icons';
import BlockingMessageModal from '@src/components/modals/BlockingMessageModal';
import SuccessModal from '@src/components/modals/SuccessModal';
import useGateway from '@src/hooks/useGateway';
import useHealthcheck from '@src/hooks/useHealthCheck';
import usePendingGatewayUpdates from '@src/hooks/usePendingGatewayUpdates';
import { PendingGatewayUpdates, useGlobalState } from '@src/store';
import {
  GatewaySettingsUpdate,
  OperatorStakeUpdate,
} from '@src/store/persistent';
import { mioToIo } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GatewayHeader from './GatewayHeader';
import PropertyDisplayPanel from './PropertyDisplayPanel';

const StatsBox = ({
  title,
  value,
}: {
  title: string;
  value: string | number | undefined;
}) => {
  return (
    <div className="flex flex-col gap-[4px] border-t border-transparent-100-16 px-[24px] py-[16px]">
      <div className="text-xs text-low">{title}</div>
      <div className="flex gap-[4px]">
        <StatsArrowIcon />
        {value !== undefined ? (
          <div className="text-sm text-mid">{value}</div>
        ) : (
          <Placeholder />
        )}
      </div>
    </div>
  );
};

const formatUptime = (uptime: number) => {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
};

const Gateway = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const balances = useGlobalState((state) => state.balances);

  const { addPendingGatewayUpdates } = usePendingGatewayUpdates();

  const params = useParams();

  const ownerId = params?.ownerId;

  const { data: gateway } = useGateway({
    ownerWalletAddress: ownerId || undefined,
  });

  const gatewayAddress = gateway
    ? `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`
    : undefined;

  const healthCheckRes = useHealthcheck({
    url: gatewayAddress,
  });

  const [editing, setEditing] = useState(false);

  const [initialState, setInitialState] = useState<
    Record<string, string | boolean>
  >({});
  const [formState, setFormState] = useState<Record<string, string | boolean>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const delegatedStakingEnabled = formState.allowDelegatedStaking == true;
  const maxStake = gateway?.operatorStake
    ? mioToIo(gateway.operatorStake) + (balances?.io || 0)
    : undefined;

  useEffect(() => {
    setInitialState((currentState) => {
      return {
        ...currentState,
        observerWallet: walletAddress?.toString() ?? '',
      };
    });
    setFormState((currentState) => {
      return {
        ...currentState,
        observerWallet: walletAddress?.toString() ?? '',
      };
    });
  }, [walletAddress]);

  // This updates the form when the user toggles the delegated staking switch to false to reset the
  // form values and error messages back to the initial state.
  useEffect(() => {
    if (formState.allowDelegatedStaking == false) {
      const updatedState: Record<string, string | boolean> = {};

      if (
        formState.delegateRewardShareRatio !==
        initialState.delegateRewardShareRatio
      ) {
        updatedState.delegateRewardShareRatio =
          initialState.delegateRewardShareRatio;
      }
      if (formState.minDelegatedStake !== initialState.minDelegatedStake) {
        updatedState.minDelegatedStake = initialState.minDelegatedStake;
      }

      if (Object.keys(updatedState).length > 0) {
        const updatedErrors = { ...formErrors };
        Object.keys(updatedState).forEach((key) => {
          delete updatedErrors[key];
        });
        setFormErrors(updatedErrors);

        setFormState((currentState) => {
          return {
            ...currentState,
            ...updatedState,
          };
        });
      }
    }
  }, [initialState, formState, formErrors]);

  const formRowDefs: FormRowDef[] = [
    {
      formPropertyName: 'label',
      label: 'Label:',
      rowType: RowType.TOP,
      validateProperty: validateString('Label', 1, 64),
    },
    {
      formPropertyName: 'fqdn',
      label: 'Address:',
      rowType: RowType.BOTTOM,
      leftComponent: <div className="pl-[24px] text-xs text-low">https://</div>,
      rightComponent: <div className="pr-[24px] text-xs text-low">:443</div>,
      validateProperty: validateDomainName('Address'),
    },
    {
      formPropertyName: 'ownerId',
      label: 'Owner Wallet:',
      rowType: RowType.SINGLE,
      readOnly: true,
    },
    {
      formPropertyName: 'observerWallet',
      label: 'Observer Wallet:',
      rowType: RowType.TOP,
      validateProperty: validateWalletAddress('Observer Wallet'),
    },
    {
      formPropertyName: 'properties',
      label: 'Properties ID:',
      rowType: RowType.MIDDLE,
      validateProperty: validateTransactionId('Properties ID'),
    },
    {
      formPropertyName: 'stake',
      label: 'Gateway Stake (IO):',
      rowType: RowType.BOTTOM,
      placeholder: 'Minimum 10000 IO',
      validateProperty: validateIOAmount('Stake', 10000, maxStake),
    },
    {
      formPropertyName: 'status',
      label: 'Status:',
      rowType: RowType.SINGLE,
      readOnly: true,
    },
    {
      formPropertyName: 'note',
      label: 'Note:',
      rowType: RowType.SINGLE,
      validateProperty: validateString('Note', 1, 256),
    },
    {
      formPropertyName: 'delegatedStake',
      label: 'Total Delegated Stake (IO):',
      rowType: RowType.SINGLE,
      readOnly: true,
    },
    {
      formPropertyName: 'autoStake',
      label: 'Reward Auto Stake:',
      rowType: RowType.SINGLE,
    },
    {
      formPropertyName: 'allowDelegatedStaking',
      label: 'Delegated Staking:',
      rowType: RowType.SINGLE,
    },
    {
      formPropertyName: 'delegateRewardShareRatio',
      label: 'Reward Share Ratio:',
      rowType: RowType.TOP,
      enabled: delegatedStakingEnabled,
      placeholder: delegatedStakingEnabled
        ? 'Enter value 0-100'
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateNumberRange('Reward Share Ratio', 0, 100),
    },
    {
      formPropertyName: 'minDelegatedStake',
      label: 'Minimum Delegated Stake (IO):',
      rowType: RowType.LAST,
      enabled: delegatedStakingEnabled,
      placeholder: delegatedStakingEnabled
        ? 'Minimum 100 IO'
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateIOAmount('Minumum Delegated Stake ', 100),
    },
  ];

  const startEditing = () => {
    if (!gateway) return;

    const initialState = {
      label: gateway.settings.label || '',
      fqdn: gateway.settings.fqdn || '',
      ownerId: ownerId || '',
      observerWallet: gateway.observerWallet || '',
      properties: gateway.settings.properties || '',
      stake: mioToIo(gateway.operatorStake || 0) + '',
      status: gateway.status || '',
      note: gateway.settings.note || '',
      delegatedStake: mioToIo(gateway.totalDelegatedStake || 0) + '',
      autoStake: gateway.settings.autoStake || false,
      allowDelegatedStaking: gateway?.settings.allowDelegatedStaking || false,
      delegateRewardShareRatio:
        (gateway.settings.delegateRewardShareRatio || 0) + '',
      minDelegatedStake: mioToIo(gateway.settings.minDelegatedStake || 0) + '',
    };
    setInitialState(initialState);
    setFormState(initialState);
    setEditing(true);
  };

  const numFormChanges = calculateNumFormChanges({ initialState, formState });

  const submitForm = async () => {
    if (
      walletAddress &&
      arIOWriteableSDK &&
      isFormValid({ formRowDefs, formValues: formState })
    ) {
      // saveGatewayChanges();

      const changed = Object.keys(formState).reduce(
        (acc, key) => {
          return formState[key] !== initialState[key]
            ? { ...acc, [key]: formState[key] }
            : acc;
        },
        {} as Record<string, string | number | boolean>,
      );

      // split possible args for transactions
      const operatorStake = changed.stake
        ? parseFloat(changed.stake as string)
        : undefined;

      const updateGatewaySettingsParams: UpdateGatewaySettingsParams = {
        allowDelegatedStaking: changed.allowDelegatedStaking as boolean,
        delegateRewardShareRatio:
          formState.allowDelegatedStaking && changed.delegateRewardShareRatio
            ? parseFloat(changed.delegateRewardShareRatio as string)
            : undefined,
        fqdn: changed.fqdn as string,
        label: changed.label as string,
        minDelegatedStake:
          formState.allowDelegatedStaking && changed.minDelegatedStake
            ? parseFloat(changed.minDelegatedStake as string)
            : undefined,
        note: changed.note as string,
        properties: changed.properties as string,
        autoStake: changed.autoStake as boolean,
        observerWallet: changed.observerWallet as string,
      };

      console.log(operatorStake, updateGatewaySettingsParams);

      setShowBlockingMessageModal(true);

      const updates: PendingGatewayUpdates = {
        operatorStakeUpdates: [],
        gatewaySettingsUpdates: [],
      };

      try {
        if (
          Object.values(updateGatewaySettingsParams).some(
            (v) => v !== undefined,
          )
        ) {
          const { id: txID } = await arIOWriteableSDK.updateGatewaySettings(
            updateGatewaySettingsParams,
          );
          // TODO: replace with logger call at INFO level when logger reinstated
          console.log(`Update Gateway Settings txID: ${txID}`);

          const pendingGatewaySettingsUpdate: GatewaySettingsUpdate = {
            txid: await txID,
            params: updateGatewaySettingsParams,
          };

          updates.gatewaySettingsUpdates.push(pendingGatewaySettingsUpdate);
        }

        if (operatorStake !== undefined && gateway) {
          const stakeDiff = operatorStake - mioToIo(gateway.operatorStake || 0);

          if (stakeDiff > 0) {
            const { id: txID } = await arIOWriteableSDK.increaseOperatorStake({
              qty: stakeDiff,
            });

            // TODO: replace with logger call at INFO level when logger reinstated
            console.log(`Increase Operator Stake txID: ${txID}`);

            const pendingOperatorStakeUpdate: OperatorStakeUpdate = {
              txid: await txID,
              type: 'increase',
              qty: stakeDiff,
            };

            updates.operatorStakeUpdates.push(pendingOperatorStakeUpdate);
          } else if (stakeDiff < 0) {
            const { id: txID } = await arIOWriteableSDK.decreaseOperatorStake({
              qty: Math.abs(stakeDiff),
            });

            // TODO: replace with logger call at INFO level when logger reinstated
            console.log(`Decrease Operator Stake txID: ${txID}`);

            const pendingOperatorStakeUpdate: OperatorStakeUpdate = {
              txid: await txID,
              type: 'decrease',
              qty: Math.abs(stakeDiff),
            };

            updates.operatorStakeUpdates.push(pendingOperatorStakeUpdate);
          }
        }

        addPendingGatewayUpdates(updates);
        setShowSuccessModal(true);
      } catch (e: any) {
        showErrorToast(`${e}`);
      } finally {
        setShowBlockingMessageModal(false);
      }
    }
  };

  return (
    <div>
      <GatewayHeader gatewayName={gateway?.settings.label} />
      <div className="my-[24px] flex gap-[24px]">
        <div className="h-fit w-[270px] rounded-xl border border-transparent-100-16 text-sm">
          <div className="px-[24px] py-[16px]">
            <div className="text-high">Stats</div>
          </div>
          <StatsBox title="Start Block" value={gateway?.start} />
          <StatsBox
            title="Uptime"
            value={
              healthCheckRes.isError
                ? 'N/A'
                : healthCheckRes.isLoading
                  ? undefined
                  : formatUptime(healthCheckRes.data?.uptime)
            }
          />
          <StatsBox
            title="Delegates"
            value={Object.keys(gateway?.delegates || {}).length}
          />
          {/* <StatsBox title="Rewards Distributed" value={gateway?} /> */}
        </div>
        <div className="size-full grow overflow-y-auto text-clip rounded-xl border border-transparent-100-16">
          <div className="flex items-center py-[16px] pl-[24px] pr-[12px]">
            <div className="text-sm text-high">General Information</div>
            <div className="flex grow gap-[24px]" />
            {ownerId === walletAddress?.toString() &&
              (editing ? (
                <>
                  <div className="flex">
                    <Button
                      className="h-[30px]"
                      title="Cancel"
                      text="Cancel"
                      buttonType={ButtonType.SECONDARY}
                      onClick={() => setEditing(false)}
                    />
                  </div>
                  {!isFormValid({ formRowDefs, formValues: formState }) ? (
                    <div className="pl-[24px] text-sm text-red-600">
                      Invalid Entry
                    </div>
                  ) : numFormChanges > 0 ? (
                    <Button
                      className="h-[30px]"
                      title={`Save ${numFormChanges} changes`}
                      text={`Save ${numFormChanges} changes`}
                      buttonType={ButtonType.SECONDARY}
                      secondaryGradient={true}
                      onClick={submitForm}
                    />
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <Button
                  className="h-[30px]"
                  title="Edit"
                  text="Edit"
                  icon={<EditIcon />}
                  active={true}
                  onClick={startEditing}
                />
              ))}
          </div>
          {editing ? (
            <div className=" grid grid-cols-[221px_auto] overflow-hidden border-t border-grey-500">
              {formRowDefs.map((rowDef, index) => {
                return (
                  <FormRow
                    key={index}
                    initialState={initialState}
                    formState={formState}
                    setFormState={setFormState}
                    errorMessages={formErrors}
                    setErrorMessages={setFormErrors}
                    {...rowDef}
                  />
                );
              })}
            </div>
          ) : (
            <PropertyDisplayPanel ownerId={ownerId} gateway={gateway} />
          )}
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
            setEditing(false);
          }}
          title="Congratulations"
          bodyText="You have successfully updated your gateway."
        />
      )}
    </div>
  );
};

export default Gateway;
