import Header from '@src/components/Header';
import IOTokenDistributionPanel from './IOTokenDistributionPanel';
import RewardsDistributionPanel from './RewardsDistributionPanel';

const Dashboard = () => {
  return (
    <div className="flex size-full flex-col pr-6">
      <Header />
      <div className="flex w-full gap-6 py-6">
        <div className="flex flex-col gap-6">
          <IOTokenDistributionPanel />
        </div>

        <div className="flex grow flex-col gap-6">
          <RewardsDistributionPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
