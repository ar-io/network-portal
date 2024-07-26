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
      <button
        className="group relative flex h-[7.5rem] w-full justify-center overflow-hidden rounded-xl bg-grey-800"
        onClick={() => {
          setLoginOpen(true);
        }}
      >
        <StakingLinesBGIcon className="absolute top-[-5.625rem] h-[58.1875rem] w-[90rem]  opacity-80" />
        <div
          className="invisible size-full rounded-xl
       bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
        >
          <div className="size-full overflow-hidden rounded-xl bg-grey-800"></div>
        </div>
        <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-6 align-middle">
          <div className="flex items-center gap-2">
            <ObserversConnectIcon className="size-4" />
            <div className="text-gradient">
              Connect your wallet to start staking
            </div>{' '}
          </div>

          <div className="pt-2 text-sm text-low">
            By delegating stake to a gateway, you can participate in the
            network&apos;s reward system.
          </div>
        </div>
      </button>
      {loginOpen && <ConnectModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
};

export default Banner;
