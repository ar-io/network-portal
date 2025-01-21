import Header from '@src/components/Header';
import { useGlobalState } from '@src/store';
import ConnectedLandingPage from './ConnectedLandingPage';
import NotConnectedLandingPage from './NotConnectedLandingPage';

const Staking = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div className={'w-full'}>
      <Header />
      {walletAddress ? <ConnectedLandingPage /> : <NotConnectedLandingPage />}
    </div>
  );
};

export default Staking;
