import { AoGateway } from '@ar.io/sdk';
import TableView from '@src/components/TableView';
import useReports, { ReportTransactionData } from '@src/hooks/useReports';
import { formatDate } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<ReportTransactionData>();

const ReportsTable = ({
  ownerId,
  gateway,
}: {
  ownerId: string;
  gateway: AoGateway;
}) => {
  const navigate = useNavigate();

  const {
    isLoading,
    data: reports,
    hasNextPage,
    fetchNextPage,
  } = useReports(ownerId, gateway);

  // Define columns for the table
  const columns: ColumnDef<ReportTransactionData, any>[] = [
    columnHelper.accessor('txid', {
      id: 'txid',
      header: 'Transaction ID',
      sortDescFirst: false,
    }),
    columnHelper.accessor('timestamp', {
      id: 'generatedAt',
      header: 'Generated At',
      sortDescFirst: false,
      cell: ({row}) => formatDate(new Date(row.original.timestamp)),
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
  ];

  const data: ReportTransactionData[] =
    (reports?.pages
      .filter((page) => page != undefined)
      .flatMap((page) => page.data) as ReportTransactionData[]) ?? [];

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
        defaultSortingState={{ id: 'timestamp', desc: true }}
        onRowClick={(row) => {
          navigate(`/gateways/${ownerId}/reports/${row.txid}`);
        }}
      />
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Load More</button>
      )}
    </div>
  );
};

export default ReportsTable;