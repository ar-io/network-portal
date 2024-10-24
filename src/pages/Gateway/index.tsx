import {
  AoUpdateGatewaySettingsParams,
  IOToken,
  mIOToken,
} from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
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
import { EditIcon, InfoIcon } from '@src/components/icons';
import BlockingMessageModal from '@src/components/modals/BlockingMessageModal';
import SuccessModal from '@src/components/modals/SuccessModal';
import {
  EAY_TOOLTIP_TEXT,
  OPERATOR_EAY_TOOLTIP_FORMULA,
  WRITE_OPTIONS,
  log,
} from '@src/constants';
import useGateway from '@src/hooks/useGateway';
import useGateways from '@src/hooks/useGateways';
import useHealthcheck from '@src/hooks/useHealthCheck';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatDateTime } from '@src/utils';
import { calculateOperatorRewards } from '@src/utils/rewards';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { MathJax } from 'better-react-mathjax';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GatewayHeader from './GatewayHeader';
import PropertyDisplayPanel from './PropertyDisplayPanel';
import SnitchRow from './SnitchRow';
import SoftwareDetails from './SoftwareDetails';
import StatsBox from './StatsBox';

const formatUptime = (uptime: number) => {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
};

const Gateway = () => {
  const queryClient = useQueryClient();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const balances = useGlobalState((state) => state.balances);
  const ticker = useGlobalState((state) => state.ticker);
  const { data: protocolBalance } = useProtocolBalance();
  const { data: gateways } = useGateways();

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
    ? new mIOToken(gateway.operatorStake).toIO().valueOf() + (balances?.io || 0)
    : undefined;

  const operatorRewards =
    gateway?.operatorStake != undefined && protocolBalance && gateways
      ? calculateOperatorRewards(
          new mIOToken(protocolBalance).toIO(),
          Object.values(gateways).filter((g) => g.status == 'joined').length,
          gateway,
        )
      : undefined;

  const weightFields: Array<[string, number | undefined]> = [
    ['Stake', gateway?.weights?.stakeWeight],
    ['Tenure', gateway?.weights?.tenureWeight],
    ['Gateway Performance Ratio', gateway?.weights?.gatewayRewardRatioWeight],
    ['Observer Performance Ratio', gateway?.weights?.observerRewardRatioWeight],
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
      formPropertyName: 'stake',
      label: `Gateway Stake (${ticker}):`,
      rowType: RowType.BOTTOM,
      placeholder: `Minimum 50000 ${ticker}`,
      validateProperty: validateIOAmount('Stake', ticker, 50000, maxStake),
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
      label: `Total Delegated Stake (${ticker}):`,
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
      label: `Minimum Delegated Stake (${ticker}):`,
      rowType: RowType.LAST,
      enabled: delegatedStakingEnabled,
      placeholder: delegatedStakingEnabled
        ? `Minimum 500 ${ticker}`
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateIOAmount(
        'Minumum Delegated Stake',
        ticker,
        500,
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
      stake: new mIOToken(gateway.operatorStake || 0).toIO().valueOf() + '',
      status: gateway.status || '',
      note: gateway.settings.note || '',
      delegatedStake:
        new mIOToken(gateway.totalDelegatedStake || 0).toIO().valueOf() + '',
      autoStake: gateway.settings.autoStake || false,
      allowDelegatedStaking: gateway?.settings.allowDelegatedStaking || false,
      delegateRewardShareRatio:
        (gateway.settings.delegateRewardShareRatio || 0) + '',
      minDelegatedStake:
        new mIOToken(gateway.settings.minDelegatedStake || 0).toIO().valueOf() +
        '',
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
            ? new IOToken(parseFloat(changed.minDelegatedStake as string))
                .toMIO()
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

        if (operatorStake !== undefined && gateway) {
          const stakeDiff =
            operatorStake -
            new mIOToken(gateway.operatorStake || 0).toIO().valueOf();

          if (stakeDiff > 0) {
            const { id: txID } = await arIOWriteableSDK.increaseOperatorStake(
              {
                increaseQty: new IOToken(stakeDiff).toMIO(),
              },
              WRITE_OPTIONS,
            );

            log.info(`Increase Operator Stake txID: ${txID}`);
          } else if (stakeDiff < 0) {
            const { id: txID } = await arIOWriteableSDK.decreaseOperatorStake(
              {
                decreaseQty: new IOToken(Math.abs(stakeDiff)).toMIO(),
              },
              WRITE_OPTIONS,
            );

            log.info(`Decrease Operator Stake txID: ${txID}`);
          }
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
    <div className="flex h-screen flex-col overflow-y-auto pr-6 scrollbar">
      <div className="min-w-[68rem]">
        <GatewayHeader gateway={gateway} />
      </div>
      <div className="my-6 flex gap-6">
        <div className="flex min-w-72 flex-col gap-6">
          <div className="size-fit w-full rounded-xl border border-transparent-100-16 text-sm">
            <div className="bg-containerL3 px-6 py-4">
              <div className="text-high">Stats</div>
            </div>
            <StatsBox
              title="Join Date"
              value={
                gateway?.startTimestamp
                  ? formatDateTime(new Date(gateway?.startTimestamp))
                  : undefined
              }
            />

            {gateway?.status === 'joined' ? (
              <>
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
                  value={
                    gateway?.delegates
                      ? Object.keys(gateway.delegates).length
                      : undefined
                  }
                />

                <StatsBox
                  title={
                    <div className="flex gap-2">
                      Operator EAY{' '}
                      <Tooltip
                        message={
                          <div>
                            <p>{EAY_TOOLTIP_TEXT}</p>
                            <MathJax className="mt-4">
                              {OPERATOR_EAY_TOOLTIP_FORMULA}
                            </MathJax>
                          </div>
                        }
                      >
                        <InfoIcon className="size-4" />
                      </Tooltip>
                    </div>
                  }
                  value={
                    operatorRewards != undefined
                      ? `${(operatorRewards.EAY * 100).toFixed(2)}%`
                      : undefined
                  }
                />
              </>
            ) : (
              gateway && (
                <StatsBox
                  title="Leave Date"
                  value={
                    gateway?.endTimestamp
                      ? formatDateTime(new Date(gateway?.endTimestamp))
                      : undefined
                  }
                />
              )
            )}
            {/* <StatsBox title="Rewards Distributed" value={gateway?} /> */}
          </div>

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
                    {value !== undefined ? value.toFixed(3) : <Placeholder />}
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
              {ownerId === walletAddress?.toString() &&
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

          <SnitchRow gateway={gateway} />
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
