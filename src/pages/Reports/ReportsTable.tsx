import { AoGateway } from '@ar.io/sdk';
import TableView from '@src/components/TableView';
import useReports, { ReportTransactionData } from '@src/hooks/useReports';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

// interface TableData {
//   label: string;
// }

const columnHelper = createColumnHelper<ReportTransactionData>();

const ReportsTable = ({
  ownerId,
  gateway,
}: {
  ownerId: string;
  gateway: AoGateway;
}) => {
  // const navigate = useNavigate();

  const {
    isLoading,
    data: reports,
    hasNextPage,
    fetchNextPage,
  } = useReports(ownerId, gateway);
  // const [observersTableData, setObserversTableData] = useState<
  //   Array<TableData>
  // >([]);

  // useEffect(() => {
  //   if (!reports) {
  //     return;
  //   }

  //   // const observersTableData: Array<TableData> = reports.reduce(
  //   //   (acc, observer) => {
  //   //     const gateway = gateways[observer.gatewayAddress];

  //   //     const submitted = observations.reports[observer.gatewayAddress];
  //   //     const status = submitted ? 'Submitted' : 'Pending';
  //   //     const numFailedGatewaysFound = submitted
  //   //       ? Object.values(observations.failureSummaries).reduce(
  //   //           (acc, summary) => {
  //   //             return (
  //   //               acc + (summary.includes(observer.gatewayAddress) ? 1 : 0)
  //   //             );
  //   //           },
  //   //           0,
  //   //         )
  //   //       : undefined;

  //   //     return [
  //   //       ...acc,
  //   //       {
  //   //         label: gateway.settings.label,
  //   //         domain: gateway.settings.fqdn,

  //   //         gatewayAddress: observer.gatewayAddress,
  //   //         observerAddress: observer.observerAddress,
  //   //         ncw: observer.normalizedCompositeWeight,
  //   //         successRatio: observer.observerRewardRatioWeight,
  //   //         reportStatus: status,
  //   //         failedGateways: numFailedGatewaysFound,
  //   //       },
  //   //     ];
  //   //   },
  //   //   [] as Array<TableData>,
  //   // );
  //   setObserversTableData(reports);
  // }, [reports]);

  // Define columns for the table
  const columns: ColumnDef<ReportTransactionData, any>[] = [
    columnHelper.accessor('txid', {
      id: 'txid',
      header: 'Transaction ID',
      sortDescFirst: false,
    }),
    columnHelper.accessor('timestamp', {
      id: 'timestamp',
      header: 'Timestamp',
      sortDescFirst: false,
    }),
    columnHelper.accessor('size', {
      id: 'size',
      header: 'Size',
      sortDescFirst: false,
    }),
    columnHelper.accessor('version', {
      id: 'version',
      header: 'Version',
      sortDescFirst: false,
    }),
    columnHelper.accessor('failedGateways', {
      id: 'failedGateways',
      header: 'Failed Gateways',
      sortDescFirst: false,
    }),
    // columnHelper.accessor('domain', {
    //   id: 'domain',
    //   header: 'Domain',
    //   sortDescFirst: false,
    //   cell: ({ row }) => (
    //     <div className="text-gradient">
    //       <a
    //         href={`https://${row.getValue('domain')}`}
    //         target="_blank"
    //         rel="noreferrer"
    //       >
    //         {row.getValue('domain')}
    //       </a>{' '}
    //     </div>
    //   ),
    // }),
    // columnHelper.accessor('gatewayAddress', {
    //   id: 'gatewayAddress',
    //   header: 'Gateway Address',
    //   sortDescFirst: false,
    //   cell: ({ row }) => (
    //     <AddressCell address={row.getValue('gatewayAddress')} />
    //   ),
    // }),

    // columnHelper.accessor('observerAddress', {
    //   id: 'observerAddress',
    //   header: 'Observer Address',
    //   sortDescFirst: false,
    //   cell: ({ row }) => (
    //     <AddressCell address={row.getValue('observerAddress')} />
    //   ),
    // }),
    // columnHelper.accessor('ncw', {
    //   id: 'ncw',
    //   header: 'Observation Chance',
    //   sortDescFirst: true,
    //   cell: ({ row }) => formatPercentage(row.original.ncw),
    // }),
    // columnHelper.accessor('successRatio', {
    //   id: 'successRatio',
    //   header: 'Observer Performance',
    //   sortDescFirst: true,
    //   cell: ({ row }) => formatPercentage(row.original.successRatio),
    // }),
    // columnHelper.accessor('reportStatus', {
    //   id: 'reportStatus',
    //   header: 'Current Report Status',
    //   sortDescFirst: true,
    // }),

    // columnHelper.accessor('failedGateways', {
    //   id: 'failedGateways',
    //   header: 'Failed Gateways',
    //   sortDescFirst: true,
    //   cell: ({ row }) => row.original.failedGateways || "Pending",
    // }),
  ];

  const data: ReportTransactionData[] =
    (reports?.pages
      .filter((page) => page != undefined)
      .flat() as ReportTransactionData[]) ?? [];

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
        <div className="grow text-sm text-mid">Reports</div>
      </div>
      <TableView
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        noDataFoundText="No reports found."
        defaultSortingState={{ id: 'label', desc: true }}
      />
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Load More</button>
      )}
    </div>
  );
};

export default ReportsTable;
