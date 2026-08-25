import Header from '@src/components/Header';
import NetworkStatsPanel from '@src/components/panels/NetworkStatsPanel';
import CTASection from './CTASection';
import DecentralizationPanel from './DecentralizationPanel';
import GatewayVersionPanel from './GatewayVersionPanel';
import GeographyPanel from './GeographyPanel';
import IOTokenDistributionPanel from './IOTokenDistributionPanel';
import IndependencePanel from './IndependencePanel';
import ObserverPerformancePanel from './ObserverPerformancePanel';
import RewardsDistributionPanel from './RewardsDistributionPanel';

const Dashboard = () => {
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
            <div className="col-span-1 md:col-span-2">
              <NetworkStatsPanel />
            </div>
            <div className="col-span-1 md:col-span-2">
              <ObserverPerformancePanel />
            </div>
            {/* Places itself in the grid, so it occupies no cell when the
                analyzer has nothing to show. */}
            <GatewayVersionPanel />
            {/* Places itself in the grid, so it occupies no cell when the
                analyzer has nothing to show. */}
            <DecentralizationPanel />
            {/* Places itself in the grid, so it occupies no cell when the
                analyzer has nothing to show. */}
            <GeographyPanel />
            {/* Places itself in the grid, so it occupies no cell when the
                analyzer has nothing to show. */}
            <IndependencePanel />
            <div className="col-span-1 md:col-span-4">
              <RewardsDistributionPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
