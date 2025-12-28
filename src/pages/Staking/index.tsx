import Header from '@src/components/Header';
import { useGlobalState } from '@src/store';
import ConnectedLandingPage from './ConnectedLandingPage';
import NotConnectedLandingPage from './NotConnectedLandingPage';

const Staking = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-4 px-4 lg:px-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 px-4 lg:px-6 py-2 overflow-scroll scrollbar scrollbar-thin">
        {walletAddress ? <ConnectedLandingPage /> : <NotConnectedLandingPage />}
      </div>
    </div>
  );
};

export default Staking;
