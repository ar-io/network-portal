import Banner from './Banner';
import DelegateStake from './DelegateStakeTable';
import StakingInfoBanner from './StakingInfoBanner';

const NotConnectedLandingPage = () => {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <Banner />
      <StakingInfoBanner />
      <DelegateStake />
    </div>
  );
};

export default NotConnectedLandingPage;
