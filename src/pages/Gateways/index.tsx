import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import ColumnSelector from '@src/components/ColumnSelector';
import CopyButton from '@src/components/CopyButton';
import Header from '@src/components/Header';
import ServerSortableTableView from '@src/components/ServerSortableTableView';
import Streak from '@src/components/Streak';
import Tooltip from '@src/components/Tooltip';
import { CaretDoubleRightIcon, CaretRightIcon } from '@src/components/icons';
import usePaginatedGateways from '@src/hooks/usePaginatedGateways';
import { useGlobalState } from '@src/store';
import { formatDate, formatWithCommas } from '@src/utils';
import {
  ColumnDef,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
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
  const [sortBy, setSortBy] = useState<
    | 'gatewayAddress'
    | 'settings.label'
    | 'settings.fqdn'
    | 'totalDelegatedStake'
    | 'operatorStake'
    | 'startTimestamp'
    | 'status'
    | 'stats.passedEpochCount'
    | 'stats.passedConsecutiveEpochs'
    | 'settings.delegateRewardShareRatio'
  >('totalDelegatedStake');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const {
    isLoading,
    isFetching,
    isError,
    data: gatewaysData,
  } = usePaginatedGateways({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortBy,
    sortOrder,
  });

  const [tableData, setTableData] = useState<Array<TableData>>([]);

  useEffect(() => {
    if (!gatewaysData?.items) {
      setTableData([]);
      return;
    }

    const tableData: Array<TableData> = gatewaysData.items.map((gateway) => {
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
    setTableData(tableData);
  }, [gatewaysData]);

  const handleSortingChange = (sorting: SortingState) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];

      const newSortBy = sortMapping[id];
      if (newSortBy) {
        setSortBy(newSortBy as any);
        setSortOrder(desc ? 'desc' : 'asc');
        setCurrentPage(1); // Reset to first page when sorting changes
      }
    }
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
                    {gatewaysData?.totalItems
                      ? `(${gatewaysData.totalItems})`
                      : ''}
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
                      Page {currentPage} of {gatewaysData?.totalPages || 1}
                    </span>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!gatewaysData?.hasNextPage}
                      className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
                      aria-label="Next page"
                    >
                      <CaretRightIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPage(gatewaysData?.totalPages || 1)
                      }
                      disabled={currentPage === (gatewaysData?.totalPages || 1)}
                      className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
                      aria-label="Last page"
                    >
                      <CaretDoubleRightIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <ColumnSelector tableId="gateways" columns={columns} />
                </div>
              </div>
              <ServerSortableTableView
                columns={columns}
                data={tableData}
                defaultSortingState={{ id: 'totalStake', desc: true }}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                noDataFoundText="No gateways found."
                errorText="Unable to load gateways."
                loadingRows={ITEMS_PER_PAGE}
                onRowClick={(row) => {
                  navigate(`/gateways/${row.owner}`);
                }}
                onSortingChange={handleSortingChange}
                currentSorting={[
                  {
                    id:
                      Object.keys(sortMapping).find(
                        (key) => sortMapping[key] === sortBy,
                      ) || 'totalStake',
                    desc: sortOrder === 'desc',
                  },
                ]}
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
