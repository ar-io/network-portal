import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import { GatewayIcon, HeaderSeparatorIcon } from '@src/components/icons';
import { Link } from 'react-router-dom';

const GatewayHeader = ({ gatewayName }: { gatewayName?: string }) => {
  return (
    <header className="mt-[24px] flex-col text-clip rounded-[12px] border      leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-[12px] py-[20px] pl-[24px] pr-[16px] text-sm">
        <div className="text-mid">
          <Link to={'/gateways'}>Gateways</Link>
        </div>
        <HeaderSeparatorIcon />
        {gatewayName ? (
          <div className="text-low">{gatewayName}</div>
        ) : (
          <Placeholder /> 
        )}
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-[12px] bg-grey-900 py-[20px] pl-[24px] pr-[16px]">
        <GatewayIcon />
        {gatewayName ? (
          <div className="text-high">{gatewayName}</div>
        ) : (
          <Placeholder /> 
        )}
      </div>
    </header>
  );
};

export default GatewayHeader;
