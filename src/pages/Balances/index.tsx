import Header from '@src/components/Header';
import { PinkArrowIcon } from '@src/components/icons';
import WalletAddressModal from '@src/components/modals/WalletAddressModal';
import { useGlobalState } from '@src/store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from './Banner';
import VaultsTable from './VaultsTable';

const Balances = () => {
  const navigate = useNavigate();
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const [showWalletAddressModal, setShowWalletAddressModal] = useState(false);

  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col gap-6 pb-6">
            {!walletAddress && (
              <>
                <button
                  className="text-gradient flex w-full items-center justify-center gap-2 rounded-xl border border-grey-500 p-4"
                  onClick={() => setShowWalletAddressModal(true)}
                >
                  <div>Enter an address to see balances</div>
                  <PinkArrowIcon className="size-4" />
                </button>
                <div className="flex w-full justify-center">
                  <div className="text-gradient text-sm">OR</div>
                </div>
              </>
            )}
            <Banner walletAddress={walletAddress} showActions={true} />
            {walletAddress && <VaultsTable walletAddress={walletAddress} />}
            {showWalletAddressModal && (
              <WalletAddressModal
                onClose={() => setShowWalletAddressModal(false)}
                onSuccess={(walletAddress) => {
                  navigate(`/balances/${walletAddress}`);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balances;
