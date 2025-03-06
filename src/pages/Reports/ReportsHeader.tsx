import { AoGateway } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import { ChevronRightIcon, NotebookText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const ReportsHeader = ({ gateway }: { gateway?: AoGateway | null }) => {
  const params = useParams();

  const ownerId = params?.ownerId;

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
        <div>Reports</div>
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-b-xl bg-grey-900 py-5 pl-6">
        <NotebookText className="size-4 text-mid" strokeWidth={1.5} />
        {gateway ? (
          <div className="text-high">{gateway.settings.label}</div>
        ) : (
          <Placeholder />
        )}
      </div>
    </header>
  );
};

export default ReportsHeader;
