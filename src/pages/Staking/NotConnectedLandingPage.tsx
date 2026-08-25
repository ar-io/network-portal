import Banner from './Banner';
import DelegateStake from './DelegateStakeTable';

const NotConnectedLandingPage = () => {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <Banner />
      <DelegateStake />
    </div>
  );
};

export default NotConnectedLandingPage;
