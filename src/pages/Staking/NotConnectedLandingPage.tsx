import Button, { ButtonType } from '@src/components/Button';
import { ConnectIcon, StakingSplash } from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import { useState } from 'react';

const NotConnectedLandingPage = () => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="fixed overflow-hidden">
        <StakingSplash />
      </div>
      <div className="z-10 rounded-xl border border-grey-800 bg-grey-1000 p-[56px] text-center shadow-one">
        <div className="text-gradient text-2xl">
          Connect your wallet to start staking.
        </div>
        <div className="pt-4 text-sm text-low">Do you even have a wallet?</div>
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
          <ConnectModal onClose={() => setIsConnectModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default NotConnectedLandingPage;
