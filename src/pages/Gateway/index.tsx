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
  validateIOMinimum,
  validateNumberRange,
  validateString,
  validateTransactionId,
  validateWalletAddress,
} from '@src/components/forms/validation';
import { EditIcon, StatsArrowIcon } from '@src/components/icons';
import useGateway from '@src/hooks/useGateway';
import useHealthcheck from '@src/hooks/useHealthCheck';
import { useGlobalState } from '@src/store';
import { mioToIo } from '@src/utils';
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

  // const [showBlockingMessageModal, setShowBlockingMessageModal] =
  //   useState(false);
  // const [showSuccessModal, setShowSuccessModal] = useState(false);

  const delegatedStakingEnabled = formState.allowDelegatedStaking == true;

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
    if(formState.allowDelegatedStaking == false) {
      const updatedState:Record<string, string | boolean> = {};

      if(formState.delegatedStakingShareRatio !== initialState.delegatedStakingShareRatio) {
        updatedState.delegatedStakingShareRatio = initialState.delegatedStakingShareRatio;
      }
      if(formState.minDelegatedStake !== initialState.minDelegatedStake) {
        updatedState.minDelegatedStake = initialState.minDelegatedStake;
      }

      if(Object.keys(updatedState).length > 0) {
        const updatedErrors = {...formErrors};
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
  }, [initialState, formState, formErrors])

  const formRowDefs: FormRowDef[] = [
    {
      formPropertyName: 'label',
      label: 'Label:',
      rowType: RowType.TOP,
      validateProperty: validateString('Label', 1, 64),
    },
    {
      formPropertyName: 'address',
      label: 'Address:',
      rowType: RowType.BOTTOM,
      leftComponent: <div className="pl-[24px] text-xs text-low">https://</div>,
      rightComponent: <div className="pr-[24px] text-xs text-low">:443</div>,
      validateProperty: validateDomainName('Address'),
    },
    {
      formPropertyName: 'ownerId',
      label: 'Owner ID:',
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
      formPropertyName: 'propertiesId',
      label: 'Properties ID:',
      rowType: RowType.MIDDLE,
      validateProperty: validateTransactionId('Properties ID'),
    },
    {
      formPropertyName: 'stake',
      label: 'Stake (IO):',
      rowType: RowType.BOTTOM,
      placeholder: 'Minimum 10000 IO',
      validateProperty: validateIOMinimum('Stake', 10000),
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
      label: 'Delegated Stake (IO):',
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
      formPropertyName: 'delegatedStakingShareRatio',
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
      validateProperty: validateIOMinimum('Minumum Delegated Stake ', 100),
    },
  ];

  const startEditing = () => {
    const initialState = {
      label: gateway?.settings.label || '',
      address: gateway?.settings.fqdn || '',
      ownerId: ownerId || '',
      observerWallet: gateway?.observerWallet || '',
      propertiesId: gateway?.settings.properties || '',
      stake: mioToIo(gateway?.operatorStake || 0) + '',
      status: gateway?.status || '',
      note: gateway?.settings.note || '',
      delegatedStake: (gateway?.totalDelegatedStake || 0) + '',
      autoStake: gateway?.settings.autoStake || false,
      allowDelegatedStaking: gateway?.settings.allowDelegatedStaking || false,
      delegatedStakingShareRatio:
        (gateway?.settings.delegateRewardShareRatio || 0) + '',
      minDelegatedStake: (gateway?.settings.minDelegatedStake || 0) + '',
    };
    setInitialState(initialState);
    setFormState(initialState);
    setEditing(true);
  };

  const numFormChanges = calculateNumFormChanges({ initialState, formState });

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
                      onClick={() => {
                        // saveGatewayChanges();
                        setEditing(false);
                      }}
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
    </div>
  );
};

export default Gateway;
