import Placeholder from '@src/components/Placeholder';
import Profile from '@src/components/Profile';
import { ChevronRightIcon, HandCoins } from 'lucide-react';
import { Link } from 'react-router-dom';

const BalancesHeader = ({ walletAddress }: { walletAddress?: string }) => {
  return (
    <header className="flex-col text-clip rounded-xl border leading-[1.4] lg:mt-6 dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="flex items-center gap-3 py-5 pl-6 pr-4 text-sm">
        <div className="hidden items-center gap-3 lg:flex">
          <div className="text-mid">
            <Link to={'/balances'}>Balances</Link>
          </div>
          <ChevronRightIcon className="size-4 text-mid" strokeWidth={1.5} />
          {walletAddress ? (
            <div className="text-low">{walletAddress}</div>
          ) : (
            <Placeholder />
          )}
        </div>
        <div className="grow" />
        <div className="items-center">
          <Profile />
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-b-xl bg-grey-900 px-6 py-5">
        <HandCoins className="size-4 shrink-0" />
        {walletAddress ? (
          <div className="break-all text-high">{walletAddress}</div>
        ) : (
          <Placeholder />
        )}
      </div>
    </header>
  );
};

export default BalancesHeader;
