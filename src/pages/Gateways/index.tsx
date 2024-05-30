import { mIOToken } from '@ar.io/sdk/web';
import Header from '@src/components/Header';
import { SortAsc, SortDesc } from '@src/components/icons';
import useGateways from '@src/hooks/useGateways';
import {
  SortingState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from './Banner';
import { formatWithCommas } from '@src/utils';

interface TableData {
  label: string;
  domain: string;
  owner: string;
  start: number;
  totalStake: number; // IO
  status: string;
  rewardRatio: number;
  failedConsecutiveEpochs: number;
}

const columnHelper = createColumnHelper<TableData>();

const Gateways = () => {
  const { data: gateways } = useGateways();
  const [tableData, setTableData] = useState<Array<TableData>>([]);

  const navigate = useNavigate();

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'totalStake',
      desc: true,
    },
  ]);

  useEffect(() => {
    const tableData: Array<TableData> = !gateways
      ? ([] as Array<TableData>)
      : Object.entries(gateways).reduce((acc, [owner, gateway]) => {
        console.log(gateway)
          return [
            ...acc,
            {
              label: gateway.settings.label,
              domain: gateway.settings.fqdn,
              owner: owner,
              start: gateway.start,
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
        }, [] as Array<TableData>);
    setTableData(tableData);
  }, [gateways]);

  // Define columns for the table
  const columns = [
    columnHelper.accessor('label', {
      id: 'label',
      header: 'Label',
      sortDescFirst: false,
    }),
    columnHelper.accessor('domain', {
      id: 'domain',
      header: 'Domain',
      sortDescFirst: false,
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: 'Address',
      sortDescFirst: false,
    }),
    columnHelper.accessor('start', {
      id: 'start',
      header: 'Start',
      sortDescFirst: true,
    }),
    columnHelper.accessor('totalStake', {
      id: 'totalStake',
      header: 'Total Stake',
      sortDescFirst: true,
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      sortDescFirst: false,
    }),
    columnHelper.accessor('rewardRatio', {
      id: 'rewardRatio',
      header: 'Reward Ratio',
      sortDescFirst: false,
    }),
    columnHelper.accessor('failedConsecutiveEpochs', {
      id: 'failedConsecutiveEpochs',
      header: 'Offline Epochs',
      sortDescFirst: true,
    }),
  ];

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel<TableData>(),
    getSortedRowModel: getSortedRowModel(), //provide a sorting row model
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="h-screen overflow-y-scroll">
      <Header />
      <Banner />
      <div className="mt-2 flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
        <div className="grow text-sm text-mid">Gateways</div>
      </div>
      {tableData && (
        <table className="mb-[32px] w-full border-x border-b border-grey-500">
          <thead className="text-xs text-low">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortState = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="py-[7.5px] pl-[24px]">
                      <button
                        className="flex items-center gap-1 text-left"
                        onClick={() => {
                          setSorting([
                            {
                              id: header.column.id,
                              desc: sortState
                                ? sortState === 'desc'
                                  ? false
                                  : true
                                : header.column.columnDef.sortDescFirst ?? true,
                            },
                          ]);
                        }}
                      >
                        {header.column.columnDef.header?.toString()}
                        {sortState ? (
                          sortState === 'desc' ? (
                            <SortDesc />
                          ) : (
                            <SortAsc />
                          )
                        ) : undefined}
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="text-sm">
            {table.getRowModel().rows.map((row) => {
              const stake = `${formatWithCommas(row.getValue('totalStake'))} IO`;
              const owner = row.renderValue('owner') as string;

              return (
                <tr
                  key={row.id}
                  className="cursor-pointer border-t border-grey-500 text-low *:py-[16px] *:pl-[24px]"
                  onClick={() => {
                    navigate(`/gateways/${owner}`);
                  }}
                >
                  <td>{row.getValue('label')}</td>
                  <td>
                    <div className="text-gradient">
                      <a
                        href={`https://${row.getValue('domain')}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {row.getValue('domain')}
                      </a>{' '}
                    </div>
                  </td>
                  <td className="text-mid">
                    <a
                      href={`https://viewblock.io/arweave/address/${owner}`}
                      target="_blank"
                      rel="noreferrer"
                      // onClick={(e) => {
                      //   // e.preventDefault();
                      // }}
                    >
                      {owner}
                    </a>
                  </td>
                  <td>{row.renderValue('start')}</td>
                  <td>{stake}</td>
                  <td>{row.renderValue('status')}</td>
                  <td>{row.renderValue('rewardRatio')}%</td>
                  <td>{row.renderValue('failedConsecutiveEpochs')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Gateways;
