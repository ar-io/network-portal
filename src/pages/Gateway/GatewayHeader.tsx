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
    <header className="mt-[24px] flex-col text-clip rounded-xl border leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-[12px] py-[20px] pl-[24px] pr-[16px] text-sm">
        <div className="text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        <HeaderSeparatorIcon />
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
      <div className="flex items-center gap-[12px] rounded-b-xl bg-grey-900 py-[20px] pl-[24px]">
        <GatewayIcon />
        {gateway ? (
          <>
            <div className="text-high">{gateway.settings.label}</div>
            <div className="grow"></div>
            <div className="flex">
              <div className="pr-[24px] text-sm text-mid">
                <Link
                  className="flex gap-[8px] "
                  to={`/gateways/${ownerId}/reports`}
                >
                  <ReportsIcon />
                  Reports
                </Link>
              </div>
              <div className="border-l border-grey-400 px-[24px] text-sm text-mid">
                <Link
                  className="flex gap-[8px] "
                  to={`/gateways/${ownerId}/observe`}
                >
                  <BinocularsIcon />
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
