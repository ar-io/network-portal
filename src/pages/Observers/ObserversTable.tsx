import AddressCell from '@src/components/AddressCell';
import TableView from '@src/components/TableView';
import useGateways from '@src/hooks/useGateways';
import useObservations from '@src/hooks/useObservations';
import useObservers from '@src/hooks/useObservers';
import { formatPercentage } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TableData {
  label: string;
  domain: string;
  gatewayAddress: string;
  observerAddress: string;
  ncw: number;
  successRatio: number;
  reportStatus: string;
  failedGateways?: number;
}

const columnHelper = createColumnHelper<TableData>();

const ObserversTable = () => {
  const navigate = useNavigate();

  const { isLoading, data: observers } = useObservers();
  const { isLoading: gatewaysLoading, data: gateways } = useGateways();
  const { isLoading: observationsLoading, data: observations } =
    useObservations();
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
        const status = submitted ? 'Submitted' : 'Pending';
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
            successRatio: observer.observerRewardRatioWeight,
            reportStatus: status,
            failedGateways: numFailedGatewaysFound,
          },
        ];
      },
      [] as Array<TableData>,
    );
    setObserversTableData(observersTableData);
  }, [observers, gateways, observations]);

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
            onClick={(e) => e.stopPropagation()}
          >
            {row.getValue('domain')}
          </a>{' '}
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
      cell: ({ row }) => formatPercentage(row.original.successRatio),
    }),
    columnHelper.accessor('reportStatus', {
      id: 'reportStatus',
      header: 'Current Report Status',
      sortDescFirst: true,
    }),

    columnHelper.accessor('failedGateways', {
      id: 'failedGateways',
      header: 'Failed Gateways',
      sortDescFirst: true,
      cell: ({ row }) => row.original.failedGateways || 'Pending',
    }),
  ];

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 py-[0.9375rem] pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Observers</div>
      </div>
      <TableView
        columns={columns}
        data={observersTableData}
        isLoading={isLoading || gatewaysLoading || observationsLoading}
        noDataFoundText="No prescribed observers found."
        defaultSortingState={{ id: 'ncw', desc: true }}
        onRowClick={(row) => {
          navigate(`/gateways/${row.gatewayAddress}`);
        }}
      />
    </div>
  );
};

export default ObserversTable;
