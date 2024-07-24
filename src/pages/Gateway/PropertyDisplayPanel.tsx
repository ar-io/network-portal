import { AoGateway, mIOToken } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import ConnectModal from '@src/components/modals/ConnectModal';
import StakingModal from '@src/components/modals/StakingModal';
import { IO_LABEL } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useState } from 'react';

const DisplayRow = ({
  label,
  value,
  type,
  rightComponent,
}: {
  label: string;
  value: string | number | boolean | undefined;
  type?: string;
  rightComponent?: React.ReactNode;
}) => {
  return (
    <>
      <div className="border-t border-grey-900">
        <div className="h-[39px] bg-grey-1000 px-[24px] py-[12px] text-xs text-low">
          {label}
        </div>
      </div>
      <div className="flex h-[39px] flex-col content-center justify-center border-t border-grey-900 pl-[24px] text-sm text-low">
        {value === undefined ? (
          <Placeholder />
        ) : typeof value === 'boolean' ? (
          <div className="flex items-center">
            <span className={`grow ${value ? 'text-green-600' : undefined}`}>
              {value ? 'Enabled' : 'Disabled'}
            </span>
            {rightComponent}
          </div>
        ) : type == 'address' || type == 'tx' ? (
          <a
            className="text-high"
            href={`https://viewblock.io/arweave/${type}/${value}`}
            target="_blank"
            rel="noreferrer"
          >
            {value}
          </a>
        ) : type == 'link' ? (
          <a
            className="text-gradient"
            href={value + ''}
            target="_blank"
            rel="noreferrer"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </>
  );
};

const PropertyDisplayPanel = ({
  ownerId,
  gateway,
}: {
  ownerId?: string;
  gateway?: AoGateway;
}) => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  const gatewayAddress = gateway
    ? `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`
    : undefined;

  const conditionalRows = gateway?.settings.allowDelegatedStaking
    ? [
        {
          label: 'Reward Share Ratio:',
          value: `${gateway?.settings.delegateRewardShareRatio}%`,
        },
        {
          label: `Minimum Delegated Stake (${IO_LABEL}):`,
          value: new mIOToken(gateway?.settings.minDelegatedStake || 0)
            .toIO()
            .valueOf(),
        },
      ]
    : [];

  const gatewayRows = [
    { label: 'Label:', value: gateway?.settings.label },
    { label: 'Address:', value: gatewayAddress, type: 'link' },
    { label: 'Owner Wallet:', value: ownerId, type: 'address' },
    {
      label: 'Observer Wallet:',
      value: gateway?.observerAddress,
      type: 'address',
    },
    {
      label: 'Properties ID:',
      value: gateway?.settings.properties,
      type: 'tx',
    },
    {
      label: `Gateway Stake (${IO_LABEL}):`,
      value: gateway?.operatorStake
        ? new mIOToken(gateway?.operatorStake).toIO().valueOf()
        : undefined,
    },
    { label: 'Status:', value: gateway?.status },
    { label: 'Note:', value: gateway?.settings.note },
    {
      label: `Total Delegated Stake (${IO_LABEL}):`,
      value: new mIOToken(gateway?.totalDelegatedStake || 0).toIO().valueOf(),
    },
    { label: 'Reward Auto Stake:', value: gateway?.settings.autoStake },
    {
      label: 'Delegated Staking:',
      value: gateway?.settings.allowDelegatedStaking,
      rightComponent: gateway?.settings.allowDelegatedStaking ? (
        <Button
          className="mr-2"
          buttonType={ButtonType.PRIMARY}
          active={true}
          title="Manage Stake"
          text="Stake"
          onClick={() => {
            if (walletAddress) {
              setStakingModalWalletAddress(ownerId);
            } else {
              setIsConnectModalOpen(true);
            }
          }}
        />
      ) : undefined,
    },
    ...conditionalRows,
  ];

  return (
    <div className="grid grid-cols-[225px_auto]">
      {gatewayRows.map(({ label, value, type, rightComponent }, index) => (
        <DisplayRow
          key={index}
          label={label}
          value={value}
          type={type}
          rightComponent={rightComponent}
        />
      ))}

      {stakingModalWalletAddress && (
        <StakingModal
          open={!!stakingModalWalletAddress}
          onClose={() => setStakingModalWalletAddress(undefined)}
          ownerWallet={stakingModalWalletAddress}
        />
      )}

      {isConnectModalOpen && (
        <ConnectModal onClose={() => setIsConnectModalOpen(false)} />
      )}
    </div>
  );
};

export default PropertyDisplayPanel;
