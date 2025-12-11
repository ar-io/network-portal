import Header from '@src/components/Header';
import BalanceFragmentationChart from '@src/components/charts/BalanceFragmentationChart';
import NetworkStatsPanel from '@src/components/panels/NetworkStatsPanel';
import { useGlobalState } from '@src/store';
import BalancesTable from './BalancesTable';
import Banner from './Banner';
import VaultsTable from './VaultsTable';

const Balances = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col gap-6 pb-6">
            <div className="flex gap-6">
              <BalanceFragmentationChart />
              <NetworkStatsPanel />
            </div>
            {walletAddress && (
              <>
                <Banner walletAddress={walletAddress} showActions={true} />
                <VaultsTable walletAddress={walletAddress} />
              </>
            )}
            <BalancesTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balances;
