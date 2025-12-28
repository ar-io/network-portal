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
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-4 px-4 lg:px-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 px-4 lg:px-6 py-2 overflow-scroll scrollbar scrollbar-thin">
        <div className="h-full">
          <div className="flex w-full flex-col gap-6 pb-46">
            {/* CTA Section at the top */}
            <CTASection />

            {/* Main Dashboard Content */}
            <div className="flex w-full flex-col gap-6 pb-46 lg:flex-row">
              <div className="flex flex-col gap-6">
                <IOTokenDistributionPanel />
                <NetworkStatsPanel />
              </div>

              <div className="flex grow flex-col gap-6 lg:min-w-[50rem]">
                <GatewaysInNetworkPanel
                  epochCount={epochCount}
                  onEpochCountChange={setEpochCount}
                />
                <div className="grid h-fit gap-6 lg:grid-cols-2">
                  <ObserverPerformancePanel
                    epochCount={epochCount}
                    onEpochCountChange={setEpochCount}
                  />
                  <ArNSStatsPanel
                    epochCount={epochCount}
                    onEpochCountChange={setEpochCount}
                  />
                </div>
                <RewardsDistributionPanel
                  epochCount={epochCount}
                  onEpochCountChange={setEpochCount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
