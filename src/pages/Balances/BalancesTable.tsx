import AddressCell from '@src/components/AddressCell';
import ColumnSelector from '@src/components/ColumnSelector';
import Placeholder from '@src/components/Placeholder';
import ServerSortableTableView from '@src/components/ServerSortableTableView';
import { CaretDoubleRightIcon, CaretRightIcon } from '@src/components/icons';
import { ARIO_PROCESS_ID, BRIDGE_BALANCE_ADDRESS } from '@src/constants';
import useAllBalances from '@src/hooks/useAllBalances';
import useAllVaults from '@src/hooks/useAllVaults';
import usePrefetchBalances from '@src/hooks/usePrefetchBalances';
import { useGlobalState } from '@src/store';
import { formatPercentage, formatWithCommas } from '@src/utils';
import {
  ColumnDef,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TableData {
  rank: number;
  address: string;
  liquidBalance: number;
  vaultCount: number;
  vaultBalance: number;
  totalBalance: number;
  percentageOfSupply: number;
  isProtocol: boolean;
}

const columnHelper = createColumnHelper<TableData>();
const ITEMS_PER_PAGE = 10;

const BalancesTable = () => {
  const ticker = useGlobalState((state) => state.ticker);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'liquidBalance', desc: true },
  ]);
  const arioProcessId = useGlobalState(
    (state) => state.arIOReadSDK.process.processId,
  );
  const navigate = useNavigate();

  // Determine API sort parameters based on current sorting state
  const sortColumn = sorting[0]?.id;
  const sortDesc = sorting[0]?.desc;

  // Map table columns to API sort fields
  const apiSortByMap = {
    address: 'address',
    liquidBalance: 'balance',
  } as const;
  const apiSortBy =
    (sortColumn && apiSortByMap[sortColumn as keyof typeof apiSortByMap]) ||
    'balance';
  const apiSortOrder = sortDesc ? 'desc' : 'asc';

  const {
    data: allBalances,
    isLoading: balancesLoading,
    isFetching: balancesFetching,
  } = useAllBalances({
    sortBy: apiSortBy,
    sortOrder: apiSortOrder,
  });
  const { data: vaultsByAddress, isLoading: vaultsLoading } = useAllVaults();
  const { prefetchNextSort } = usePrefetchBalances();
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isProcessingData, setIsProcessingData] = useState(true);

  useEffect(() => {
    if (!allBalances) {
      return;
    }

    const enrichedData: TableData[] = allBalances
      .filter(
        (balance) =>
          balance.address !== arioProcessId.toString() &&
          balance.address !== BRIDGE_BALANCE_ADDRESS,
      )
      .map((balance, index) => {
        const vaultData = vaultsByAddress?.get(balance.address) || {
          vaultCount: 0,
          totalVaultBalance: 0,
        };

        const totalBalance = balance.arioBalance + vaultData.totalVaultBalance;

        return {
          rank: index + 1,
          address: balance.address,
          liquidBalance: balance.arioBalance,
          vaultCount: vaultData.vaultCount,
          vaultBalance: vaultData.totalVaultBalance,
          totalBalance: totalBalance,
          percentageOfSupply: totalBalance / 1_000_000_000,
          isProtocol: false,
        };
      })
      .map((item, index) => ({ ...item, rank: index + 1 }));

    setTableData(enrichedData);
    setIsProcessingData(false);
  }, [allBalances, vaultsByAddress, arioProcessId]);

  // Prefetch other sort combinations when data loads
  useEffect(() => {
    if (allBalances?.length) {
      prefetchNextSort(apiSortBy, apiSortOrder);
    }
  }, [allBalances?.length, apiSortBy, apiSortOrder, prefetchNextSort]);

  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return tableData.slice(startIndex, endIndex);
  }, [tableData, currentPage]);

  const columns = useMemo<ColumnDef<TableData, any>[]>(
    () => [
      columnHelper.accessor('rank', {
        id: 'rank',
        header: 'Rank',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-mid">#{row.getValue('rank')}</span>
        ),
      }),
      columnHelper.accessor('address', {
        id: 'address',
        header: 'Address',
        sortDescFirst: false,
        cell: ({ row }) => <AddressCell address={row.getValue('address')} />,
      }),
      columnHelper.accessor('liquidBalance', {
        id: 'liquidBalance',
        header: `Liquid ${ticker}`,
        sortDescFirst: true,
        cell: ({ row }) => formatWithCommas(row.getValue('liquidBalance')),
      }),
      columnHelper.accessor('vaultCount', {
        id: 'vaultCount',
        header: 'Vaults',
        enableSorting: false,
        cell: ({ row }) => {
          if (vaultsLoading) {
            return <Placeholder className="h-4 w-8" />;
          }
          const count = row.getValue('vaultCount') as number;
          return count > 0 ? formatWithCommas(count) : '-';
        },
      }),
      columnHelper.accessor('vaultBalance', {
        id: 'vaultBalance',
        header: `Total Vaulted ${ticker}`,
        enableSorting: false,
        cell: ({ row }) => {
          if (vaultsLoading) {
            return <Placeholder className="h-4 w-12" />;
          }
          const balance = row.getValue('vaultBalance') as number;
          return balance > 0 ? formatWithCommas(balance) : '-';
        },
      }),
      columnHelper.accessor('totalBalance', {
        id: 'totalBalance',
        header: `Total ${ticker}`,
        enableSorting: false,
        cell: ({ row }) => {
          if (vaultsLoading) {
            return <Placeholder className="h-4 w-16" />;
          }
          return (
            <span className="font-semibold text-primary">
              {formatWithCommas(row.getValue('totalBalance'))}
            </span>
          );
        },
      }),
      columnHelper.accessor('percentageOfSupply', {
        id: 'percentageOfSupply',
        header: '% of Supply',
        enableSorting: false,
        cell: ({ row }) => {
          if (vaultsLoading) {
            return (
              <div className="flex items-center gap-2">
                <Placeholder className="h-2 w-20 rounded-full" />
                <Placeholder className="h-3 w-8" />
              </div>
            );
          }
          const percentage = row.getValue('percentageOfSupply') as number;
          const percentValue = percentage * 100;
          const isLessThanOne = percentValue < 1;

          return (
            <div className="flex items-center gap-2">
              <div className="relative h-2 w-20 rounded-full border border-grey-600 bg-containerL2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E19EE5] to-[#A19EE5] transition-all duration-300 ease-out"
                  style={{
                    width: isLessThanOne
                      ? '0%'
                      : `${Math.min(percentValue, 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-mid min-w-fit">
                {formatPercentage(percentage)}
              </span>
            </div>
          );
        },
      }),
    ],
    [ticker, vaultsLoading],
  );

  const isLoading = balancesLoading || isProcessingData;

  // Handle sorting changes
  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  return (
    <div className="mb-8">
      <div className="flex w-full items-center justify-between rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-[0.8125rem]">
        <div className="flex items-center gap-4">
          <div className="text-sm text-mid">
            All Token Holders{' '}
            {!isLoading && `(${formatWithCommas(tableData.length)})`}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
                aria-label="First page"
              >
                <CaretDoubleRightIcon className="h-4 w-4 rotate-180" />
              </button>

              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
                aria-label="Previous page"
              >
                <CaretRightIcon className="h-4 w-4 rotate-180" />
              </button>

              <span className="text-xs text-mid">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
                aria-label="Next page"
              >
                <CaretRightIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
                aria-label="Last page"
              >
                <CaretDoubleRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          <ColumnSelector tableId="balances" columns={columns} />
        </div>
      </div>
      <ServerSortableTableView
        columns={columns}
        data={paginatedData}
        defaultSortingState={{ id: 'liquidBalance', desc: true }}
        currentSorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={isLoading}
        isFetching={balancesFetching}
        isError={false}
        noDataFoundText="No balances found."
        errorText="Unable to load balances."
        loadingRows={ITEMS_PER_PAGE}
        onRowClick={(row: TableData) => {
          navigate(`/balances/${row.address}`);
        }}
        tableId="balances"
      />
    </div>
  );
};

export default BalancesTable;
