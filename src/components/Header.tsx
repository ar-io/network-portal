import { ConnectIcon } from './icons';

const Header = () => {
  return (
    <header className="mt-[24px] flex h-[72px] rounded-[12px] border-[1px] py-[16px] pl-[24px] pr-[16px] leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r pr-6 dark:border-transparent-100-8">
        <div className="text-[12px] ">15</div>
        <div className="pt-[4px] text-[12px] leading-none text-grey-500">
          EPOCH
        </div>
      </div>
      <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8">
        <div className="text-[12px] ">$0.50</div>
        <div className="pt-[4px] text-[12px] leading-none text-grey-500">
          IO
        </div>
      </div>
      <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8">
        <div className="text-[12px] ">1,367,904</div>
        <div className="pt-[4px] text-[12px] leading-none text-grey-500">
          BLOCK
        </div>
      </div>
      <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8">
        <div className="text-[12px] ">$14.50</div>
        <div className="pt-[4px] text-[12px] leading-none text-grey-500">
          AR
        </div>
      </div>
      <div className="grow" />
      <div className="content-center">
        <div className="rounded-md bg-gradient-to-b from-[#EEB3BFA3] to-[#DF9BE808] p-[1px]">
          <button
            className="inline-flex items-center justify-start 
                     gap-[11px] rounded-md bg-grey-800 bg-gradient-to-b from-[rgba(102,102,102,.06)] 
                     to-neutrals-1100 px-[11px] py-[5px] shadow-inner"
          >
            <ConnectIcon />
            <div
              className="bg-gradient-to-r from-[#F7C3A1] to-[#DF9BE8_100%] 
          bg-clip-text text-sm leading-tight text-transparent"
            >
              Connect
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
