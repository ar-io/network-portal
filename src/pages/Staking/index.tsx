import Header from '@src/components/Header';
import { useGlobalState } from '@src/store';
import ConnectedLandingPage from './ConnectedLandingPage';
import NotConnectedLandingPage from './NotConnectedLandingPage';

const Staking = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div
      className={
        walletAddress
          ? 'h-screen w-full overflow-y-scroll'
          : 'pb-[24px] flex size-full flex-col gap-[24px]'
      }
    >
      <Header />
      {walletAddress ? <ConnectedLandingPage /> : <NotConnectedLandingPage />}
    </div>
  );
};

export default Staking;
