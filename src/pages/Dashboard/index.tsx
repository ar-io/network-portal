import Header from '@src/components/Header';
import NetworkStatsPanel from '@src/components/panels/NetworkStatsPanel';
import { useState } from 'react';
import ArNSStatsPanel from './ArNSStatsPanel';
import CTASection from './CTASection';
import GatewaysInNetworkPanel from './GatewaysInNetworkPanel';
import IOTokenDistributionPanel from './IOTokenDistributionPanel';
import ObserverPerformancePanel from './ObserverPerformancePanel';
import RewardsDistributionPanel from './RewardsDistributionPanel';

const Dashboard = () => {
  const [epochCount, setEpochCount] = useState(7); // Default to 1 week

  return (
    <div className="px-4 pb-4 lg:px-6 flex h-full max-w-full flex-col">
      <div className="mb-4 shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-scroll scrollbar scrollbar-thin">
        <div className="h-full w-full space-y-6">
          {/* CTA Section at the top */}
          <CTASection />

          {/* Main Dashboard Content */}
          <div className="w-full grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="col-span-1 md:col-span-2">
              <IOTokenDistributionPanel />
            </div>
            <div className="col-span-1 md:col-span-4">
              <GatewaysInNetworkPanel
                epochCount={epochCount}
                onEpochCountChange={setEpochCount}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <NetworkStatsPanel />
            </div>
            <div className="col-span-1 md:col-span-2">
              <ObserverPerformancePanel
                epochCount={epochCount}
                onEpochCountChange={setEpochCount}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <ArNSStatsPanel
                epochCount={epochCount}
                onEpochCountChange={setEpochCount}
              />
            </div>
            <div className="col-span-1 md:col-span-6">
              <RewardsDistributionPanel
                epochCount={epochCount}
                onEpochCountChange={setEpochCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
