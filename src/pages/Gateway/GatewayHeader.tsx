import Profile from '@src/components/Profile';
import { GatewayIcon, HeaderSeparatorIcon } from '@src/components/icons';
import { Link } from 'react-router-dom';

const GatewayHeader = ({ gatewayName }: { gatewayName: string }) => {
  return (
    <header className="mt-[24px] flex-col text-clip rounded-[12px] border      leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-[12px] py-[20px] pl-[24px] pr-[16px] text-sm">
        <div className="text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        <HeaderSeparatorIcon />
        <div className="text-low">{gatewayName}</div>
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-[12px] bg-grey-900 py-[20px] pl-[24px] pr-[16px]">
        <GatewayIcon />
        <div className="text-high ">{gatewayName}</div>
      </div>
    </header>
  );
};

export default GatewayHeader;
