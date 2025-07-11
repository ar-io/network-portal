/* eslint-disable tailwindcss/classnames-order */
import {
  ARIOToken,
  AoUpdateGatewaySettingsParams,
  mARIOToken,
} from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import FormRow, { RowType } from '@src/components/forms/FormRow';
import {
  FormRowDef,
  calculateNumFormChanges,
  isFormValid,
} from '@src/components/forms/formData';
import {
  validateARIOAmount,
  validateDomainName,
  validateNumberRange,
  validateString,
  validateTransactionId,
  validateWalletAddress,
} from '@src/components/forms/validation';
import { EditIcon } from '@src/components/icons';
import BlockingMessageModal from '@src/components/modals/BlockingMessageModal';
import SuccessModal from '@src/components/modals/SuccessModal';
import { WRITE_OPTIONS, log } from '@src/constants';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useGateway from '@src/hooks/useGateway';
import useObserverBalances from '@src/hooks/useObserverBalances';
import { useGlobalState } from '@src/store';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { TriangleAlertIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ActiveDelegates from './ActiveDelegates';
import GatewayHeader from './GatewayHeader';
import OperatorStake from './OperatorStake';
import PendingWithdrawals from './PendingWIthdrawals';
import PropertyDisplayPanel from './PropertyDisplayPanel';
import SnitchRow from './SnitchRow';
import SoftwareDetails from './SoftwareDetails';
import StatsPanel from './StatsPanel';

const Gateway = () => {
  const queryClient = useQueryClient();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const ticker = useGlobalState((state) => state.ticker);

  const params = useParams();

  const ownerId = params?.ownerId;
  const isOwnGateway = ownerId === walletAddress?.toString();

  const { data: gateway } = useGateway({
    ownerWalletAddress: ownerId || undefined,
  });

  const { data: epochSettings } = useEpochSettings();

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

  // Check observer balances for low balance warnings
  const { data: observerBalances } = useObserverBalances(
    gateway?.observerAddress,
  );

  const hasLowBalance =
    observerBalances &&
    observerBalances.ar < 0.01 &&
    observerBalances.turboCredits < 0.01;

  const delegatedStakingEnabled = formState.allowDelegatedStaking == true;

  const weightFields: Array<[string, number | undefined]> = [
    ['Stake', gateway?.weights?.stakeWeight],
    ['Tenure', gateway?.weights?.tenureWeight],
    // there will be a period where old epoch notices have the old field, and new epoch notices have the new field, so check both
    [
      'Gateway Performance Ratio',
      gateway?.weights?.gatewayPerformanceRatio ??
        gateway?.weights?.gatewayRewardRatioWeight,
    ],
    [
      'Observer Performance Ratio',
      gateway?.weights?.observerPerformanceRatio ??
        gateway?.weights?.observerRewardRatioWeight,
    ],
    ['Composite', gateway?.weights?.compositeWeight],
    ['Normalized', gateway?.weights?.normalizedCompositeWeight],
  ];

  useEffect(() => {
    setInitialState((currentState) => {
      return {
        ...currentState,
        observerAddress: walletAddress?.toString() ?? '',
      };
    });
    setFormState((currentState) => {
      return {
        ...currentState,
        observerAddress: walletAddress?.toString() ?? '',
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
      leftComponent: <div className="pl-6 text-xs text-low">https://</div>,
      rightComponent: <div className="pr-6 text-xs text-low">:443</div>,
      validateProperty: validateDomainName('Address'),
    },
    {
      formPropertyName: 'ownerId',
      label: 'Owner Wallet:',
      rowType: RowType.SINGLE,
      readOnly: true,
    },
    {
      formPropertyName: 'observerAddress',
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
        ? 'Enter value 0-95'
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateNumberRange('Reward Share Ratio', 0, 95),
    },
    {
      formPropertyName: 'minDelegatedStake',
      label: `Minimum Delegated Stake (${ticker}):`,
      rowType: RowType.LAST,
      enabled: delegatedStakingEnabled,
      placeholder: delegatedStakingEnabled
        ? `Minimum 10 ${ticker}`
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateARIOAmount(
        'Minumum Delegated Stake',
        ticker,
        10,
      ),
    },
  ];

  const startEditing = () => {
    if (!gateway) return;

    const initialState = {
      label: gateway.settings.label || '',
      fqdn: gateway.settings.fqdn || '',
      ownerId: ownerId || '',
      observerAddress: gateway.observerAddress || '',
      properties: gateway.settings.properties || '',
      status: gateway.status || '',
      note: gateway.settings.note || '',
      autoStake: gateway.settings.autoStake || false,
      allowDelegatedStaking: gateway?.settings.allowDelegatedStaking || false,
      delegateRewardShareRatio:
        (gateway.settings.delegateRewardShareRatio || 0) + '',
      minDelegatedStake:
        new mARIOToken(gateway.settings.minDelegatedStake || 0)
          .toARIO()
          .valueOf() + '',
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

      const updateGatewaySettingsParams: AoUpdateGatewaySettingsParams = {
        allowDelegatedStaking: changed.allowDelegatedStaking as boolean,
        delegateRewardShareRatio:
          formState.allowDelegatedStaking && changed.delegateRewardShareRatio
            ? parseFloat(changed.delegateRewardShareRatio as string)
            : undefined,
        fqdn: changed.fqdn as string,
        label: changed.label as string,
        minDelegatedStake:
          formState.allowDelegatedStaking && changed.minDelegatedStake
            ? new ARIOToken(parseFloat(changed.minDelegatedStake as string))
                .toMARIO()
                .valueOf()
            : undefined,
        note: changed.note as string,
        properties: changed.properties as string,
        autoStake: changed.autoStake as boolean,
        observerAddress: changed.observerAddress as string,
      };

      setShowBlockingMessageModal(true);

      try {
        if (
          Object.values(updateGatewaySettingsParams).some(
            (v) => v !== undefined,
          )
        ) {
          const { id: txID } = await arIOWriteableSDK.updateGatewaySettings(
            updateGatewaySettingsParams,
            WRITE_OPTIONS,
          );
          log.info(`Update Gateway Settings txID: ${txID}`);
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

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="min-w-[68rem]">
        <GatewayHeader gateway={gateway} />

        {/* Low Balance Warning Banner */}
        {isOwnGateway && hasLowBalance && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
            <div className="flex items-center gap-2 font-medium">
              <TriangleAlertIcon className="size-5" />
              Low Balance Warning
            </div>
            <div className="mt-1 text-sm">
              <ul>
                <li>
                  Observer AR and Turbo Credit balance is low. Please add more
                  AR or Turbo Credits to the observer wallet.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <OperatorStake
        gateway={gateway}
        walletAddress={walletAddress?.toString()}
      />
      <PendingWithdrawals
        gateway={gateway}
        walletAddress={walletAddress?.toString()}
      />
      <ActiveDelegates gateway={gateway} />

      <div className="flex gap-6">
        <div className="flex min-w-72 flex-col gap-6">
          <StatsPanel gateway={gateway} />
          {gateway?.weights && gateway?.status === 'joined' && (
            <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
              <div className="bg-containerL3 px-6 py-4">
                <div className="text-high">Weights</div>
              </div>

              {weightFields.map(([title, value], index) => (
                <div
                  key={`weights${index}`}
                  className="flex items-center gap-4 border-t border-transparent-100-16 px-6 py-4"
                >
                  <div className="grow text-nowrap text-xs text-low">
                    {title}:
                  </div>
                  <div className="text-right text-sm">
                    {value !== undefined ? (
                      value.toFixed(3)
                    ) : (
                      <Placeholder className="w-10" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {gateway?.status === 'joined' && (
            <SoftwareDetails gateway={gateway} />
          )}
        </div>
        <div className="flex w-full grow flex-col gap-6">
          <div className="h-fit w-full overflow-hidden rounded-xl border border-transparent-100-16">
            <div className="flex items-center bg-containerL3 py-4 pl-6 pr-3">
              <div className="text-sm text-high">General Information</div>
              <div className="flex grow gap-6" />
              {isOwnGateway &&
                (editing ? (
                  <>
                    <div className="flex">
                      <Button
                        className="h-[1.875rem]"
                        title="Cancel"
                        text="Cancel"
                        buttonType={ButtonType.SECONDARY}
                        onClick={() => setEditing(false)}
                      />
                    </div>
                    {!isFormValid({ formRowDefs, formValues: formState }) ? (
                      <div className="pl-6 text-sm text-red-600">
                        Invalid Entry
                      </div>
                    ) : numFormChanges > 0 ? (
                      <Button
                        className="last:text-gradient h-[1.875rem]"
                        title={`Save ${numFormChanges} changes`}
                        text={`Save ${numFormChanges} changes`}
                        buttonType={ButtonType.SECONDARY}
                        onClick={submitForm}
                      />
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  gateway?.status == 'joined' && (
                    <Button
                      className="h-[1.875rem]"
                      title="Edit"
                      text="Edit"
                      icon={<EditIcon className="size-3" />}
                      active={true}
                      onClick={startEditing}
                    />
                  )
                ))}
            </div>
            {editing ? (
              <div className=" grid grid-cols-[14.375rem_auto] overflow-hidden border-t border-grey-500">
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

          {epochSettings?.hasEpochZeroStarted && (
            <SnitchRow gateway={gateway} />
          )}
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
