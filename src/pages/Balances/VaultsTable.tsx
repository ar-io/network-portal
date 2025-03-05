import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import TableView from '@src/components/TableView';
import useVaults from '@src/hooks/useVaults';
import { useGlobalState } from '@src/store';
import { formatDate, formatWithCommas } from '@src/utils';
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

const VaultsTable = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const { isLoading, data: vaults } = useVaults(walletAddress);

  const vaultsTableData: Array<TableData> = useMemo(() => {
    return (
      vaults?.map((vault) => {
        return {
          startTimestamp: vault.startTimestamp,
          endTimestamp: vault.endTimestamp,
          daysRemaining: dayjs(vault.endTimestamp).diff(dayjs(), 'days'),
          balance: new mARIOToken(vault.balance).toARIO().valueOf(),
          controller: vault.address,
        };
      }) ?? []
    );
  }, [vaults]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('startTimestamp', {
        id: 'startTimeStamp',
        header: 'Start Time Stamp',
        sortDescFirst: false,
      }),

      columnHelper.accessor('endTimestamp', {
        id: 'endTimestamp',
        header: 'End Time Stamp',
        sortDescFirst: false,
      }),
      columnHelper.accessor('endTimestamp', {
        id: 'unlockDate',
        header: 'Unlock Date',
        sortDescFirst: false,
        cell: ({ row }) => formatDate(new Date(row.original.endTimestamp)),
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
