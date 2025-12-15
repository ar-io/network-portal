import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import ColumnSelector from '@src/components/ColumnSelector';
import CopyButton from '@src/components/CopyButton';
import Header from '@src/components/Header';
import ServerSortableTableView from '@src/components/ServerSortableTableView';
import Streak from '@src/components/Streak';
import Tooltip from '@src/components/Tooltip';
import { CaretDoubleRightIcon, CaretRightIcon } from '@src/components/icons';
import useAllGateways from '@src/hooks/useAllGateways';
import { useGlobalState } from '@src/store';
import { formatDate, formatWithCommas } from '@src/utils';
import {
  ColumnDef,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from './Banner';

interface TableData {
  label: string;
  domain: string;
  owner: string;
  start: Date;
  totalDelegatedStake: number; // IO
  operatorStake: number; // IO
  totalStake: number; // IO
  status: string;
  endTimeStamp: number;
  performance: number;
  passedEpochCount: number;
  totalEpochCount: number;
  streak: number;
}

const columnHelper = createColumnHelper<TableData>();
const ITEMS_PER_PAGE = 25;

const Gateways = () => {
  const ticker = useGlobalState((state) => state.ticker);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalStake', desc: true },
  ]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Map table columns to API sort fields
  const sortMapping: Record<string, string> = {
    label: 'settings.label',
    domain: 'settings.fqdn',
    owner: 'gatewayAddress',
    start: 'startTimestamp',
    totalStake: 'totalDelegatedStake',
    status: 'status',
    performance: 'stats.passedEpochCount',
    streak: 'stats.passedConsecutiveEpochs',
  };

  const sortColumn = sorting[0]?.id;
  const sortDesc = sorting[0]?.desc;
  const apiSortBy =
    (sortColumn && sortMapping[sortColumn]) || 'totalDelegatedStake';
  const apiSortOrder = sortDesc ? 'desc' : 'asc';

  const {
    isLoading,
    isFetching,
    isError,
    data: allGateways,
  } = useAllGateways({
    sortBy: apiSortBy,
    sortOrder: apiSortOrder,
  });

  const [tableData, setTableData] = useState<Array<TableData>>([]);

  useEffect(() => {
    if (!allGateways) {
      setTableData([]);
      return;
    }

    const processedData: Array<TableData> = allGateways.map((gateway) => {
      const passedEpochCount = gateway.stats.passedEpochCount;
      const totalEpochCount = gateway.stats.totalEpochCount;

      // Pre-calculate token conversions
      const totalDelegatedStakeARIO = new mARIOToken(
        gateway.totalDelegatedStake,
      )
        .toARIO()
        .valueOf();
      const operatorStakeARIO = new mARIOToken(gateway.operatorStake)
        .toARIO()
        .valueOf();

      return {
        label: gateway.settings.label,
        domain: gateway.settings.fqdn,
        owner: gateway.gatewayAddress,
        start: new Date(gateway.startTimestamp),
        totalDelegatedStake: totalDelegatedStakeARIO,
        operatorStake: operatorStakeARIO,
        totalStake: totalDelegatedStakeARIO + operatorStakeARIO,
        status: gateway.status,
        endTimeStamp: gateway.endTimestamp,
        performance:
          totalEpochCount > 0 ? passedEpochCount / totalEpochCount : -1,
        passedEpochCount,
        totalEpochCount,
        streak:
          gateway.status === 'leaving'
            ? Number.NEGATIVE_INFINITY
            : gateway.stats.failedConsecutiveEpochs > 0
              ? -gateway.stats.failedConsecutiveEpochs
              : gateway.stats.passedConsecutiveEpochs,
      };
    });
    setTableData(processedData);
  }, [allGateways]);

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return tableData;
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return tableData.filter((item) =>
      item.domain.toLowerCase().includes(lowerSearch),
    );
  }, [tableData, debouncedSearchTerm]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setCurrentPage(1);
  };

  // Define columns for the table
  const columns = useMemo<ColumnDef<TableData, any>[]>(
    () => [
      columnHelper.accessor('label', {
        id: 'label',
        header: 'Label',
        sortDescFirst: false,
        cell: ({ row }) => row.getValue('label'),
      }),
      columnHelper.accessor('domain', {
        id: 'domain',
        header: 'Domain',
        sortDescFirst: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <a
              href={`https://${row.getValue('domain')}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-gradient"
            >
              {row.getValue('domain')}
            </a>
            <CopyButton textToCopy={row.getValue('domain')} />
          </div>
        ),
      }),
      columnHelper.accessor('owner', {
        id: 'owner',
        header: 'Address',
        sortDescFirst: false,
        cell: ({ row }) => <AddressCell address={row.getValue('owner')} />,
      }),
      columnHelper.accessor('start', {
        id: 'start',
        header: 'Join Date',
        sortDescFirst: true,
        cell: ({ row }) => formatDate(row.original.start),
      }),
      columnHelper.accessor('totalStake', {
        id: 'totalStake',
        header: `Total Stake (${ticker})`,
        sortDescFirst: true,
        cell: ({ row }) => (
          <Tooltip
            message={
              <div>
                <div>
                  Operator Stake: {formatWithCommas(row.original.operatorStake)}{' '}
                  {ticker}
                </div>
                <div className="mt-1">
                  Delegated Stake:{' '}
                  {formatWithCommas(row.original.totalDelegatedStake)} {ticker}
                </div>
              </div>
            }
          >
            {formatWithCommas(row.getValue('totalStake'))}
          </Tooltip>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        sortDescFirst: false,
        cell: ({ row }) =>
          row.original.status === 'leaving' ? (
            <Tooltip
              message={
                <div>
                  <div>
                    Final Withdrawal:{' '}
                    {formatDate(new Date(row.original.endTimeStamp))}
                  </div>
                </div>
              }
            >
              <div className="text-red-500">leaving</div>
            </Tooltip>
          ) : (
            row.original.status
          ),
      }),
      columnHelper.accessor('performance', {
        id: 'performance',
        header: 'Performance',
        sortDescFirst: true,
        cell: ({ row }) =>
          row.original.performance < 0 ? (
            'N/A'
          ) : (
            <Tooltip
              message={
                <div>
                  <div>Passed Epochs: {row.original.passedEpochCount}</div>
                  <div>Total Epochs: {row.original.totalEpochCount}</div>
                </div>
              }
            >
              {`${(row.original.performance * 100).toFixed(2)}%`}
            </Tooltip>
          ),
      }),
      columnHelper.accessor('streak', {
        id: 'streak',
        header: 'Streak',
        sortDescFirst: true,
        cell: ({ row }) => (
          <div className="pr-6">
            <Streak streak={row.original.streak} />
          </div>
        ),
      }),
    ],
    [ticker],
  );

  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-6 flex shrink-0 flex-col gap-6">
        <Header />
        <Banner />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar scrollbar-thin">
          <div className="pt-0">
            <div className="mb-8">
              <div className="flex w-full items-center justify-between rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-[0.8125rem]">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-mid">
                    Gateways{' '}
                    {!isLoading &&
                      `(${formatWithCommas(filteredData.length)}${debouncedSearchTerm ? ` of ${formatWithCommas(tableData.length)}` : ''})`}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-low" />
                    <input
                      type="text"
                      placeholder="Search domain..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-[400px] rounded-md border border-grey-700 bg-grey-1000 py-1.5 pl-9 pr-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high"
                    />
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
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
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
                  <ColumnSelector tableId="gateways" columns={columns} />
                </div>
              </div>
              <ServerSortableTableView
                columns={columns}
                data={paginatedData}
                defaultSortingState={{ id: 'totalStake', desc: true }}
                currentSorting={sorting}
                onSortingChange={handleSortingChange}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                noDataFoundText="No gateways found."
                errorText="Unable to load gateways."
                loadingRows={ITEMS_PER_PAGE}
                onRowClick={(row) => {
                  navigate(`/gateways/${row.owner}`);
                }}
                tableId="gateways"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gateways;
