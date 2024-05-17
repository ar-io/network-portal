import Button, { ButtonType } from '@src/components/Button';
import Header from '@src/components/Header';
import {
  ConnectIcon,
  PinkArrowIcon,
  StakingSplash,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StakingModal from '@src/components/modals/StakingModal';
import { useGlobalState } from '@src/store';
import { useState } from 'react';

const Staking = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  // const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);

  return (
    <div className="flex size-full flex-col">
      <Header />
      <div className="grow pt-[24px]">
        {walletAddress ? (
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
            {isStakingModalOpen && (
              <StakingModal
                open={isStakingModalOpen}
                onClose={() => setIsStakingModalOpen(false)}
              />
            )}
          </div>
        ) : (
          <>
            <div className="flex h-full items-center justify-center">
              <div className="fixed overflow-hidden">
                <StakingSplash />
              </div>
              <div className="z-10 rounded-xl border border-grey-800 bg-grey-1000 p-[56px] text-center shadow-one">
                <div className="text-gradient text-2xl">
                  Connect your wallet to start staking.
                </div>
                <div className="pt-4 text-sm text-low">
                  Do you even have a wallet?
                </div>
                <div className="flex w-full justify-center">
                  <Button
                    className="mt-6 w-fit"
                    buttonType={ButtonType.PRIMARY}
                    icon={<ConnectIcon />}
                    title="Connect"
                    text="Connect"
                    onClick={() => setIsConnectModalOpen(true)}
                  />
                </div>
                {isConnectModalOpen && (
                  <ConnectModal
                    open={isConnectModalOpen}
                    onClose={() => setIsConnectModalOpen(false)}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Staking;
