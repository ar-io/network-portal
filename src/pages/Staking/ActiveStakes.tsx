import { Gateway, mIOToken } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import { GearIcon, SortAsc, SortDesc } from '@src/components/icons';
import StakingModal from '@src/components/modals/StakingModal';
import useGateways from '@src/hooks/useGateways';
import { useGlobalState } from '@src/store';
import {
  SortingState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

interface TableData {
  owner: string;
  delegatedStake: number;
  gateway: Gateway;
  pendingWithdrawals: number;
}

const columnHelper = createColumnHelper<TableData>();

const ActiveStakes = () => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'delegatedStake',
      desc: true,
    },
  ]);
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const { data: gateways } = useGateways();
  const [activeStakes, setActiveStakes] = useState<Array<TableData>>([]);

  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

  useEffect(() => {
    const activeStakes: Array<TableData> =
      !walletAddress || !gateways
        ? ([] as Array<TableData>)
        : Object.keys(gateways).reduce((acc, key) => {
            const gateway = gateways[key];
            const delegate = gateway.delegates[walletAddress?.toString()];

            if (delegate) {
              return [
                ...acc,
                {
                  owner: key,
                  delegatedStake: delegate.delegatedStake,
                  gateway,
                  pendingWithdrawals: Object.keys(delegate.vaults).length,
                },
              ];
            }
            return acc;
          }, [] as Array<TableData>);
    setActiveStakes(activeStakes);
  }, [gateways, walletAddress]);

  // Define columns for the table
  const columns = [
    columnHelper.accessor('gateway.settings.label', {
      id: 'label',
      header: 'Label',
      sortDescFirst: false,
    }),
    columnHelper.accessor('gateway.settings.fqdn', {
      id: 'domain',
      header: 'Domain',
      sortDescFirst: false,
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: 'Address',
      sortDescFirst: false,
    }),
    columnHelper.accessor('delegatedStake', {
      id: 'delegatedStake',
      header: 'Current Stake',
      sortDescFirst: true,
    }),
    columnHelper.accessor('pendingWithdrawals', {
      id: 'pendingWithdrawals',
      header: 'Pending Withdrawals',
      sortDescFirst: true,
    }),
  ];

  const table = useReactTable({
    columns,
    data: activeStakes,
    getCoreRowModel: getCoreRowModel<TableData>(),
    getSortedRowModel: getSortedRowModel(), //provide a sorting row model
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div>
      <div className="mt-2 flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
        <div className="grow text-sm text-mid">Active Stakes</div>
        <Button
          buttonType={ButtonType.SECONDARY}
          className="*:text-gradient h-[30px]"
          active={true}
          title="Withdraw All"
          text="Withdraw All"
        />
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
                      {sortState ? (
                        sortState === 'desc' ? (
                          <SortDesc />
                        ) : (
                          <SortAsc />
                        )
                      ) : undefined}
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
            const stake = new mIOToken(row.getValue('delegatedStake'))
              .toIO()
              .valueOf();
            const pendingWithdrawals = row.getValue(
              'pendingWithdrawals',
            ) as number;
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
                <td>{stake}</td>
                <td
                  className={pendingWithdrawals > 0 ? 'text-high' : 'text-low'}
                >{`${pendingWithdrawals}`}</td>
                <td>
                  <Button
                    buttonType={ButtonType.SECONDARY}
                    active={true}
                    title="Unstake"
                    text=" "
                    rightIcon={<GearIcon />}
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

export default ActiveStakes;
