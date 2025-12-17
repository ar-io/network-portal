import Header from '@src/components/Header';
import BalanceFragmentationChart from '@src/components/charts/BalanceFragmentationChart';
import NetworkStatsPanel from '@src/components/panels/NetworkStatsPanel';
import ArNSStatsPanel from './ArNSStatsPanel';
import GatewaysInNetworkPanel from './GatewaysInNetworkPanel';
import IOTokenDistributionPanel from './IOTokenDistributionPanel';
import ObserverPerformancePanel from './ObserverPerformancePanel';
import RewardsDistributionPanel from './RewardsDistributionPanel';

const Dashboard = () => {
  return (
    <div className="flex h-full max-w-full flex-col pb-6">
      <div className="mb-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar scrollbar-thin">
          <div className="flex w-full flex-col gap-6 pt-0 lg:flex-row">
            <div className="flex flex-col gap-6">
              <IOTokenDistributionPanel />
              <NetworkStatsPanel />
            </div>

            <div className="flex grow flex-col gap-6 lg:min-w-[50rem]">
              <GatewaysInNetworkPanel />
              <div className="grid h-fit gap-6 lg:grid-cols-2">
                <ObserverPerformancePanel />
                <ArNSStatsPanel />
              </div>
              <RewardsDistributionPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
