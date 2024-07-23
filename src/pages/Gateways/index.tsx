import { mIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Header from '@src/components/Header';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import { StreakDownArrowIcon, StreakUpArrowIcon } from '@src/components/icons';
import { IO_LABEL } from '@src/constants';
import useGateways from '@src/hooks/useGateways';
import { formatDate, formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
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
  rewardRatio: number;
  streak: number;
}

const columnHelper = createColumnHelper<TableData>();

const Gateways = () => {
  const { isLoading, data: gateways } = useGateways();
  const [tableData, setTableData] = useState<Array<TableData>>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const tableData: Array<TableData> = Object.entries(gateways ?? {}).reduce(
      (acc: Array<TableData>, [owner, gateway]) => {
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
            rewardRatio: gateway.settings.allowDelegatedStaking
              ? gateway.settings.delegateRewardShareRatio
              : -1,
            streak:
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
      header: 'Start',
      sortDescFirst: true,
      cell: ({ row }) => formatDate(row.original.start),
    }),
    columnHelper.accessor('totalStake', {
      id: 'totalStake',
      header: 'Total Stake',
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
                Total Delegated Stake:{' '}
                {formatWithCommas(row.original.totalDelegatedStake)} {IO_LABEL}
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
    columnHelper.accessor('rewardRatio', {
      id: 'rewardRatio',
      header: 'Reward Share Ratio',
      sortDescFirst: true,
      cell: ({ row }) =>
        row.original.rewardRatio >= 0 ? `${row.original.rewardRatio}%` : 'N/A',
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

        const colorClasses =
          streak > 0
            ? 'border-streak-up/[.56] bg-streak-up/[.1] text-streak-up'
            : 'border-text-red/[.56] bg-text-red/[.1] text-text-red';
        const icon =
          streak > 0 ? <StreakUpArrowIcon /> : <StreakDownArrowIcon />;

        return (
          <div
            className={`flex w-fit items-center gap-[4px] rounded-xl border py-[2px] pl-[7px] pr-[9px] ${colorClasses}`}
          >
            {icon} {Math.abs(streak)}
          </div>
        );
      },
    }),
  ];

  return (
    <div className="flex h-screen max-w-full flex-col gap-[24px] overflow-auto pr-[24px] scrollbar">
      <Header />
      <Banner />
      <div className="mb-[32px]">
        <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
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
