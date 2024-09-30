import { mIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Header from '@src/components/Header';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import { StreakDownArrowIcon, StreakUpArrowIcon } from '@src/components/icons';
import useGateways from '@src/hooks/useGateways';
import { formatDate, formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from './Banner';
import { useGlobalState } from '@src/store';

interface TableData {
  label: string;
  domain: string;
  owner: string;
  start: Date;
  totalDelegatedStake: number; // IO
  operatorStake: number; // IO
  totalStake: number; // IO
  status: string;
  performance: number;
  passedEpochCount: number;
  totalEpochCount: number;
  streak: number;
}

const columnHelper = createColumnHelper<TableData>();

const Gateways = () => {

  const ticker = useGlobalState((state) => state.ticker);

  const { isLoading, data: gateways } = useGateways();
  const [tableData, setTableData] = useState<Array<TableData>>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const tableData: Array<TableData> = Object.entries(gateways ?? {}).reduce(
      (acc: Array<TableData>, [owner, gateway]) => {

        const passedEpochCount = gateway.stats.passedEpochCount;
        const totalEpochCount = (gateway.stats as any).totalEpochCount;

        return [
          ...acc,
          {
            label: gateway.settings.label,
            domain: gateway.settings.fqdn,
            owner: owner,
            start: new Date(gateway.startTimestamp),
            totalDelegatedStake: new mIOToken(gateway.totalDelegatedStake)
              .toIO()
              .valueOf(),
            operatorStake: new mIOToken(gateway.operatorStake).toIO().valueOf(),
            totalStake: new mIOToken(
              gateway.totalDelegatedStake + gateway.operatorStake,
            )
              .toIO()
              .valueOf(),
            status: gateway.status,
            performance:
              totalEpochCount > 0
                ? passedEpochCount / totalEpochCount
                : -1,
            passedEpochCount,
            totalEpochCount,
            streak:
            gateway.status == "leaving" ? 
            Number.NEGATIVE_INFINITY :
              gateway.stats.failedConsecutiveEpochs > 0
                ? -gateway.stats.failedConsecutiveEpochs
                : gateway.stats.passedConsecutiveEpochs,
          },
        ];
      },
      [],
    );
    setTableData(tableData);
  }, [gateways]);

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
            onClick={(e) => {
              e.stopPropagation();
            }}
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
                <div>
                  Passed Epoch Count: {row.original.passedEpochCount}
                </div>
                <div className="mt-1">
                  Total Epoch Participation Count: {row.original.totalEpochCount}
                </div>
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
      cell: ({ row }) => {
        const streak = row.original.streak;
        if (streak === 0) {
          return '';
        }

        if (streak === Number.NEGATIVE_INFINITY) {
          return 'N/A';
        }

        const colorClasses =
          streak > 0
            ? 'border-streak-up/[.56] bg-streak-up/[.1] text-streak-up'
            : 'border-text-red/[.56] bg-text-red/[.1] text-text-red';
        const icon =
          streak > 0 ? <StreakUpArrowIcon className='size-3'/> : <StreakDownArrowIcon className='size-3'/>;

        return (
          <div
            className={`flex w-fit items-center gap-1 rounded-xl border py-0.5 pl-[.4375rem] pr-[.5625rem] ${colorClasses}`}
          >
            {icon} {Math.abs(streak)}
          </div>
        );
      },
    }),
  ];

  return (
    <div className="flex h-screen max-w-full flex-col gap-6 overflow-auto pr-6 scrollbar">
      <Header />
      <Banner />
      <div className="mb-8">
        <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[0.9375rem] pl-6 pr-[0.8125rem]">
          <div className="grow text-sm text-mid">Gateways</div>
        </div>
        <TableView
          columns={columns}
          data={tableData}
          defaultSortingState={{ id: 'totalStake', desc: true }}
          isLoading={isLoading}
          noDataFoundText="Unable to fetch gateways."
          onRowClick={(row) => {
            navigate(`/gateways/${row.owner}`);
          }}
        />
      </div>
    </div>
  );
};

export default Gateways;
