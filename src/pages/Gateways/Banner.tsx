import { PinkArrowIcon, StartGatewayCubes } from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StartGatewayModal from '@src/components/modals/StartGatewayModal';
import { useGlobalState } from '@src/store';
import { useState } from 'react';

const Banner = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const [loginOpen, setLoginOpen] = useState(false);
  const [startGatewayOpen, setStartGatewayOpen] = useState(false);

  return (
    <div>
      <button
        className="group relative mt-[24px] h-[120px] w-full overflow-hidden rounded-xl bg-grey-800"
        onClick={() => {
          if (!walletAddress) {
            setLoginOpen(true);
          } else {
            setStartGatewayOpen(true);
          }
        }}
      >
        <div
          className="invisible size-full rounded-xl
       bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
        >
          <div className="size-full overflow-hidden rounded-xl bg-grey-800">
            <StartGatewayCubes className="relative -top-px left-[63px] z-0" />
          </div>
        </div>
        <StartGatewayCubes className="visible absolute left-[64px] top-0 z-0 group-hover:invisible" />
        {/* <BannerRightChevron className="invisible absolute right-[16px] top-[16px] group-hover:visible" /> */}
        <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-[24px] align-middle">
          <div className="flex items-center gap-[8px]">
            <div className="text-gradient">Start your own gateway</div>{' '}
            <PinkArrowIcon />
          </div>

          <div className="pt-[8px] text-sm text-low">
            By starting your own gateway, you can earn rewards.
          </div>
        </div>
      </button>
      <ConnectModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <StartGatewayModal open={startGatewayOpen} onClose={() => setStartGatewayOpen(false)} />

    </div>
  );
};

export default Banner;
