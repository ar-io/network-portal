import { IOToken } from '@ar.io/sdk/web';
import { IO_LABEL, WRITE_OPTIONS, log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import FormRow, { RowType } from '../forms/FormRow';
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
  observerAddress: '',
  propertiesId: 'FH1aVetOoulPGqgYukj0VE0wIhDy90WiQoV3U2PeY44',
  stake: '',
  allowDelegatedStaking: false,
  delegatedStaking: '',
  delegatedStakingShareRatio: '',
  note: '',
};

const DEFAULT_PROTOCOL = 'https' as const;
const DEFAULT_PORT = 443;
const DEFAULT_DELEGATED_STAKING_REWARD_SHARE_RATIO = 0;
const DEFAULT_DELEGATED_STAKING = 500;

const StartGatewayModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arioWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const [formState, setFormState] =
    useState<Record<string, string | boolean>>(DEFAULT_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setFormState((currentState) => {
      return {
        ...currentState,
        observerAddress: walletAddress?.toString() ?? '',
      };
    });
  }, [walletAddress]);

  const allowDelegatedStaking = formState.allowDelegatedStaking as boolean;

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
      formPropertyName: 'observerAddress',
      label: '*Observer Wallet:',
      validateProperty: validateWalletAddress('Observer Wallet'),
    },
    {
      formPropertyName: 'propertiesId',
      label: '*Properties ID:',
      placeholder: DEFAULT_FORM_STATE.propertiesId,
      validateProperty: validateTransactionId('Properties ID'),
    },
    {
      formPropertyName: 'stake',
      label: `*Stake (${IO_LABEL}):`,
      placeholder: `Minimum 50000 ${IO_LABEL}`,
      validateProperty: validateIOAmount('Stake', 50000),
    },
    {
      formPropertyName: 'allowDelegatedStaking',
      label: 'Delegated Staking:',
    },
    {
      formPropertyName: 'minDelegatedStake',
      label: `Minimum Delegated Stake (${IO_LABEL}):`,
      enabled: allowDelegatedStaking,
      placeholder: allowDelegatedStaking
        ? `Minimum 500 ${IO_LABEL}`
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateIOAmount('Minimum Delegated Stake', 500),
    },
    {
      formPropertyName: 'delegatedStakingShareRatio',
      label: 'Reward Share Ratio:',
      enabled: allowDelegatedStaking,
      placeholder: allowDelegatedStaking
        ? 'Enter value 0-100'
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateNumberRange('Reward Share Ratio', 0, 100),
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
        const allowDelegatedStaking =
          formState.allowDelegatedStaking as boolean;
        setShowBlockingMessageModal(true);
        const joinNetworkParams = {
          // GatewayConnectionSettings
          protocol: DEFAULT_PROTOCOL,
          fqdn: String(formState.address),
          port: DEFAULT_PORT,

          // GatewayMetadata
          note: String(formState.note),
          label: String(formState.label),
          properties: String(formState.propertiesId),
          observerAddress: String(formState.observerAddress),

          // GatewayStakingSettings
          allowDelegatedStaking,
          delegateRewardShareRatio: allowDelegatedStaking
            ? parseFloat(String(formState.delegatedStakingShareRatio))
            : DEFAULT_DELEGATED_STAKING_REWARD_SHARE_RATIO,
          minDelegatedStake: new IOToken(
            allowDelegatedStaking
              ? parseFloat(String(formState.minDelegatedStake))
              : DEFAULT_DELEGATED_STAKING,
          ).toMIO(),
          autoStake: true,
          operatorStake: new IOToken(
            parseFloat(String(formState.stake)),
          ).toMIO(),
        };

        // UNCOMMENT AND COMMENT OUT JOIN NETWORK FOR DEV WORK
        // await delay(5000);
        const { id: txID } = await arioWriteableSDK.joinNetwork(
          joinNetworkParams,
          WRITE_OPTIONS,
        );

        log.info(`Join Network txID: ${txID}`);

        queryClient.invalidateQueries({
          queryKey: ['gateway', walletAddress?.toString()],
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

  const resetForm = () => {
    setFormState({
      ...DEFAULT_FORM_STATE,
      observerAddress: walletAddress?.toString() ?? '',
    });
    setFormErrors({});
  };

  const closeDialog = () => {
    resetForm();
    onClose();
  };

  return (
    <BaseModal onClose={closeDialog}>
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
                showModified={false}
                initialState={
                  rowDef.formPropertyName === 'propertiesId' ||
                  rowDef.formPropertyName === 'observerAddress'
                    ? {
                        ...DEFAULT_FORM_STATE,
                        observerAddress: walletAddress?.toString() ?? '',
                      }
                    : undefined
                }
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
        {showBlockingMessageModal && (
          <BlockingMessageModal
            onClose={() => setShowBlockingMessageModal(false)}
            message="Sign the following data with your wallet to proceed."
          ></BlockingMessageModal>
        )}
        {showSuccessModal && (
          <SuccessModal
            onClose={() => {
              resetForm();
              setShowSuccessModal(false);
              onClose();
            }}
            title="Congratulations"
            bodyText="You have successfully joined the network."
          />
        )}
      </div>
    </BaseModal>
  );
};

export default StartGatewayModal;
