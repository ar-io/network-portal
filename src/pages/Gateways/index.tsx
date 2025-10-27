import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import CopyButton from '@src/components/CopyButton';
import Header from '@src/components/Header';
import Streak from '@src/components/Streak';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useGateways from '../../hooks/useGateways';
import useGatewaysArioInfo from '../../hooks/useGatewaysArioInfo';
import { useGlobalState } from '../../store/globalState';
import Banner from './Banner';
// import ColumnSelector from '../../components/ColumnSelector';
import ColumnSelector from '@src/components/ColumnSelector';
import { ArioInfoResponse } from '@src/hooks/useGatewayArioInfo';
import { formatDate, formatWithCommas } from '@src/utils';

const BYTES_PER_GIB = 1024 * 1024 * 1024;

const calculatePricePerGiB = (
  arioInfo: ArioInfoResponse | null | undefined,
): number | null | undefined => {
  // undefined = gateway data not loaded yet (show spinner)
  if (arioInfo === undefined) {
    return undefined;
  }
  // null = gateway failed to load or error (show "-")
  if (arioInfo === null) {
    return null;
  }
  // Check if x402 is enabled and has pricing
  if (
    arioInfo.x402?.enabled &&
    arioInfo.x402.dataEgress?.pricing?.perBytePrice
  ) {
    return arioInfo.x402.dataEgress.pricing.perBytePrice * BYTES_PER_GIB;
  }
  // x402 disabled or no pricing = free/not available (show "0" or "-")
  return 0;
};

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
  egressPricePerGiB?: number | undefined | null;
  streak: number;
}

const columnHelper = createColumnHelper<TableData>();

const Gateways = () => {
  const ticker = useGlobalState((state) => state.ticker);

  const { isLoading, isError, data: gateways } = useGateways();
  const [tableData, setTableData] = useState<Array<TableData>>([]);
  const gatewayDomains = useMemo(
    () =>
      !gateways
        ? undefined
        : Object.values(gateways).map((g) => g.settings.fqdn),
    [gateways],
  );
  const arioInfoMap = useGatewaysArioInfo({ domains: gatewayDomains });
  const [isProcessingData, setIsProcessingData] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!gateways) {
      return;
    }

    const tableData: Array<TableData> = Object.entries(gateways).map(
      ([owner, gateway]) => {
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
          owner: owner,
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
          egressPricePerGiB: calculatePricePerGiB(
            arioInfoMap ? arioInfoMap[gateway.settings.fqdn] : undefined,
          ),
          streak:
            gateway.status == 'leaving'
              ? Number.NEGATIVE_INFINITY
              : gateway.stats.failedConsecutiveEpochs > 0
                ? -gateway.stats.failedConsecutiveEpochs
                : gateway.stats.passedConsecutiveEpochs,
        };
      },
    );
    setTableData(tableData);
    setIsProcessingData(false);
  }, [gateways, arioInfoMap]);

  // Define columns for the table
  const columns = useMemo<ColumnDef<TableData, any>[]>(
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
                  <div>Passed Epochs: {row.original.passedEpochCount}</div>
                  <div>Total Epochs: {row.original.totalEpochCount}</div>
                </div>
              }
            >
              {`${(row.original.performance * 100).toFixed(2)}%`}
            </Tooltip>
          ),
      }),
      columnHelper.accessor('egressPricePerGiB', {
        id: 'egressPricePerGiB',
        header: '$/GiB egress',
        sortDescFirst: true,
        cell: ({ row }) => {
          const price = row.original.egressPricePerGiB;
          // undefined = still loading (show spinner)
          if (price === undefined) {
            return (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
              </div>
            );
          }
          // null = failed to load or error (show dash)
          if (price === null) {
            return '-';
          }
          // 0 = x402 disabled or free (show 0)
          if (price === 0) {
            return '0.000000 USDC';
          }
          // positive number = actual price
          return `${price.toFixed(6)} USDC`;
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const priceA = rowA.original.egressPricePerGiB;
          const priceB = rowB.original.egressPricePerGiB;

          // Treat undefined (loading) as lower priority than numeric values
          if (priceA === undefined && priceB === undefined) return 0;
          if (priceA === undefined) return -1;
          if (priceB === undefined) return 1;

          // Treat null (error) just below numeric values and above undefined
          if (priceA === null && priceB === null) return 0;
          if (priceA === null) return -1;
          if (priceB === null) return 1;

          // numeric sort for valid prices (including 0)
          return priceA - priceB;
        },
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
  ); // Only recalculate when ticker changes

  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-6 flex shrink-0 flex-col gap-6">
        <Header />
        <Banner />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="pt-0">
            <div className="mb-8">
              <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-[0.8125rem]">
                <div className="grow text-sm text-mid">Gateways</div>
                <ColumnSelector tableId="gateways" columns={columns} />
              </div>
              <TableView
                columns={columns}
                data={tableData}
                defaultSortingState={{ id: 'totalStake', desc: true }}
                isLoading={isLoading || isProcessingData}
                isError={isError}
                noDataFoundText="No gateways found."
                errorText="Unable to load gateways."
                loadingRows={10}
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
