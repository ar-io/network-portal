import { NBSP } from '@src/constants';
import { useGlobalState } from '@src/store';
import Profile from './Profile';

const Header = () => {
  const blockHeight = useGlobalState((state) => state.blockHeight);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  return (
    <header className="mt-[24px] flex h-[72px] rounded-[12px] border py-[16px] pl-[24px] pr-[16px] leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r pr-6 dark:border-transparent-100-8">
        <div className="text-[12px] text-high">
          {currentEpoch
            ? currentEpoch.epochPeriod.toLocaleString('en-US')
            : NBSP}
        </div>
        <div className="pt-[4px] text-[12px] leading-none text-low">
          AR.IO EPOCH
        </div>
      </div>
      <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8">
        <div className="text-[12px] text-high">
          <p>{blockHeight ? blockHeight.toLocaleString('en-US') : NBSP}</p>
        </div>
        <div className="pt-[4px] text-[12px] leading-none text-low">
          ARWEAVE BLOCK
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
