import { ARWEAVE_TX_REGEX } from '@ar.io/sdk/web';
import { FQDN_REGEX } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import FormRow, { RowType } from '../forms/FormRow';
import FormSwitch from '../forms/FormSwitch';
import BaseModal from './BaseModal';
import toast from 'react-hot-toast';

const DEFAULT_FORM_STATE = {
  label: '',
  address: '',
  observerWallet: '',
  propertiesId: 'FH1aVetOoulPGqgYukj0VE0wIhDy90WiQoV3U2PeY44',
  stake: '',
  delegatedStaking: '',
  delegatedStakingShareRatio: '',
  note: '',
};

interface FormRowDef {
  formPropertyName: string;
  label: string;
  rowType?: RowType;
  leftComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  enabled?: boolean;
  placeholder?: string;
  validateProperty: (value: string) => string | undefined;
}

const StartGatewayModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arioWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const [formState, setFormState] =
    useState<Record<string, string>>(DEFAULT_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [delegatedStakingEnabled, setDelegatedStakingEnabled] =
    useState<boolean>(false);
  const [propertiesIdEnabled, setPropertiesIdEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    setFormState((currentState) => {
      return {
        ...currentState,
        observerWallet: walletAddress?.toString() ?? '',
      };
    });
  }, [walletAddress]);

  const formRowDefs: FormRowDef[] = [
    {
      formPropertyName: 'label',
      label: '*Label:',
      rowType: RowType.TOP,
      validateProperty: (v: string) => {
        return v.trim() === '' ? 'Label is required' : undefined;
      },
    },
    {
      formPropertyName: 'address',
      label: '*Address:',
      leftComponent: <div className="pl-[24px] text-xs text-low">https://</div>,
      rightComponent: <div className="pr-[24px] text-xs text-low">:443</div>,

      validateProperty: (v: string) => {
        return v.trim() === '' || !FQDN_REGEX.test(v)
          ? 'Address is required and must be a valid domain name.'
          : undefined;
      },
    },
    {
      formPropertyName: 'observerWallet',
      label: '*Observer Wallet:',
      validateProperty: (v: string) => {
        return v.trim() === '' || !ARWEAVE_TX_REGEX.test(v)
          ? 'Observer Wallet is required and must be a valid domain name.'
          : undefined;
      },
    },
    {
      formPropertyName: 'propertiesId',
      label: '*Properties ID:',
      enabled: propertiesIdEnabled,
      placeholder: DEFAULT_FORM_STATE.propertiesId,
      validateProperty: (v: string) => {
        return v.trim() === '' || !ARWEAVE_TX_REGEX.test(v)
          ? 'Preoperties ID is required and must be a valid domain name.'
          : undefined;
      },
      rightComponent: (
        <div className="pr-[12px]">
          <FormSwitch
            checked={propertiesIdEnabled}
            onChange={(v) => {
              if (!v) {
                const cleared = { ...formErrors };
                delete cleared['propertiesId'];
                setFormErrors(cleared);
                setFormState({
                  ...formState,
                  propertiesId: DEFAULT_FORM_STATE.propertiesId,
                });
              }
              setPropertiesIdEnabled(v);
            }}
            title={`${propertiesIdEnabled ? 'Disable' : 'Enable'} Custom Properties ID`}
          />
        </div>
      ),
    },
    {
      formPropertyName: 'stake',
      label: '*Stake (IO):',
      placeholder: 'Minimum 10000 IO',
      validateProperty: (v: string) => {
        const value = parseFloat(v);
        return value < 10000 || isNaN(value)
          ? 'Stake must be a number > 10000 IO.'
          : undefined;
      },
    },

    {
      formPropertyName: 'delegatedStaking',
      label: 'Delegated Staking (IO):',
      enabled: delegatedStakingEnabled,
      placeholder: 'Minimum 0.1 IO',
      validateProperty: (v: string) => {
        if (!delegatedStakingEnabled) {
          return undefined;
        }
        const value = parseFloat(v);
        return value < 0.1 || isNaN(value)
          ? 'Delegated Staking must be a number > 0.1 IO.'
          : undefined;
      },
      rightComponent: (
        <div className="pr-[12px]">
          <FormSwitch
            checked={delegatedStakingEnabled}
            onChange={setDelegatedStakingEnabled}
            title={`${delegatedStakingEnabled ? 'Disable' : 'Enable'} Delegated Staking`}
          />
        </div>
      ),
    },
    {
      formPropertyName: 'delegatedStakingShareRatio',
      label: 'Delegated Staking Share Ratio:',
      enabled: delegatedStakingEnabled,
      placeholder: delegatedStakingEnabled
        ? 'Enter value 0-100'
        : 'Enable Delegated Staking to set this value.',
      validateProperty: (v: string) => {
        const value = parseFloat(v);
        return value < 0 || value > 100 || isNaN(value)
          ? 'Delegated Staking Share Ratio must be a number from 0 to 100.'
          : undefined;
      },
    },
    {
      formPropertyName: 'note',
      label: '*Note:',
      rowType: RowType.BOTTOM,
      validateProperty: (v: string) => {
        return v.trim() === '' ? 'Note is required.' : undefined;
      },
    },
  ];

  const isFormValid = () => {
    return formRowDefs.every((rowDef) => {
      // compare against false as it could be undefined
      if (rowDef.enabled == false) {
        return true;
      }
      const errorMessage = rowDef.validateProperty(
        formState[rowDef.formPropertyName],
      );
      return errorMessage === undefined;
    });
  };

  const submitForm = async () => {
    if (isFormValid() && arioWriteableSDK) {
      try {

        const { id:txID } = await arioWriteableSDK.joinNetwork({
          // GatewayConnectionSettings
          protocol: 'https',
          fqdn: formState.address,
          port: 443,

          // GatewayMetadata
          note: formState.note,
          label: formState.label,
          properties: propertiesIdEnabled ? formState.propertiesId : DEFAULT_FORM_STATE.propertiesId,
          observerWallet: formState.observerWallet,

          // GatewayStakingSettings
          allowDelegatedStaking: delegatedStakingEnabled,
          delegateRewardShareRatio: delegatedStakingEnabled
            ? parseFloat(formState.delegatedStakingShareRatio)
            : 0,
          minDelegatedStake: delegatedStakingEnabled
            ? parseFloat(formState.delegatedStaking)
            : 100,
          autoStake: true,

          qty: parseFloat(formState.stake),
        });
        console.log('txID', txID);
      } catch (e) {
        toast.error("${e}");
      }
    }
  };

  const resetForm = () => {
    setFormState({
      ...DEFAULT_FORM_STATE,
      observerWallet: walletAddress?.toString() ?? '',
    });
    setDelegatedStakingEnabled(false);
    setPropertiesIdEnabled(false);
    setFormErrors({});
  };

  const closeDialog = () => {
    resetForm();
    onClose();
  };

  return (
    <BaseModal open={open} onClose={closeDialog}>
      <div className="w-[680px] text-left">
        <div className="pb-[12px] text-[24px] text-high">Start Gateway</div>
        <div className="flex text-sm text-low">
          Owner ID:&nbsp;
          <span className="text-link">{walletAddress?.toString()}</span>
        </div>

        <div className="mt-[32px] grid grid-cols-[221px_auto] overflow-hidden rounded-md outline outline-grey-500">
          {formRowDefs.map((rowDef, index) => {
            return (
              <FormRow
                key={index}
                formState={formState}
                setFormState={setFormState}
                errorMessages={formErrors}
                setErrorMessages={setFormErrors}
                {...rowDef}
              />
            );
          })}
        </div>
        <div className="mt-[32px] flex w-full grow justify-end gap-[11px]">
          <Button
            className="w-[100px]"
            onClick={closeDialog}
            active={true}
            title="Cancel"
            text="Cancel"
          />
          <div
            className={
              isFormValid() ? undefined : 'pointer-events-none opacity-30'
            }
          >
            <Button
              className="w-[100px]"
              onClick={() => {
                submitForm();
              }}
              title="Confirm"
              text="Confirm"
              buttonType={ButtonType.PRIMARY}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default StartGatewayModal;
