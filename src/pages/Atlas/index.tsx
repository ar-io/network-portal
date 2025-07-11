import type { CellContext, ColumnDef } from '@tanstack/react-table';

import { mARIOToken } from '@ar.io/sdk/web';
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';

import CopyButton from '@src/components/CopyButton';
import Header from '@src/components/Header';
import TableView from '@src/components/TableView';
import useGateways from '@src/hooks/useGateways';

import PingButton from './PingButton';

interface RowData {
  label: string;
  domain: string;
  operatorStake: number;
  delegatedStake: number;
  totalStake: number;
}

const STAKE_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const formatStake = (stake: number) => {
  return STAKE_FORMAT.format(stake);
}
const renderStake = (ctx: CellContext<RowData, number>) => {
  return <>{ formatStake(ctx.getValue()) }</>;
}

const columnHelper = createColumnHelper<RowData>();

const Atlas = () => {

  const { isLoading, data: gateways } = useGateways();
  const [tableData, setTableData] = useState<Array<RowData>>([]);

  const columns = useMemo<ColumnDef<RowData, any>[]>(
    () => [
      columnHelper.accessor('label', {
        id: 'label',
        header: 'Label',
        sortDescFirst: false,
      }),
      columnHelper.accessor('domain', {
        id: 'domain',
        header: 'Domain',
        sortDescFirst: false,
        cell: (ctx) => (
          <div className="flex items-center gap-2">
            <a
              href={`https://${ctx.getValue()}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-gradient"
            >
              {ctx.getValue()}
            </a>
            <CopyButton textToCopy={ctx.getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor('operatorStake', {
        id: 'operatorStake',
        header: 'Operator Stake',
        sortDescFirst: true,
        cell: renderStake,
      }),
      columnHelper.accessor('delegatedStake', {
        id: 'delegatedStake',
        header: 'Delegated Stake',
        sortDescFirst: true,
        cell: renderStake,
      }),
      columnHelper.accessor('totalStake', {
        id: 'totalStake',
        header: 'Total Stake',
        sortDescFirst: true,
        cell: renderStake,
      }),
      columnHelper.display({
        id: 'latency',
        header: 'Latency',
        cell: (ctx) => <PingButton domain={ctx.row.getValue('domain')} />,
      })
    ],
    []
  );

  useEffect(() => {
    const tableData: Array<RowData> = Object.values(gateways ?? {}).map(
      (gateway) => {
        const totalStake = gateway.operatorStake + gateway.totalDelegatedStake
        return {
          label: gateway.settings.label,
          domain: gateway.settings.fqdn,
          operatorStake: new mARIOToken(gateway.operatorStake)
            .toARIO()
            .valueOf(),
          delegatedStake: new mARIOToken(gateway.totalDelegatedStake)
            .toARIO()
            .valueOf(),
          totalStake: new mARIOToken(totalStake)
            .toARIO()
            .valueOf(),
        }
      }
    );
    setTableData(tableData);
  }, [gateways]);

  return (
    <div className="flex max-w-full flex-col gap-6">
      <Header />
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
        />
      </div>
    </div>
  )
};

export default Atlas;
