import Header from '@src/components/Header';
import BalanceFragmentationChart from '@src/components/charts/BalanceFragmentationChart';
import MyBalancesPanel from '@src/components/panels/MyBalancesPanel';
import NetworkStatsPanel from '@src/components/panels/NetworkStatsPanel';
import { useGlobalState } from '@src/store';
import BalancesTable from './BalancesTable';

const Balances = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-4 px-4 lg:px-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 px-4 lg:px-6 py-2 overflow-scroll scrollbar scrollbar-thin">
        <div className="flex flex-col gap-6 pb-6">
          <div
            className={`grid grid-cols-1 ${walletAddress ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}
          >
            <BalanceFragmentationChart />
            <NetworkStatsPanel />
            {walletAddress && <MyBalancesPanel />}
          </div>
          <BalancesTable />
        </div>
      </div>
    </div>
  );
};

export default Balances;
