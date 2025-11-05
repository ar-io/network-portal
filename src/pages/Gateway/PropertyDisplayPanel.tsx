import { AoGateway, mARIOToken } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import ConnectModal from '@src/components/modals/ConnectModal';
import LeaveNetworkModal from '@src/components/modals/LeaveNetworkModal';
import StakingModal from '@src/components/modals/StakingModal';
import { useGlobalState } from '@src/store';
import { getBlockExplorerUrlForAddress } from '@src/utils';
import { useState } from 'react';

type DisplayRowProps = {
  label: string;
  value?: string | number | boolean | React.ReactNode;
  type?: string;
  rightComponent?: React.ReactNode;
};

const DisplayRow = ({
  label,
  value,
  type,
  rightComponent,
}: DisplayRowProps) => {
  return (
    <>
      <div className="border-t border-grey-900">
        <div className=" bg-grey-1000 px-6 py-3 text-xs text-low">{label}</div>
      </div>
      <div className="flex flex-col content-center justify-center border-t border-grey-900 p-2 text-sm text-low lg:p-0">
        {value === undefined ? (
          <Placeholder />
        ) : typeof value === 'boolean' ? (
          <div className="flex items-center">
            <span className={`grow ${value ? 'text-green-600' : undefined}`}>
              {value ? 'Enabled' : 'Disabled'}
            </span>
            {rightComponent}
          </div>
        ) : type === 'address' || type === 'tx' ? (
          <a
            className="text-high"
            href={
              type === 'tx'
                ? `https://viewblock.io/arweave/tx/${value}`
                : getBlockExplorerUrlForAddress((value || '').toString())
            }
            target="_blank"
            rel="noreferrer"
          >
            {value}
          </a>
        ) : type === 'link' ? (
          <a
            className="text-gradient"
            href={value + ''}
            target="_blank"
            rel="noreferrer"
          >
            {value}
          </a>
        ) : (
          <div className="flex items-center break-all">
            <div className="grow">{value}</div>
            {rightComponent}
          </div>
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
  gateway?: AoGateway | null;
}) => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const isOwnGateway = ownerId && ownerId === walletAddress?.toString();

  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isLeaveNetworkModalOpen, setLeaveNetworkModalOpen] =
    useState<boolean>(false);

  const gatewayAddress = gateway
    ? `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`
    : undefined;

  const gatewayLeaving = gateway?.status === 'leaving';

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
            : new mARIOToken(gateway?.settings.minDelegatedStake || 0)
                .toARIO()
                .valueOf(),
        },
      ]
    : [];

  const gatewayRows: DisplayRowProps[] = [
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
      label: 'Status:',
      value:
        gateway?.status === 'leaving' ? (
          <div className="text-[#f00]">leaving</div>
        ) : (
          gateway?.status
        ),
      rightComponent:
        isOwnGateway && gateway?.status === 'joined' ? (
          <Button
            className="*:*:text-gradient-red mr-2"
            buttonType={ButtonType.PRIMARY}
            active={true}
            title="Leave Network"
            text="Leave"
            onClick={() => {
              setLeaveNetworkModalOpen(true);
            }}
          />
        ) : undefined,
    },
    { label: 'Note:', value: gateway?.settings.note },
    {
      label: 'Reward Auto Stake:',
      value: gatewayLeaving ? 'N/A' : gateway?.settings.autoStake,
    },
    {
      label: 'Delegated Staking:',
      value: gatewayLeaving ? 'N/A' : gateway?.settings.allowDelegatedStaking,
      rightComponent:
        !isOwnGateway &&
        gateway?.settings.allowDelegatedStaking &&
        gateway?.status === 'joined' ? (
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
    <div className="grid grid-cols-[8rem_auto] lg:grid-cols-[14.375rem_auto]">
      {gatewayRows.map(({ label, value, rightComponent }, index) => (
        <DisplayRow
          key={index}
          label={label}
          value={value}
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
      {isLeaveNetworkModalOpen && (
        <LeaveNetworkModal onClose={() => setLeaveNetworkModalOpen(false)} />
      )}
    </div>
  );
};

export default PropertyDisplayPanel;
