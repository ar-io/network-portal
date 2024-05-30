import { mIOToken } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import Tooltip from '@src/components/Tooltip';
import { InfoIcon, SortAsc, SortDesc } from '@src/components/icons';
import StakingModal from '@src/components/modals/StakingModal';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { calculateGatewayRewards } from '@src/utils/rewards';
import {
  SortingState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

const EAY_TOOLTIP_TEXT =
  'EAY = Estimated yield ratio determined by the projecting the current nominal reward conditions over the course of a year. Does NOT include potential observation rewards.';

interface TableData {
  label: string;
  domain: string;
  owner: string;
  failedConsecutiveEpochs: number;
  rewardRatio: number;
  eay: number;
}

const columnHelper = createColumnHelper<TableData>();

const DelegateStake = () => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'rewardRatio',
      desc: true,
    },
  ]);
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const { data: gateways } = useGateways();
  const [stakeableGateways, setStakeableGateways] = useState<Array<TableData>>(
    [],
  );

  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

  const { data: protocolBalance } = useProtocolBalance();

  useEffect(() => {
    const stakeableGateways: Array<TableData> =
      !walletAddress || !gateways || !protocolBalance
        ? ([] as Array<TableData>)
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
  const columns = [
    columnHelper.accessor('label', {
      id: 'label',
      header: 'Label',
      sortDescFirst: false,
    }),
    columnHelper.accessor('domain', {
      id: 'domain',
      header: 'Domain',
      sortDescFirst: false,
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: 'Address',
      sortDescFirst: false,
    }),
    columnHelper.accessor('failedConsecutiveEpochs', {
      id: 'failedConsecutiveEpochs',
      header: 'Offline Epochs',
      sortDescFirst: true,
    }),
    columnHelper.accessor('rewardRatio', {
      id: 'rewardRatio',
      header: 'Reward Ratio',
      sortDescFirst: true,
    }),
    columnHelper.accessor('eay', {
      id: 'eay',
      header: 'EAY',
      sortDescFirst: true,
    }),
  ];

  const table = useReactTable({
    columns,
    data: stakeableGateways,
    getCoreRowModel: getCoreRowModel<TableData>(),
    getSortedRowModel: getSortedRowModel(), //provide a sorting row model
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
        <div className="grow text-sm text-mid">Delegate Stake</div>
      </div>
      <table className="w-full border-x border-b border-grey-500">
        <thead className="text-xs text-low">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortState = header.column.getIsSorted();
                return (
                  <th key={header.id} className="py-[7.5px] pl-[24px]">
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => {
                        setSorting([
                          {
                            id: header.column.id,
                            desc: sortState
                              ? sortState === 'desc'
                                ? false
                                : true
                              : header.column.columnDef.sortDescFirst ?? true,
                          },
                        ]);
                      }}
                    >
                      {header.column.columnDef.header?.toString()}
                      {header.column.columnDef.id === 'eay' && (
                        <Tooltip message={EAY_TOOLTIP_TEXT}>
                          <InfoIcon className='h-full'/>
                        </Tooltip>
                      )}
                      {sortState ? (
                        sortState === 'desc' ? (
                          <SortDesc />
                        ) : (
                          <SortAsc />
                        )
                      ) : (
                        <div className="w-[16px]" />
                      )}
                    </button>
                  </th>
                );
              })}
              <th></th>
            </tr>
          ))}
        </thead>
        <tbody className="text-sm">
          {table.getRowModel().rows.map((row) => {
            const owner = row.renderValue('owner') as string;

            return (
              <tr
                key={row.id}
                className="border-t border-grey-500 text-low *:py-[16px] *:pl-[24px]"
              >
                <td>{row.getValue('label')}</td>
                <td>
                  <div className="text-gradient">
                    <a
                      href={`https://${row.getValue('domain')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {row.getValue('domain')}
                    </a>{' '}
                  </div>
                </td>
                <td className="text-mid">
                  <a
                    href={`https://viewblock.io/arweave/address/${owner}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {owner}
                  </a>
                </td>
                <td>{row.original.failedConsecutiveEpochs}</td>
                <td>{row.original.rewardRatio}</td>
                <td>
                  {row.original.eay < 0
                    ? 'N/A'
                    : `${formatWithCommas(row.original.eay)}%`}
                </td>
                <td className="pr-[24px]">
                  <Button
                    buttonType={ButtonType.PRIMARY}
                    active={true}
                    title="Stake"
                    text="Stake"
                    onClick={() => {
                      setStakingModalWalletAddress(
                        row.getValue('owner') as string,
                      );
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {stakingModalWalletAddress && (
        <StakingModal
          open={!!stakingModalWalletAddress}
          onClose={() => setStakingModalWalletAddress(undefined)}
          ownerWallet={stakingModalWalletAddress}
        />
      )}
    </div>
  );
};

export default DelegateStake;
