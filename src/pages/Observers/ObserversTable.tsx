import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AddressCell from '@src/components/AddressCell';
import ColumnSelector from '@src/components/ColumnSelector';
import CopyButton from '@src/components/CopyButton';
import Dropdown from '@src/components/Dropdown';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import useEpochs from '@src/hooks/useEpochs';
import useGateways from '@src/hooks/useGateways';
import useObservations from '@src/hooks/useObservations';
import { formatPercentage, formatWithCommas } from '@src/utils';

interface TableData {
  label: string;
  domain: string;
  gatewayAddress: string;
  observerAddress: string;
  ncw: number;
  successRatio: number;
  observedEpochs: number;
  prescribedEpochs: number;
  reportStatus: string;
  failedGateways?: number;
}

const columnHelper = createColumnHelper<TableData>();

const ObserversTable = () => {
  const navigate = useNavigate();

  const { data: epochs } = useEpochs();
  const [selectedEpochIndex, setSelectedEpochIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const selectedEpoch = epochs?.[selectedEpochIndex];

  // Read prescribed observers directly from the epoch object (already fetched
  // by useEpochs / getCurrentEpoch) instead of calling getPrescribedObservers
  // which redundantly re-fetches the epoch + makes ~50 individual getGateway
  // RPC calls for weights that are already on the epoch data.
  const observers = selectedEpoch?.prescribedObservers;

  const { isError: observationsError, data: observations } =
    useObservations(selectedEpoch);
  const {
    isLoading: gatewaysLoading,
    isError: gatewaysError,
    data: gateways,
  } = useGateways();

  const observersTableData = useMemo(() => {
    if (!observers || !gateways) return [];

    // Compute total composite weight from all gateways for normalization
    const totalCompositeWeight = Object.values(gateways).reduce(
      (sum, gw) => sum + (gw.weights?.compositeWeight ?? 0),
      0,
    );

    // Pre-calculate failure summaries for efficiency
    const failureSummaryEntries = observations
      ? Object.values(observations.failureSummaries)
      : [];

    return observers.map((observer) => {
      const gateway = gateways[observer.gatewayAddress];

      const submitted = observations?.reports[observer.observerAddress];
      const status = observations
        ? submitted
          ? 'Submitted'
          : selectedEpochIndex === 0
            ? 'Pending'
            : 'Did not report'
        : undefined;

      const numFailedGatewaysFound =
        observations && submitted
          ? failureSummaryEntries.reduce(
              (count, summary) =>
                count + (summary.includes(observer.observerAddress) ? 1 : 0),
              0,
            )
          : undefined;

      const ncw =
        observer.compositeWeight && totalCompositeWeight > 0
          ? observer.compositeWeight / totalCompositeWeight
          : 0;

      return {
        label: gateway?.settings.label ?? '',
        domain: gateway?.settings.fqdn ?? '',
        gatewayAddress: observer.gatewayAddress,
        observerAddress: observer.observerAddress,
        ncw,
        observedEpochs: (gateway?.stats.observedEpochCount ?? 0) + 1,
        prescribedEpochs: (gateway?.stats.prescribedEpochCount ?? 0) + 1,
        successRatio:
          observer.observerPerformanceRatio ||
          observer.observerRewardRatioWeight,
        reportStatus:
          status ?? (selectedEpochIndex === 0 ? 'Pending' : 'Loading...'),
        failedGateways: numFailedGatewaysFound,
      };
    });
  }, [observers, gateways, observations, selectedEpochIndex]);

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return observersTableData;
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return observersTableData.filter((item) =>
      item.domain.toLowerCase().includes(lowerSearch),
    );
  }, [observersTableData, debouncedSearchTerm]);

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
    columnHelper.accessor('gatewayAddress', {
      id: 'gatewayAddress',
      header: 'Gateway Address',
      sortDescFirst: false,
      cell: ({ row }) => (
        <AddressCell address={row.getValue('gatewayAddress')} />
      ),
    }),

    columnHelper.accessor('observerAddress', {
      id: 'observerAddress',
      header: 'Observer Address',
      sortDescFirst: false,
      cell: ({ row }) => (
        <AddressCell address={row.getValue('observerAddress')} />
      ),
    }),
    columnHelper.accessor('ncw', {
      id: 'ncw',
      header: 'Observation Chance',
      sortDescFirst: true,
      cell: ({ row }) => formatPercentage(row.original.ncw),
    }),
    columnHelper.accessor('successRatio', {
      id: 'successRatio',
      header: 'Observer Performance',
      sortDescFirst: true,
      cell: ({ row }) => (
        <Tooltip
          message={
            <div>
              <div>Observed Epochs: {row.original.observedEpochs}</div>
              <div>Prescribed Epochs: {row.original.prescribedEpochs}</div>
            </div>
          }
        >
          {`${(row.original.successRatio * 100).toFixed(2)}%`}
        </Tooltip>
      ),
    }),
    columnHelper.accessor('reportStatus', {
      id: 'reportStatus',
      header:
        selectedEpochIndex === 0 ? 'Current Report Status' : 'Report Status',
      sortDescFirst: true,
    }),

    columnHelper.accessor('failedGateways', {
      id: 'failedGateways',
      header: 'Failed Gateways',
      sortDescFirst: true,
      cell: ({ row }) =>
        row.original.failedGateways ??
        (selectedEpochIndex === 0 ? 'Pending' : 'N/A'),
    }),
  ];

  const tableIsLoading = !observers || gatewaysLoading;

  return (
    <div>
      <div className="flex w-full items-center overflow-x-auto justify-between rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-[0.8125rem] text-sm">
        <div className="flex items-center gap-4">
          <div className="text-mid">
            Observers{' '}
            {!tableIsLoading &&
              `(${formatWithCommas(filteredData.length)}${debouncedSearchTerm ? ` of ${formatWithCommas(observersTableData.length)}` : ''})`}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-low" />
            <input
              type="text"
              placeholder="Search domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[400px] rounded-md border border-grey-700 bg-grey-1000 py-1.5 pl-9 pr-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dropdown
            options={
              epochs?.map((epoch, index) => ({
                label:
                  index === 0 ? 'Current Epoch' : `Epoch ${epoch?.epochIndex}`,
                value: index.toString(),
              })) || []
            }
            onChange={(e) => {
              setSelectedEpochIndex(Number(e.target.value));
            }}
            value={selectedEpochIndex.toString()}
          />
          <ColumnSelector tableId="observers" columns={columns} />
        </div>
      </div>
      <TableView
        columns={columns}
        data={filteredData}
        isLoading={tableIsLoading}
        isError={gatewaysError || observationsError}
        noDataFoundText="No prescribed observers found."
        errorText="Unable to load observers."
        loadingRows={50}
        defaultSortingState={{ id: 'ncw', desc: true }}
        onRowClick={(row) => {
          navigate(`/gateways/${row.gatewayAddress}`);
        }}
        tableId="observers"
      />
    </div>
  );
};

export default ObserversTable;
