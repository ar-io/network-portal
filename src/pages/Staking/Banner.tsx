import {
  ObserversConnectIcon,
  StakingLinesBGIcon,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import { useState } from 'react';

const Banner = () => {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div>
      <div>
        <button
          className="group relative flex h-[120px] w-full justify-center overflow-hidden rounded-xl bg-grey-800"
          onClick={() => {
            setLoginOpen(true);
          }}
        >
          <StakingLinesBGIcon className="absolute top-[-90px] opacity-80" />
          <div
            className="invisible size-full rounded-xl
       bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
          >
            <div className="size-full overflow-hidden rounded-xl bg-grey-800"></div>
          </div>
          <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-[24px] align-middle">
            <div className="flex items-center gap-[8px]">
              <ObserversConnectIcon />
              <div className="text-gradient">Connect your wallet to start staking
</div>{' '}
            </div>

            <div className="pt-[8px] text-sm text-low">
              By delegating stake to a gateway, you can participate in the network&apos;s reward system.
            </div>
          </div>
        </button>
      </div>
      {loginOpen && <ConnectModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
};

export default Banner;
