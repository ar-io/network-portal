import { AoGateway } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import { GatewayIcon, HeaderSeparatorIcon } from '@src/components/icons';
import { Link, useParams } from 'react-router-dom';

const ReportsHeader = ({ gateway }: { gateway?: AoGateway }) => {
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
          <Link className="text-mid" to={`/gateways/${ownerId}`}>
            {gateway.settings.label}
          </Link>
        ) : (
          <Placeholder />
        )}
        <HeaderSeparatorIcon />
        <div>Reports</div>
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-[12px] rounded-b-xl bg-grey-900 py-[20px] pl-[24px]">
        <GatewayIcon />
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
