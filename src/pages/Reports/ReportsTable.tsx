import { AoGateway } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import { DownloadIcon } from '@src/components/icons';
import TableView from '@src/components/TableView';
import { downloadReport } from '@src/hooks/useReport';
import useReports, { ReportTransactionData } from '@src/hooks/useReports';
import { formatDateTime } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { saveAs } from 'file-saver';
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

  const { isLoading, data: reports } = useReports(ownerId, gateway);

  // Define columns for the table
  const columns: ColumnDef<ReportTransactionData, any>[] = [
    columnHelper.accessor('txid', {
      id: 'txid',
      header: 'Transaction ID',
      sortDescFirst: false,
    }),
    columnHelper.accessor('epochNumber', {
      id: 'epochNumber',
      header: 'AR.IO Epoch #',
      sortDescFirst: false,
      cell: ({ row }) => row.original.epochNumber,
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

    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex w-full justify-end gap-2 pr-6">
            <Button
              buttonType={ButtonType.SECONDARY}
              active={true}
              title="Download Report"
              text={<DownloadIcon className="size-4" />}
              onClick={async (e) => {
                e.stopPropagation();
                const txid = row.original.txid;
                try {
                  const reportData = await downloadReport(txid);
                  const blob = new Blob([reportData], {
                    type: 'application/json',
                  });
                  saveAs(blob, `report-${txid}.json`);
                } catch (e) {
                  showErrorToast(`Error: Unable to download report ${txid}`);
                }
              }}
            />
          </div>
        );
      },
    }),
  ];

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 py-[0.9375rem] pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Reports</div>
      </div>
      <TableView
        columns={columns}
        data={reports || []}
        isLoading={isLoading}
        noDataFoundText="No reports found."
        defaultSortingState={{ id: 'generatedAt', desc: true }}
        onRowClick={(row) => {
          navigate(`/gateways/${ownerId}/reports/${row.txid}`);
        }}
      />
    </div>
  );
};

export default ReportsTable;
