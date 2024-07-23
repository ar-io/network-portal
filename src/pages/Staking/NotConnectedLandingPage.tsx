import Banner from './Banner';
import DelegateStake from './DelegateStakeTable';

const NotConnectedLandingPage = () => {

  return (
    <div className="flex max-w-full flex-col gap-[24px] overflow-y-auto py-6 pr-[24px] scrollbar">
      <Banner />
      <DelegateStake />
    </div>
  );
};

export default NotConnectedLandingPage;
