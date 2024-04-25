import Button, { ButtonType } from './Button';
import { ConnectIcon } from './icons';

const Header = () => {
  return (
    <header className="mt-[24px] flex h-[72px] rounded-[12px] border-DEFAULT py-[16px] pl-[24px] pr-[16px] leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r pr-6 dark:border-transparent-100-8">
        <div className="text-[12px] text-textHigh">15</div>
        <div className="pt-[4px] text-[12px] leading-none text-textLow">
          AR.IO EPOCH
        </div>
      </div>
      <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8">
        <div className="text-[12px] text-textHigh">1,367,904</div>
        <div className="pt-[4px] text-[12px] leading-none text-textLow">
          ARWEAVE BLOCK
        </div>
      </div>
      <div className="grow" />
      <div className="content-center">
        <Button
          buttonType={ButtonType.PRIMARY}
          icon={<ConnectIcon />}
          title="Connect"
          text="Connect"
          onClick={() => {}}
        />
      </div>
    </header>
  );
};

export default Header;
