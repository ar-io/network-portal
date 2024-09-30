import { NBSP } from '@src/constants';
import useGateways from '@src/hooks/useGateways';
import { useGlobalState } from '@src/store';
import Placeholder from './Placeholder';
import Profile from './Profile';

const Header = () => {
  const blockHeight = useGlobalState((state) => state.blockHeight);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const { isLoading: gatewaysLoading, data: gateways } = useGateways();

  return (
    <header className="mt-6 flex h-[4.5rem] rounded-xl border py-4 pl-6 pr-4 leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r pr-6 dark:border-transparent-100-8">
        <div className="text-xs text-high">
          {currentEpoch?.epochIndex !== undefined
            ? currentEpoch.epochIndex.toLocaleString('en-US')
            : NBSP}
        </div>
        <div className="pt-1 text-xs leading-none text-low">
          AR.IO EPOCH
        </div>
      </div>
      <div className="inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8">
        <div className="text-xs text-high">
          {blockHeight ? blockHeight.toLocaleString('en-US') : NBSP}
        </div>
        <div className="pt-1 text-xs leading-none text-low">
          ARWEAVE BLOCK
        </div>
      </div>
      <div className="inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8">
        <div className="text-xs text-high">
          {gatewaysLoading ? (
            <Placeholder className='h-[1.0625rem]'/>
          ) : gateways ? (
            Object.values(gateways).filter((g) => g.status === "joined").length
          ) : (
            NBSP
          )}
        </div>
        <div className="pt-1 text-xs leading-none text-low">
          TOTAL GATEWAYS
        </div>
      </div>
      <div className="grow" />
      <div className="content-center">
        <Profile />
      </div>
    </header>
  );
};

export default Header;
