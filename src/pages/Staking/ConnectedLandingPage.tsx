import { PinkArrowIcon } from '@src/components/icons';
import StakingModal from '@src/components/modals/StakingModal';
import { useState } from 'react';
import ActiveStakes from './ActiveStakes';

const ConnectedLandingPage = () => {
  const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);

  return (
    <div>
      <button
        className="group relative mt-[24px] h-[120px] w-full overflow-hidden rounded-xl bg-grey-800"
        onClick={() => {
          setIsStakingModalOpen(true);
        }}
      >
        <div
          className="invisible size-full rounded-xl
bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
        >
          <div className="size-full overflow-hidden rounded-xl bg-grey-800"></div>
        </div>
        <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-[24px] align-middle">
          <div className="flex items-center gap-[8px]">
            <div className="text-gradient">Delegate your Stake</div>{' '}
            <PinkArrowIcon />
          </div>

          <div className="pt-[8px] text-sm text-low">
            Quick Stake by entering a wallet address to delegate to.
          </div>
        </div>
      </button>
      <ActiveStakes />
      {isStakingModalOpen && (
        <StakingModal
          open={isStakingModalOpen}
          onClose={() => setIsStakingModalOpen(false)}
        />
      )}
    </div>
  );
};
export default ConnectedLandingPage;
