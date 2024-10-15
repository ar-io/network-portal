import Header from '@src/components/Header';
import ArNSStatsPanel from './ArNSStatsPanel';
import IOTokenDistributionPanel from './IOTokenDistributionPanel';
import ObserverPerformancePanel from './ObserverPerformancePanel';
import RewardsDistributionPanel from './RewardsDistributionPanel';

const Dashboard = () => {
  return (
    <div className="flex size-full flex-col pr-6">
      <Header />
      <div className="flex w-full gap-6 py-6">
        <div className="flex flex-col gap-6">
          <IOTokenDistributionPanel />
        </div>

        <div className="flex min-w-[50rem] grow flex-col gap-6">
          <div className="grid h-fit grid-cols-2 gap-6">
            <ObserverPerformancePanel />
            <ArNSStatsPanel />
          </div>
          <RewardsDistributionPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
