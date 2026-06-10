import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import ColumnSelector from '@src/components/ColumnSelector';
import Placeholder from '@src/components/Placeholder';
import ServerSortableTableView from '@src/components/ServerSortableTableView';
import { CaretDoubleRightIcon, CaretRightIcon } from '@src/components/icons';
import useAllBalances from '@src/hooks/useAllBalances';
import useAllDelegates from '@src/hooks/useAllDelegates';
import useAllGateways from '@src/hooks/useAllGateways';
import useAllVaults from '@src/hooks/useAllVaults';
import usePrefetchBalances from '@src/hooks/usePrefetchBalances';
import { useGlobalState, useSettings } from '@src/store';
import { formatPercentage, formatWithCommas } from '@src/utils';
import { isSolanaAddress } from '@src/utils/solanaAddress';
import {
  ColumnDef,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TableData {
  rank: number;
  address: string;
  liquidBalance: number;
  vaultCount: number;
  vaultBalance: number;
  operatorStake: number;
  delegatedStake: number;
  totalBalance: number;
  percentageOfSupply: number;
  isProtocol: boolean;
}

const columnHelper = createColumnHelper<TableData>();
const ITEMS_PER_PAGE = 10;

const BalancesTable = () => {
  const ticker = useGlobalState((state) => state.ticker);
  const bridgeBalanceAddress = useSettings(
    (state) => state.bridgeBalanceAddress,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'liquidBalance', desc: true },
  ]);
  const navigate = useNavigate();

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
  const { data: allGateways } = useAllGateways();
  const { data: allDelegates } = useAllDelegates();
  const { prefetchNextSort } = usePrefetchBalances();
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isProcessingData, setIsProcessingData] = useState(true);

  useEffect(() => {
    if (!allBalances) {
      return;
    }

    const toArio = (mario: number) => new mARIOToken(mario).toARIO().valueOf();

    // Per-bucket maps, all in ARIO, keyed by wallet address. getBalances()
    // only returns token accounts with amount > 0, so a wallet holding ARIO
    // entirely in vaults / operator stake / delegations never appears in
    // `allBalances` and would otherwise be invisible / unsearchable here.
    const liquidByAddress = new Map<string, number>();
    for (const balance of allBalances) {
      if (balance.address === bridgeBalanceAddress) continue;
      liquidByAddress.set(balance.address, balance.arioBalance);
    }

    const stakeByAddress = new Map<string, number>();
    if (allGateways) {
      for (const gateway of allGateways) {
        if (gateway.gatewayAddress === bridgeBalanceAddress) continue;
        const stake = toArio(gateway.operatorStake);
        if (stake > 0) stakeByAddress.set(gateway.gatewayAddress, stake);
      }
    }

    const delegatedByAddress = new Map<string, number>();
    if (allDelegates) {
      for (const delegate of allDelegates) {
        if (
          delegate.address === bridgeBalanceAddress ||
          delegate.delegatedStake <= 0
        ) {
          continue;
        }
        delegatedByAddress.set(
          delegate.address,
          (delegatedByAddress.get(delegate.address) ?? 0) +
            toArio(delegate.delegatedStake),
        );
      }
    }

    // Union of every wallet holding ARIO in ANY custody type.
    const addresses = new Set<string>([
      ...liquidByAddress.keys(),
      ...(vaultsByAddress?.keys() ?? []),
      ...stakeByAddress.keys(),
      ...delegatedByAddress.keys(),
    ]);

    const rows: TableData[] = [];
    for (const address of addresses) {
      const liquidBalance = liquidByAddress.get(address) ?? 0;
      const vaultData = vaultsByAddress?.get(address);
      const vaultBalance = vaultData?.totalVaultBalance ?? 0;
      const operatorStake = stakeByAddress.get(address) ?? 0;
      const delegatedStake = delegatedByAddress.get(address) ?? 0;
      const totalBalance =
        liquidBalance + vaultBalance + operatorStake + delegatedStake;
      rows.push({
        rank: 0,
        address,
        liquidBalance,
        vaultCount: vaultData?.vaultCount ?? 0,
        vaultBalance,
        operatorStake,
        delegatedStake,
        totalBalance,
        percentageOfSupply: totalBalance / 1_000_000_000,
        isProtocol: false,
      });
    }

    // Sort on the active column (mirroring useAllBalances), then assign ranks.
    rows.sort((a, b) => {
      if (sortColumn === 'address') {
        const comparison = a.address.localeCompare(b.address);
        return sortDesc ? -comparison : comparison;
      }
      const comparison = a.liquidBalance - b.liquidBalance;
      return sortDesc ? -comparison : comparison;
    });
    rows.forEach((row, index) => {
      row.rank = index + 1;
    });

    setTableData(rows);
    setIsProcessingData(false);
  }, [
    allBalances,
    bridgeBalanceAddress,
    vaultsByAddress,
    allGateways,
    allDelegates,
    sortColumn,
    sortDesc,
  ]);

  // Prefetch other sort combinations when data loads
  useEffect(() => {
    if (allBalances?.length) {
      prefetchNextSort(apiSortBy, apiSortOrder);
    }
  }, [allBalances?.length, apiSortBy, apiSortOrder, prefetchNextSort]);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return tableData;
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return tableData.filter((item) =>
      item.address.toLowerCase().includes(lowerSearch),
    );
  }, [tableData, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

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
      columnHelper.accessor('operatorStake', {
        id: 'operatorStake',
        header: `Staked ${ticker}`,
        enableSorting: false,
        cell: ({ row }) => {
          const stake = row.getValue('operatorStake') as number;
          return stake > 0 ? formatWithCommas(stake) : '-';
        },
      }),
      columnHelper.accessor('delegatedStake', {
        id: 'delegatedStake',
        header: `Delegated ${ticker}`,
        enableSorting: false,
        cell: ({ row }) => {
          const delegated = row.getValue('delegatedStake') as number;
          return delegated > 0 ? formatWithCommas(delegated) : '-';
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
      <div className="flex w-full items-center overflow-x-auto justify-between rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-[0.8125rem]">
        <div className="flex items-center gap-4">
          <div className="text-sm text-mid">
            All Token Holders{' '}
            {!isLoading &&
              `(${formatWithCommas(filteredData.length)}${debouncedSearchTerm ? ` of ${formatWithCommas(tableData.length)}` : ''})`}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-low" />
            <input
              type="text"
              placeholder="Search address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                const term = searchTerm.trim();
                if (e.key === 'Enter' && isSolanaAddress(term)) {
                  navigate(`/balances/${term}`);
                }
              }}
              className="w-[400px] rounded-md border border-grey-700 bg-grey-1000 py-1.5 pl-9 pr-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high"
            />
          </div>
          {isSolanaAddress(debouncedSearchTerm) && (
            <button
              onClick={() => navigate(`/balances/${debouncedSearchTerm}`)}
              className="whitespace-nowrap text-sm text-primary hover:underline"
            >
              View this address →
            </button>
          )}
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
