import Header from '@src/components/Header';
import ArNSStatsPanel from './ArNSStatsPanel';
import GatewaysInNetworkPanel from './GatewaysInNetworkPanel';
import IOTokenDistributionPanel from './IOTokenDistributionPanel';
import ObserverPerformancePanel from './ObserverPerformancePanel';
import RewardsDistributionPanel from './RewardsDistributionPanel';

const Dashboard = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="flex flex-col gap-6 py-6 md:flex-row">
        <div className="flex flex-col gap-6 md:w-1/3">
          <IOTokenDistributionPanel />
        </div>

        <div className="flex grow flex-col gap-6 md:min-w-[50rem]">
          <GatewaysInNetworkPanel />
          <div className="grid h-fit grid-cols-1 gap-6 md:grid-cols-2">
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
