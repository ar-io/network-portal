import { LinkArrowIcon, PinkArrowIcon } from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StartGatewayModal from '@src/components/modals/StartGatewayModal';
import TransferArioModal from '@src/components/modals/TransferArioModal';
import { useGlobalState } from '@src/store';
import { SendHorizonal } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleJoinNetwork = () => {
    if (!walletAddress) {
      setShowConnectModal(true);
    } else {
      setShowJoinModal(true);
    }
  };

  const handleDelegate = () => {
    navigate('/staking');
  };

  const handleTransfer = () => {
    if (!walletAddress) {
      setShowConnectModal(true);
    } else {
      setShowTransferModal(true);
    }
  };

  return (
    <div className="w-full">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Join Network CTA */}
        <div
          className="group relative overflow-hidden rounded-lg bg-grey-800 p-6 hover:bg-grey-700 transition-colors cursor-pointer"
          onClick={handleJoinNetwork}
        >
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="text-gradient font-medium">
                Join the Network
              </span>
              <PinkArrowIcon className="size-3" />
            </div>
            <p className="text-sm text-mid mb-4">
              Start your gateway and earn {ticker} rewards
            </p>
            <div className="flex items-center gap-1 text-sm text-low">
              <span>Get started</span>
              <LinkArrowIcon className="size-3" />
            </div>
          </div>
        </div>

        {/* Delegate CTA */}
        <div
          className="group relative overflow-hidden rounded-lg bg-grey-800 p-6 hover:bg-grey-700 transition-colors cursor-pointer"
          onClick={handleDelegate}
        >
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="text-gradient font-medium">
                Delegate to Gateways
              </span>
              <PinkArrowIcon className="size-3" />
            </div>
            <p className="text-sm text-mid mb-4">
              Stake your {ticker} tokens and earn rewards
            </p>
            <div className="flex items-center gap-1 text-sm text-low">
              <span>View gateways</span>
              <LinkArrowIcon className="size-3" />
            </div>
          </div>
        </div>

        {/* Transfer CTA */}
        <div
          className="group relative overflow-hidden rounded-lg bg-grey-800 p-6 hover:bg-grey-700 transition-colors cursor-pointer"
          onClick={handleTransfer}
        >
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="text-gradient font-medium">
                Transfer {ticker}
              </span>
              <SendHorizonal className="size-4" />
            </div>
            <p className="text-sm text-mid mb-4">
              Send tokens to other addresses
            </p>
            <div className="flex items-center gap-1 text-sm text-low">
              <span>Send tokens</span>
              <LinkArrowIcon className="size-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showConnectModal && (
        <ConnectModal onClose={() => setShowConnectModal(false)} />
      )}
      {showJoinModal && (
        <StartGatewayModal onClose={() => setShowJoinModal(false)} />
      )}
      {showTransferModal && (
        <TransferArioModal onClose={() => setShowTransferModal(false)} />
      )}
    </div>
  );
};

export default CTASection;
