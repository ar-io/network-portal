import { IOToken, JoinNetworkParams } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { updatePendingDataCache } from '@src/store/persistent';
import { showErrorToast } from '@src/utils/toast';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import FormRow, { RowType } from '../forms/FormRow';
import FormSwitch from '../forms/FormSwitch';
import { FormRowDef, isFormValid } from '../forms/formData';
import {
  validateDomainName,
  validateIOAmount,
  validateNumberRange,
  validateString,
  validateTransactionId,
  validateWalletAddress,
} from '../forms/validation';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

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

const DEFAULT_PROTOCOL = 'https';
const DEFAULT_PORT = 443;
const DEFAULT_DELEGATED_STAKING_REWARD_SHARE_RATIO = 0;
const DEFAULT_DELEGATED_STAKING = 100;

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
    useState<Record<string, string | boolean>>(DEFAULT_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [delegatedStakingEnabled, setDelegatedStakingEnabled] =
    useState<boolean>(false);
  const [propertiesIdEnabled, setPropertiesIdEnabled] =
    useState<boolean>(false);

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      validateProperty: validateString('Label', 1, 64),
    },
    {
      formPropertyName: 'address',
      label: '*Address:',
      leftComponent: <div className="pl-[24px] text-xs text-low">https://</div>,
      rightComponent: <div className="pr-[24px] text-xs text-low">:443</div>,

      validateProperty: validateDomainName('Address'),
    },
    {
      formPropertyName: 'observerWallet',
      label: '*Observer Wallet:',
      validateProperty: validateWalletAddress('Observer Wallet'),
    },
    {
      formPropertyName: 'propertiesId',
      label: '*Properties ID:',
      enabled: propertiesIdEnabled,
      placeholder: DEFAULT_FORM_STATE.propertiesId,
      validateProperty: validateTransactionId('Properties ID'),
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
      validateProperty: validateIOAmount('Stake', 10000),
    },
    {
      formPropertyName: 'minDelegatedStake',
      label: 'Delegated Staking (IO):',
      enabled: delegatedStakingEnabled,
      placeholder: delegatedStakingEnabled
        ? 'Minimum 100 IO'
        : 'Delegated Staking Off',
      validateProperty: validateIOAmount('Minimum Delegated Stake', 100),
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
      validateProperty: validateNumberRange(
        'Delegated Staking Share Ratio',
        0,
        100,
      ),
    },
    {
      formPropertyName: 'note',
      label: '*Note:',
      rowType: RowType.BOTTOM,
      validateProperty: validateString('Note', 1, 256),
    },
  ];

  const submitForm = async () => {
    const formValid = isFormValid({ formRowDefs, formValues: formState });

    if (formValid && arioWriteableSDK) {
      try {
        setShowBlockingMessageModal(true);
        const joinNetworkParams: JoinNetworkParams = {
          // GatewayConnectionSettings
          protocol: DEFAULT_PROTOCOL,
          fqdn: String(formState.address),
          port: DEFAULT_PORT,

          // GatewayMetadata
          note: String(formState.note),
          label: String(formState.label),
          properties: propertiesIdEnabled
            ? String(formState.propertiesId)
            : DEFAULT_FORM_STATE.propertiesId,
          observerWallet: String(formState.observerWallet),

          // GatewayStakingSettings
          allowDelegatedStaking: delegatedStakingEnabled,
          delegateRewardShareRatio: delegatedStakingEnabled
            ? parseFloat(String(formState.delegatedStakingShareRatio))
            : DEFAULT_DELEGATED_STAKING_REWARD_SHARE_RATIO,
          minDelegatedStake: new IOToken(
            delegatedStakingEnabled
              ? parseFloat(String(formState.minDelegatedStake))
              : DEFAULT_DELEGATED_STAKING,
          ).toMIO(),
          autoStake: true,

          qty: new IOToken(parseFloat(String(formState.stake))).toMIO(),
        };

        // UNCOMMENT AND COMMENT OUT JOIN NETWORK FOR DEV WORK
        // await delay(5000);
        const { id: txID } =
          await arioWriteableSDK.joinNetwork(joinNetworkParams);

        // TODO: replace with logger call at INFO level when logger reinstated
        console.log('Join Network txID:', txID);

        if (walletAddress) {
          updatePendingDataCache(walletAddress.toString(), {
            pendingJoinNetworkParams: joinNetworkParams,
          });
        }
        setShowSuccessModal(true);
      } catch (e: any) {
        showErrorToast(`${e}`);
      } finally {
        setShowBlockingMessageModal(false);
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
              isFormValid({ formRowDefs, formValues: formState })
                ? undefined
                : 'pointer-events-none opacity-30'
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
        <BlockingMessageModal
          open={showBlockingMessageModal}
          onClose={() => setShowBlockingMessageModal(false)}
          message="Sign the following data with your wallet to proceed."
        ></BlockingMessageModal>
        <SuccessModal
          open={showSuccessModal}
          onClose={() => {
            resetForm();
            setShowSuccessModal(false);
            onClose();
          }}
          title="Congratulations"
          bodyText="You have successfully joined the network."
        />
      </div>
    </BaseModal>
  );
};

export default StartGatewayModal;
