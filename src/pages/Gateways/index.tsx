import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import CopyButton from '@src/components/CopyButton';
import Header from '@src/components/Header';
import Streak from '@src/components/Streak';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import useGateways from '@src/hooks/useGateways';
import { useGlobalState } from '@src/store';
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
  endTimeStamp: number;
  performance: number;
  passedEpochCount: number;
  prescribedCount: number;
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
        const totalEpochCount = gateway.stats.totalEpochCount;
        const prescribedCount = gateway.stats.prescribedEpochCount;
        return [
          ...acc,
          {
            label: gateway.settings.label,
            domain: gateway.settings.fqdn,
            owner: owner,
            start: new Date(gateway.startTimestamp),
            totalDelegatedStake: new mARIOToken(gateway.totalDelegatedStake)
              .toARIO()
              .valueOf(),
            operatorStake: new mARIOToken(gateway.operatorStake)
              .toARIO()
              .valueOf(),
            totalStake: new mARIOToken(
              gateway.totalDelegatedStake + gateway.operatorStake,
            )
              .toARIO()
              .valueOf(),
            status: gateway.status,
            endTimeStamp: gateway.endTimestamp,
            performance:
              totalEpochCount > 0 ? passedEpochCount / totalEpochCount : -1,
            prescribedCount,
            passedEpochCount,
            totalEpochCount,
            streak:
              gateway.status == 'leaving'
                ? Number.NEGATIVE_INFINITY
                : gateway.stats.failedConsecutiveEpochs > 0
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
        row.original.status == 'leaving' ? (
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
                <div>Prescribed Epochs: {row.original.prescribedCount}</div>
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
      cell: ({ row }) => <Streak streak={row.original.streak} />,
    }),
  ];

  return (
    <div className="flex max-w-full flex-col gap-6">
      <Header />
      <Banner />
      <div className="mb-8">
        <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 py-[0.9375rem] pl-6 pr-[0.8125rem]">
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
