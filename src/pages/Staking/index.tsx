import Header from '@src/components/Header';
import ProtocolParametersCard from '@src/components/ProtocolParametersCard';
import { useGlobalState } from '@src/store';
import ConnectedLandingPage from './ConnectedLandingPage';
import NotConnectedLandingPage from './NotConnectedLandingPage';

const Staking = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div className="px-4 lg:px-6 flex h-full max-w-full flex-col">
      <div className="mb-4 shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-scroll scrollbar scrollbar-thin">
        <div className="mb-6">
          <ProtocolParametersCard variant="delegate" />
        </div>
        {walletAddress ? <ConnectedLandingPage /> : <NotConnectedLandingPage />}
      </div>
    </div>
  );
};

export default Staking;
