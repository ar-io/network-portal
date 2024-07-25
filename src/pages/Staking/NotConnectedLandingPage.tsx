import Banner from './Banner';
import DelegateStake from './DelegateStakeTable';

const NotConnectedLandingPage = () => {

  return (
    <div className="flex max-w-full flex-col gap-6 overflow-y-auto py-6 scrollbar">
      <Banner />
      <DelegateStake />
    </div>
  );
};

export default NotConnectedLandingPage;
