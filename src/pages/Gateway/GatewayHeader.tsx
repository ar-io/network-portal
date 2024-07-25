import { AoGateway } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import {
  BinocularsIcon,
  GatewayIcon,
  HeaderSeparatorIcon,
  ReportsIcon,
} from '@src/components/icons';
import { Link, useParams } from 'react-router-dom';

const GatewayHeader = ({ gateway }: { gateway?: AoGateway }) => {
  const params = useParams();

  const ownerId = params?.ownerId;

  return (
    <header className="mt-6 flex-col text-clip rounded-xl border leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-3 py-5 pl-6 pr-4 text-sm">
        <div className="text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        <HeaderSeparatorIcon className="size-4" />
        {gateway ? (
          <div className="text-low">{gateway.settings.label}</div>
        ) : (
          <Placeholder />
        )}
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-b-xl bg-grey-900 py-5 pl-6">
        <GatewayIcon className="h-3 w-4" />
        {gateway ? (
          <>
            <div className="text-high">{gateway.settings.label}</div>
            <div className="grow"></div>
            <div className="flex">
              <div className="pr-6 text-sm text-mid">
                <Link
                  className="flex gap-2 "
                  to={`/gateways/${ownerId}/reports`}
                >
                  <ReportsIcon className="size-4" />
                  Reports
                </Link>
              </div>
              <div className="border-l border-grey-400 px-6 text-sm text-mid">
                <Link
                  className="flex gap-2 "
                  to={`/gateways/${ownerId}/observe`}
                >
                  <BinocularsIcon className="size-4" />
                  Observe
                </Link>
              </div>
            </div>
          </>
        ) : (
          <Placeholder />
        )}
      </div>
    </header>
  );
};

export default GatewayHeader;
