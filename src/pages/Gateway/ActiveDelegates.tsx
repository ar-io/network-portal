import { AoGatewayWithAddress, mIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Placeholder from '@src/components/Placeholder';
import TableView from '@src/components/TableView';
import useGatewayDelegateStakes from '@src/hooks/useGatewayDelegates';
import { useGlobalState } from '@src/store';
import { formatPercentage, formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import CollapsiblePanel from './CollapsiblePanel';

interface TableData {
  walletAddress: string;
  primaryName?: string;
  totalStake: number;
  percentageOfTotalStake: number;
}

const columnHelper = createColumnHelper<TableData>();

const ActiveDelegates = ({ gateway }: { gateway?: AoGatewayWithAddress }) => {
  const ticker = useGlobalState((state) => state.ticker);
  const { isLoading, data: gatewayDelegateStakes } = useGatewayDelegateStakes(
    gateway?.gatewayAddress,
  );

  const [tableData, setTableData] = useState<Array<TableData>>([]);

  useEffect(() => {
    if (gateway && gatewayDelegateStakes) {
      const totalDelegatedStake = gateway.totalDelegatedStake;
      const data = gatewayDelegateStakes.map((stake) => {
        const totalStake = new mIOToken(stake.delegatedStake).toIO().valueOf();
        const percentageOfTotalStake =
          totalDelegatedStake > 0
            ? stake.delegatedStake / totalDelegatedStake
            : 0;
        return {
          walletAddress: stake.address,
          totalStake,
          percentageOfTotalStake,
        };
      });
      setTableData(data);
    }
  }, [gatewayDelegateStakes, gateway]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    columnHelper.accessor('walletAddress', {
      id: 'walletAddress',
      header: 'Wallet Address',
      sortDescFirst: false,
      cell: ({ row }) => <AddressCell address={row.original.walletAddress} />,
    }),
    columnHelper.accessor('totalStake', {
      id: 'totalStake',
      header: 'Total Stake',
      sortDescFirst: false,
      cell: ({ row }) =>
        `${formatWithCommas(row.original.totalStake)} ${ticker}`,
    }),
    columnHelper.accessor('percentageOfTotalStake', {
      id: 'percentageOfTotalStake',
      header: 'Percentage of Total Delegated Stake',
      sortDescFirst: false,
      cell: ({ row }) => formatPercentage(row.original.percentageOfTotalStake),
    }),
  ];

  return (
    <CollapsiblePanel
      title={
        <div className="flex items-center gap-2">
          Active Delegates{' '}
          {gatewayDelegateStakes && `(${gatewayDelegateStakes.length})`}
          {!gatewayDelegateStakes && <Placeholder />}
        </div>
      }
      titleRight={
        <div className="flex items-center gap-2">
          <div className="text-high">Total Delegated Stake:</div>
          <div className="text-gradient">
            {gateway ? (
              <div>
                {formatWithCommas(
                  new mIOToken(gateway.totalDelegatedStake).toIO().valueOf(),
                )}{' '}
                {ticker}
              </div>
            ) : (
              <Placeholder />
            )}
          </div>
        </div>
      }
    >
      {gatewayDelegateStakes && gatewayDelegateStakes.length > 0 && (
        <TableView
          columns={columns}
          data={tableData}
          defaultSortingState={{ id: 'totalStake', desc: true }}
          isLoading={isLoading}
          noDataFoundText="Unable to fetch gateways."
          shortTable={true}
        />
      )}
    </CollapsiblePanel>
  );
};

export default ActiveDelegates;
