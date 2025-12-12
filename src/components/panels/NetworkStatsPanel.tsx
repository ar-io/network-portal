import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import { LinkArrowIcon } from '@src/components/icons';
import useAllBalances from '@src/hooks/useAllBalances';
import useAllDelegates from '@src/hooks/useAllDelegates';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';

const BRIDGE_BALANCE_ADDRESS = 'mFRKcHsO6Tlv2E2wZcrcbv3mmzxzD7vYPbyybI3KCVA';

interface StatItem {
  label: string;
  value: string | number;
  isLoading?: boolean;
  tooltip?: React.ReactNode;
}

const NetworkStatsPanel = () => {
  const { data: allBalances, isLoading: balancesLoading } = useAllBalances();
  const { data: allDelegates, isLoading: delegatesLoading } = useAllDelegates();
  const ticker = useGlobalState((state) => state.ticker);

  const bridgeBalance = allBalances?.find(
    (balance) => balance.address === BRIDGE_BALANCE_ADDRESS,
  );

  const stats: StatItem[] = [
    {
      label: 'Total Addresses',
      value: allBalances ? formatWithCommas(allBalances.length) : '-',
      isLoading: balancesLoading,
    },
    {
      label: 'Unique Delegates',
      value: allDelegates ? formatWithCommas(allDelegates.length) : '-',
      isLoading: delegatesLoading,
    },
    {
      label: 'Active Delegators',
      value: allDelegates
        ? formatWithCommas(new Set(allDelegates.map((d) => d.address)).size)
        : '-',
      isLoading: delegatesLoading,
    },
    {
      label: `Bridged ${ticker} (Base)`,
      value: bridgeBalance ? formatWithCommas(bridgeBalance.arioBalance) : '-',
      isLoading: balancesLoading,
      tooltip: (
        <div>
          <div>
            Total amount of {ticker} tokens that have been bridged to the Base
            network.
          </div>
          <div className="mt-2">
            <a
              href="https://basescan.org/token/0x138746adfa52909e5920def027f5a8dc1c7effb6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gradient hover:underline"
            >
              View Base token contract →
            </a>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col rounded-xl border border-grey-500">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-gradient text-sm font-semibold">
          Network Statistics
        </h3>
        <p className="mt-1 text-xs text-low">Key metrics for the network</p>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col">
            {stat.tooltip ? (
              <Tooltip message={stat.tooltip}>
                <span className="text-xs text-low cursor-help">
                  {stat.label}
                </span>
              </Tooltip>
            ) : (
              <span className="text-xs text-low">{stat.label}</span>
            )}
            {stat.isLoading ? (
              <Placeholder className="mt-1 h-6 w-20" />
            ) : stat.label.includes('Bridged') ? (
              <div className="flex items-center gap-2">
                <a
                  href="https://basescan.org/token/0x138746adfa52909e5920def027f5a8dc1c7effb6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-semibold text-high underline hover:text-primary transition-colors"
                  title="View on BaseScan"
                >
                  {stat.value}
                </a>
                <a
                  href="https://basescan.org/token/0x138746adfa52909e5920def027f5a8dc1c7effb6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mid hover:text-primary transition-colors"
                  title="View on BaseScan"
                >
                  <LinkArrowIcon className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <span className="text-2xl font-semibold text-high">
                {stat.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkStatsPanel;
