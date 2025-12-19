import Header from '@src/components/Header';
import { useGlobalState } from '@src/store';
import ConnectedLandingPage from './ConnectedLandingPage';
import NotConnectedLandingPage from './NotConnectedLandingPage';

const Staking = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar scrollbar-thin">
          <div className="mb-6 flex flex-col gap-6 pt-0">
            {walletAddress ? (
              <ConnectedLandingPage />
            ) : (
              <NotConnectedLandingPage />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;
