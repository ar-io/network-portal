import { AoGatewayWithAddress, mARIOToken } from '@ar.io/sdk/web';
import AddressCellWithName from '@src/components/AddressCellWithName';
import Placeholder from '@src/components/Placeholder';
import TableView from '@src/components/TableView';
import useGatewayDelegateStakes from '@src/hooks/useGatewayDelegates';
import { usePrimaryNames } from '@src/hooks/usePrimaryNames';
import { useGlobalState } from '@src/store';
import { formatPercentage, formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import CollapsiblePanel from './CollapsiblePanel';

interface TableData {
  walletAddress: string;
  primaryName?: string;
  totalStake: number;
  percentageOfTotalStake: number;
}

const columnHelper = createColumnHelper<TableData>();

const ActiveDelegates = ({
  gateway,
}: {
  gateway?: AoGatewayWithAddress | null;
}) => {
  const ticker = useGlobalState((state) => state.ticker);
  const {
    isLoading,
    isError,
    data: gatewayDelegateStakes,
  } = useGatewayDelegateStakes(gateway?.gatewayAddress);

  const [tableData, setTableData] = useState<Array<TableData>>([]);

  // Extract all delegate addresses for batch fetching
  const delegateAddresses = tableData.map((row) => row.walletAddress);
  const primaryNamesMap = usePrimaryNames(delegateAddresses);

  useEffect(() => {
    if (gateway && gatewayDelegateStakes) {
      const totalDelegatedStake = gateway.totalDelegatedStake;
      const data = gatewayDelegateStakes.map((stake) => {
        const totalStake = new mARIOToken(stake.delegatedStake)
          .toARIO()
          .valueOf();
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
  const columns: ColumnDef<TableData, any>[] = useMemo(
    () => [
      columnHelper.accessor('walletAddress', {
        id: 'walletAddress',
        header: 'Wallet Address',
        sortDescFirst: false,
        cell: ({ row }) => (
          <AddressCellWithName
            address={row.original.walletAddress}
            useBatchedNames={true}
            primaryNameOverride={primaryNamesMap.get(
              row.original.walletAddress,
            )}
          />
        ),
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
        cell: ({ row }) =>
          formatPercentage(row.original.percentageOfTotalStake),
      }),
    ],
    [primaryNamesMap, ticker],
  );

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
                  new mARIOToken(gateway.totalDelegatedStake)
                    .toARIO()
                    .valueOf(),
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
      {(isLoading || gatewayDelegateStakes) && (
        <TableView
          columns={columns}
          data={tableData}
          defaultSortingState={{ id: 'totalStake', desc: true }}
          isLoading={isLoading}
          isError={isError}
          noDataFoundText="No delegates found."
          errorText="Unable to load delegates."
          loadingRows={10}
          shortTable={true}
        />
      )}
    </CollapsiblePanel>
  );
};

export default ActiveDelegates;
