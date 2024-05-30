import Header from '@src/components/Header';
import { useGlobalState } from '@src/store';
import ConnectedLandingPage from './ConnectedLandingPage';
import NotConnectedLandingPage from './NotConnectedLandingPage';

const Staking = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div className="h-screen overflow-y-scroll">
      <Header />
      <div>
        {walletAddress ? <ConnectedLandingPage /> : <NotConnectedLandingPage />}
      </div>
    </div>
  );
};

export default Staking;
