import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import useVaults from '@src/hooks/useVaults';
import { useGlobalState } from '@src/store';
import { AoAddress } from '@src/types';
import { formatDate, formatDateTime, formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useMemo } from 'react';

interface TableData {
  startTimestamp: number;
  endTimestamp: number;

  controller: string;

  daysRemaining: number;
  balance: number;
}

const columnHelper = createColumnHelper<TableData>();

const VaultsTable = ({ walletAddress }: { walletAddress?: AoAddress }) => {
  const ticker = useGlobalState((state) => state.ticker);
  const { isLoading, data: vaults } = useVaults();

  const vaultsTableData: Array<TableData> = useMemo(() => {
    return (
      vaults
        ?.filter((vault) => vault.address === walletAddress?.toString())
        .map((vault) => {
          return {
            startTimestamp: vault.startTimestamp,
            endTimestamp: vault.endTimestamp,
            daysRemaining: dayjs(vault.endTimestamp).diff(dayjs(), 'days'),
            balance: new mARIOToken(vault.balance).toARIO().valueOf(),
            controller: vault.controller || 'N/A',
          };
        }) ?? []
    );
  }, [vaults, walletAddress]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('startTimestamp', {
        id: 'startTimeStamp',
        header: 'Start Date',
        sortDescFirst: false,
        cell: ({ row }) => (
          <Tooltip
            message={
              <div>
                <div>Timestamp: {row.original.startTimestamp}</div>
                <div>
                  Date:{' '}
                  {formatDateTime(new Date(row.original.startTimestamp))}
                </div>
              </div>
            }
          >
            <div className="cursor-pointer">
              {formatDate(new Date(row.original.startTimestamp))}
            </div>
          </Tooltip>
        ),
      }),

      columnHelper.accessor('endTimestamp', {
        id: 'endTimestamp',
        header: 'End Date',
        sortDescFirst: false,
        cell: ({ row }) => (
          <Tooltip
            message={
              <div>
                <div>Timestamp: {row.original.endTimestamp}</div>
                <div>
                  Date:{' '}
                  {formatDateTime(new Date(row.original.endTimestamp))}
                </div>
              </div>
            }
          >
            <div className="cursor-pointer">
              {formatDate(new Date(row.original.endTimestamp))}
            </div>
          </Tooltip>
        ),
      }),
      columnHelper.accessor('daysRemaining', {
        id: 'daysRemaining',
        header: 'Days Remaining',
        sortDescFirst: false,
      }),
      columnHelper.accessor('controller', {
        id: 'controller',
        header: 'Controller',
        cell: ({ row }) => <AddressCell address={row.getValue('controller')} />,
      }),
      columnHelper.accessor('balance', {
        id: 'balance',
        header: 'Vaulted Tokens',
        cell: ({ row }) => (
          <div className="text-gradient w-fit">
            {formatWithCommas(row.original.balance)} ${ticker}
          </div>
        ),
      }),
    ];
  }, [ticker]);

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 py-[0.9375rem] pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Locked Token Vaults</div>
      </div>
      <TableView
        columns={columns}
        data={vaultsTableData}
        isLoading={isLoading}
        noDataFoundText="No locked token vaults found."
        defaultSortingState={{ id: 'endTimestamp', desc: false }}
      />
    </div>
  );
};

export default VaultsTable;
