import { mIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import { InfoIcon } from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StakingModal from '@src/components/modals/StakingModal';
import {
  EAY_TOOLTIP_FORMULA,
  EAY_TOOLTIP_TEXT,
  IO_LABEL,
} from '@src/constants';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { calculateGatewayRewards } from '@src/utils/rewards';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MathJax } from 'better-react-mathjax';
import { useEffect, useState } from 'react';

interface TableData {
  label: string;
  domain: string;
  owner: string;
  failedConsecutiveEpochs: number;
  rewardRatio: number;
  totalDelegatedStake: number;
  totalStake: number;
  operatorStake: number;
  eay: number;
}

const columnHelper = createColumnHelper<TableData>();

const DelegateStake = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const { isLoading, data: gateways } = useGateways();
  const [stakeableGateways, setStakeableGateways] = useState<Array<TableData>>(
    [],
  );

  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  const { data: protocolBalance } = useProtocolBalance();

  useEffect(() => {
    const stakeableGateways: Array<TableData> =
      !gateways || !protocolBalance
        ? []
        : Object.entries(gateways).reduce((acc, [owner, gateway]) => {
            if (gateway.settings.allowDelegatedStaking) {
              return [
                ...acc,
                {
                  label: gateway.settings.label,
                  domain: gateway.settings.fqdn,
                  owner,
                  failedConsecutiveEpochs:
                    gateway.stats.failedConsecutiveEpochs,
                  rewardRatio: gateway.settings.delegateRewardShareRatio,

                  totalDelegatedStake: new mIOToken(gateway.totalDelegatedStake)
                    .toIO()
                    .valueOf(),
                  operatorStake: new mIOToken(gateway.operatorStake)
                    .toIO()
                    .valueOf(),
                  totalStake: new mIOToken(
                    gateway.totalDelegatedStake + gateway.operatorStake,
                  )
                    .toIO()
                    .valueOf(),

                  eay: calculateGatewayRewards(
                    new mIOToken(protocolBalance).toIO(),
                    Object.keys(gateways).length,
                    gateway,
                  ).EAY,
                },
              ];
            }
            return acc;
          }, [] as Array<TableData>);
    setStakeableGateways(stakeableGateways);
  }, [gateways, protocolBalance, walletAddress]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    columnHelper.accessor('label', {
      id: 'label',
      header: 'Label',
      sortDescFirst: false,
    }),
    columnHelper.accessor('domain', {
      id: 'domain',
      header: 'Domain',
      sortDescFirst: false,
      cell: ({ row }) => (
        <div className="text-gradient">
          <a
            href={`https://${row.getValue('domain')}`}
            target="_blank"
            rel="noreferrer"
          >
            {row.getValue('domain')}
          </a>{' '}
        </div>
      ),
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: 'Address',
      sortDescFirst: false,
      cell: ({ row }) => <AddressCell address={row.getValue('owner')} />,
    }),
    columnHelper.accessor('totalStake', {
      id: 'totalStake',
      header: `Total Stake (${IO_LABEL})`,
      sortDescFirst: true,
      cell: ({ row }) => (
        <Tooltip
          message={
            <div>
              <div>
                Operator Stake: {formatWithCommas(row.original.operatorStake)}{' '}
                {IO_LABEL}
              </div>
              <div className="mt-1">
                Delegated Stake:{' '}
                {formatWithCommas(row.original.totalDelegatedStake)} {IO_LABEL}
              </div>
            </div>
          }
        >
          {formatWithCommas(row.getValue('totalStake'))}
        </Tooltip>
      ),
    }),
    columnHelper.accessor('failedConsecutiveEpochs', {
      id: 'failedConsecutiveEpochs',
      header: 'Offline Epochs',
      sortDescFirst: true,
    }),
    columnHelper.accessor('rewardRatio', {
      id: 'rewardRatio',
      header: 'Reward Share Ratio',
      sortDescFirst: true,
      cell: ({ row }) => `${row.original.rewardRatio}%`,
    }),
    columnHelper.accessor('eay', {
      id: 'eay',
      header: () => (
        <div className="flex gap-[4px]">
          EAY
          <Tooltip
            message={
              <div>
                <p>{EAY_TOOLTIP_TEXT}</p>
                <MathJax className="mt-4">{EAY_TOOLTIP_FORMULA}</MathJax>
              </div>
            }
          >
            <InfoIcon className="h-full" />
          </Tooltip>
        </div>
      ),
      sortDescFirst: true,
      cell: ({ row }) => (
        <div>
          {row.original.eay < 0
            ? 'N/A'
            : `${formatWithCommas(row.original.eay)}%`}
        </div>
      ),
    }),

    columnHelper.display({
      id: 'action',
      header: '',
      cell: ({ row }) => {
        return (
          <div className="pr-[24px]">
            <Button
              buttonType={ButtonType.PRIMARY}
              active={true}
              title="Manage Stake"
              text="Stake"
              onClick={() => {
                if (walletAddress) {
                  setStakingModalWalletAddress(row.getValue('owner') as string);
                } else {
                  setIsConnectModalOpen(true);
                }
              }}
            />
          </div>
        );
      },
    }),
  ];

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
        <div className="grow text-sm text-mid">Delegate Stake</div>
      </div>
      <TableView
        columns={columns}
        data={stakeableGateways}
        isLoading={isLoading}
        noDataFoundText="No stakeable gateways found."
        defaultSortingState={{ id: 'totalDelegatedStake', desc: true }}
      />
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

export default DelegateStake;
