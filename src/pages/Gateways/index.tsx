import { mIOToken } from '@ar.io/sdk/web';
import Header from '@src/components/Header';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import useGateways from '@src/hooks/useGateways';
import { formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from './Banner';
import { IO_LABEL } from '@src/constants';

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
  failedConsecutiveEpochs: number;
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
            rewardRatio: gateway.settings.delegateRewardShareRatio,
            failedConsecutiveEpochs: gateway.stats.failedConsecutiveEpochs,
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
      cell: ({ row }) => (
        <div className="text-mid">
          <a
            href={`https://viewblock.io/arweave/address/${row.getValue('owner')}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {row.getValue('owner')}
          </a>
        </div>
      ),
    }),
    columnHelper.accessor('start', {
      id: 'start',
      header: 'Start',
      sortDescFirst: true,
      cell: ({ row }) => row.original.start.toLocaleString(),
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
      cell: ({ row }) => `${row.original.rewardRatio}%`,
    }),
    columnHelper.accessor('failedConsecutiveEpochs', {
      id: 'failedConsecutiveEpochs',
      header: 'Offline Epochs',
      sortDescFirst: true,
    }),
  ];

  return (
    <div className="flex h-screen flex-col gap-[24px] overflow-scroll">
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
