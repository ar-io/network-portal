import Header from '@src/components/Header';
import { useGlobalState } from '@src/store';
import ConnectedLandingPage from './ConnectedLandingPage';
import NotConnectedLandingPage from './NotConnectedLandingPage';

const Staking = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div className="pl-4 lg:pl-6 flex h-full max-w-full flex-col">
      <div className="mb-4 shrink-0 pr-4 lg:pr-6">
        <Header />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar scrollbar-thin lg:pr-3">
        {walletAddress ? <ConnectedLandingPage /> : <NotConnectedLandingPage />}
      </div>
    </div>
  );
};

export default Staking;
