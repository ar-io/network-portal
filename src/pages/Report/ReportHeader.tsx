import { AoGateway } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import { HeaderSeparatorIcon, ReportsIcon } from '@src/components/icons';
import { ReportData } from '@src/types';
import { formatDateTime } from '@src/utils';
import { Link, useParams } from 'react-router-dom';

const ReportHeader = ({
  gateway,
  reportData,
}: {
  gateway?: AoGateway;
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
        <HeaderSeparatorIcon className="size-4"/>
        {gateway ? (
          <Link className="text-mid" to={`/gateways/${ownerId}`}>
            {gateway.settings.label}
          </Link>
        ) : (
          <Placeholder />
        )}
        <HeaderSeparatorIcon className="size-4"/>
        <Link className="text-mid" to={`/gateways/${ownerId}/reports`}>
          Reports
        </Link>
        <HeaderSeparatorIcon className="size-4"/>
        {reportId ? <div>{reportId}</div> : <Placeholder />}
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-3 border border-grey-500 bg-grey-900 py-5 pl-6">
        <ReportsIcon className="size-4" />
        {reportId ? (
          <div className="text-high">{reportId}</div>
        ) : (
          <Placeholder />
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
        {reportData ? (
          <div>{reportData.epochIndex}</div>
        ) : (
          <Placeholder />
        )}
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
