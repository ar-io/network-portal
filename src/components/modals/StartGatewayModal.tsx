import { ARIOToken } from '@ar.io/sdk/web';
import { GATEWAY_OPERATOR_STAKE_MINIMUM_ARIO, WRITE_OPTIONS, log } from '@src/constants';
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
  const ticker = useGlobalState((state) => state.ticker);

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
      leftComponent: <div className="pl-6 text-xs text-low">https://</div>,
      rightComponent: <div className="pr-6 text-xs text-low">:443</div>,

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
      label: `*Stake (${ticker}):`,
      placeholder: `Minimum ${GATEWAY_OPERATOR_STAKE_MINIMUM_ARIO} ${ticker}`,
      validateProperty: validateIOAmount('Stake', ticker, GATEWAY_OPERATOR_STAKE_MINIMUM_ARIO),
    },
    {
      formPropertyName: 'allowDelegatedStaking',
      label: 'Delegated Staking:',
    },
    {
      formPropertyName: 'minDelegatedStake',
      label: `Minimum Delegated Stake (${ticker}):`,
      enabled: allowDelegatedStaking,
      placeholder: allowDelegatedStaking
        ? `Minimum 10 ${ticker}`
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateIOAmount('Minimum Delegated Stake', ticker, 10),
    },
    {
      formPropertyName: 'delegatedStakingShareRatio',
      label: 'Reward Share Ratio:',
      enabled: allowDelegatedStaking,
      placeholder: allowDelegatedStaking
        ? 'Enter value 0-95'
        : 'Enable Delegated Staking to set this value.',
      validateProperty: validateNumberRange('Reward Share Ratio', 0, 95),
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
          minDelegatedStake: new ARIOToken(
            allowDelegatedStaking
              ? parseFloat(String(formState.minDelegatedStake))
              : DEFAULT_DELEGATED_STAKING,
          ).toMARIO().valueOf(),
          autoStake: true,
          operatorStake: new ARIOToken(
            parseFloat(String(formState.stake)),
          ).toMARIO().valueOf(),
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
      <div className="w-[42.5rem] text-left">
        <div className="pb-3 text-2xl text-high">Start Gateway</div>
        <div className="flex text-sm text-low">
          Owner ID:&nbsp;
          <span className="text-link">{walletAddress?.toString()}</span>
        </div>

        <div className="mt-8 grid grid-cols-[14.375rem_auto] overflow-hidden rounded-md outline outline-grey-500">
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
        <div className="mt-8 flex w-full grow justify-end gap-[.6875rem]">
          <Button
            className="w-[6.25rem]"
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
              className="w-[6.25rem]"
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
