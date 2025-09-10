import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
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
import useObservers from '@src/hooks/useObservers';
import { formatPercentage } from '@src/utils';

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

  const selectedEpoch = epochs?.[selectedEpochIndex];

  const { isLoading, isError, data: observers } = useObservers(selectedEpoch);
  const {
    isLoading: observationsLoading,
    isError: observationsError,
    data: observations,
  } = useObservations(selectedEpoch);
  const {
    isLoading: gatewaysLoading,
    isError: gatewaysError,
    data: gateways,
  } = useGateways();

  const [observersTableData, setObserversTableData] = useState<
    Array<TableData>
  >([]);

  useEffect(() => {
    if (!observers || !gateways || !observations) {
      return;
    }

    const observersTableData: Array<TableData> = observers.reduce(
      (acc, observer) => {
        const gateway = gateways[observer.gatewayAddress];

        const submitted = observations.reports[observer.observerAddress];
        const status = submitted
          ? 'Submitted'
          : selectedEpochIndex == 0
            ? 'Pending'
            : 'Did not report';
        const numFailedGatewaysFound = submitted
          ? Object.values(observations.failureSummaries).reduce(
              (acc, summary) => {
                return (
                  acc + (summary.includes(observer.observerAddress) ? 1 : 0)
                );
              },
              0,
            )
          : undefined;

        return [
          ...acc,
          {
            label: gateway.settings.label,
            domain: gateway.settings.fqdn,

            gatewayAddress: observer.gatewayAddress,
            observerAddress: observer.observerAddress,
            ncw: observer.normalizedCompositeWeight,
            observedEpochs: gateway.stats.observedEpochCount + 1, // add one as the contract avoids divide by 0 by incrementing the numerator and denominator by 1 when computing performance ratio
            prescribedEpochs: gateway.stats.prescribedEpochCount + 1, // add one as the contract avoids divide by 0 by incrementing the numerator and denominator by 1 when computing performance ratio
            successRatio:
              // there will be a period where old epoch notices have the old field, and new epoch notices have the new field, so check both
              observer.observerPerformanceRatio ||
              observer.observerRewardRatioWeight,
            reportStatus: status,
            failedGateways: numFailedGatewaysFound,
          },
        ];
      },
      [] as Array<TableData>,
    );
    setObserversTableData(observersTableData);
  }, [observers, gateways, observations, selectedEpochIndex]);

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
        selectedEpochIndex == 0 ? 'Current Report Status' : 'Report Status',
      sortDescFirst: true,
    }),

    columnHelper.accessor('failedGateways', {
      id: 'failedGateways',
      header: 'Failed Gateways',
      sortDescFirst: true,
      cell: ({ row }) =>
        row.original.failedGateways ||
        (selectedEpochIndex == 0 ? 'Pending' : 'N/A'),
    }),
  ];

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 pl-6 pr-[0.8125rem] text-sm ">
        <div className="grow text-mid">Observers</div>
        <div className="flex items-center gap-3">
          <Dropdown
            options={
              epochs?.map((epoch, index) => ({
                label:
                  index == 0 ? 'Current Epoch' : `Epoch ${epoch?.epochIndex}`,
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
        data={observersTableData}
        isLoading={isLoading || gatewaysLoading || observationsLoading}
        isError={isError || gatewaysError || observationsError}
        noDataFoundText="No prescribed observers found."
        errorText="Unable to load observers."
        loadingRows={10}
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
