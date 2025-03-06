import { AoGateway } from '@ar.io/sdk/web';
import Button from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import { downloadReport } from '@src/hooks/useReport';
import { ReportData } from '@src/types';
import { formatDateTime } from '@src/utils';
import { saveAs } from 'file-saver';
import { ChevronRightIcon, Download, NotebookText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const ReportHeader = ({
  gateway,
  reportData,
}: {
  gateway?: AoGateway | null;
  reportData?: ReportData;
}) => {
  const params = useParams();

  const ownerId = params?.ownerId;
  const reportId = params?.reportId;

  return (
    <header className="mt-6 flex-col text-clip rounded-xl border leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-3 py-5 pl-6 pr-4 text-sm">
        <div className="text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        <ChevronRightIcon className="size-4 text-mid" strokeWidth={1.5} />
        {gateway ? (
          <Link className="text-mid" to={`/gateways/${ownerId}`}>
            {gateway.settings.label}
          </Link>
        ) : (
          <Placeholder />
        )}
        <ChevronRightIcon className="size-4 text-mid" strokeWidth={1.5} />
        <Link className="text-mid" to={`/gateways/${ownerId}/reports`}>
          Reports
        </Link>
        <ChevronRightIcon className="size-4 text-mid" strokeWidth={1.5} />
        {reportId ? <div>{reportId}</div> : <Placeholder />}
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="relative flex items-center gap-3 border border-grey-500 bg-grey-900 px-6 py-5">
        <NotebookText className="size-4 text-mid" strokeWidth={1.5} />
        {reportId ? (
          <div className="text-high">{reportId}</div>
        ) : (
          <Placeholder />
        )}
        <div className="grow" />
        {reportData && reportId && (
          <Button
            className="absolute right-6"
            title={'Download Report'}
            icon={<Download className="size-4" strokeWidth={2}/>}
            active={true}
            onClick={async () => {
              if (reportId && reportData) {
                const reportData = await downloadReport(reportId);
                const blob = new Blob([reportData], {
                  type: 'application/json',
                });
                saveAs(blob, `report-${reportId}.json`);
              }
            }}
          />
        )}
      </div>
      <div className="grid grid-cols-[180px_auto] items-center gap-3 rounded-b-xl border border-grey-500 bg-grey-900 py-5 pl-6 text-sm">
        {/* <div>Observer Host:</div>
        <div></div> */}
        <div>Reports Source:</div>
        {reportData ? <div>Arweave Tx</div> : <Placeholder />}
        <div>Observer Address:</div>
        {reportData ? <div>{reportData.observerAddress}</div> : <Placeholder />}
        <div>Epoch Number:</div>
        {reportData ? <div>{reportData.epochIndex}</div> : <Placeholder />}
        <div>Generated At:</div>
        {reportData ? (
          <div>{formatDateTime(new Date(reportData.epochStartTimestamp))}</div>
        ) : (
          <Placeholder />
        )}
      </div>
    </header>
  );
};

export default ReportHeader;
