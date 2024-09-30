import { AoGateway, mIOToken } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import ConnectModal from '@src/components/modals/ConnectModal';
import StakingModal from '@src/components/modals/StakingModal';
import { useGlobalState } from '@src/store';
import { useState } from 'react';

const DisplayRow = ({
  label,
  value,
  type,
  rightComponent,
}: {
  label: string;
  value: React.ReactNode | string | number | boolean | undefined;
  type?: string;
  rightComponent?: React.ReactNode;
}) => {
  return (
    <>
      <div className="border-t border-grey-900">
        <div className=" bg-grey-1000 px-6 py-3 text-xs text-low">{label}</div>
      </div>
      <div className="flex flex-col content-center justify-center border-t border-grey-900 pl-6 text-sm text-low">
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
  const ticker = useGlobalState((state) => state.ticker);

  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  const gatewayAddress = gateway
    ? `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`
    : undefined;

  const gatewayLeaving = gateway?.status == 'leaving';

  const conditionalRows = gateway?.settings.allowDelegatedStaking
    ? [
        {
          label: 'Reward Share Ratio:',
          value: gatewayLeaving
            ? 'N/A'
            : `${gateway?.settings.delegateRewardShareRatio}%`,
        },
        {
          label: `Minimum Delegated Stake (${ticker}):`,
          value: gatewayLeaving
            ? 'N/A'
            : new mIOToken(gateway?.settings.minDelegatedStake || 0)
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
      label: `Gateway Stake abc (${ticker}):`,
      value:
        gateway?.operatorStake != undefined
          ? new mIOToken(gateway?.operatorStake).toIO().valueOf()
          : undefined,
    },
    {
      label: 'Status:',
      value:
        gateway?.status == 'leaving' ? (
          <div className="text-[#f00]">leaving</div>
        ) : (
          gateway?.status
        ),
    },
    { label: 'Note:', value: gateway?.settings.note },
    {
      label: `Total Delegated Stake (${ticker}):`,
      value: gatewayLeaving
        ? 'N/A'
        : gateway?.totalDelegatedStake == undefined
          ? undefined
          : new mIOToken(gateway.totalDelegatedStake).toIO().valueOf(),
    },
    {
      label: 'Reward Auto Stake:',
      value: gatewayLeaving ? 'N/A' : gateway?.settings.autoStake,
    },
    {
      label: 'Delegated Staking:',
      value: gatewayLeaving ? 'N/A' : gateway?.settings.allowDelegatedStaking,
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
    <div className="grid grid-cols-[14.375rem_auto]">
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
