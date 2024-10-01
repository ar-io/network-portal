import { AoGateway } from '@ar.io/sdk';
import Placeholder from '@src/components/Placeholder';
import TableView from '@src/components/TableView';
import useReports, { ReportTransactionData } from '@src/hooks/useReports';
import { formatDateTime } from '@src/utils';
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
    isFetchingNextPage
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
      cell: ({ row }) => formatDateTime(new Date(row.original.timestamp)),
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
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[0.9375rem] pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Reports</div>
      </div>
      <TableView
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        noDataFoundText="No reports found."
        defaultSortingState={{ id: 'generatedAt', desc: true }}
        onRowClick={(row) => {
          navigate(`/gateways/${ownerId}/reports/${row.txid}`);
        }}
      />
      {hasNextPage && (
        <div className="flex w-full items-center justify-center border border-grey-600 py-[0.9375rem] pl-6 pr-[0.8125rem]">
          {isLoading || isFetchingNextPage ? (
            <Placeholder className='grow'/>
          ) : (
            <button onClick={() => fetchNextPage()}>Load More</button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsTable;
