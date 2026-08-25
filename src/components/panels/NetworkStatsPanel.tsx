import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import { InfoIcon } from '@src/components/icons';
import useNetworkStats from '@src/hooks/useNetworkStats';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { ReactNode } from 'react';

interface StatItem {
  label: string;
  value: string | number;
  isLoading?: boolean;
  tooltip?: ReactNode;
}

const NetworkStatsPanel = () => {
  // One cached read instead of three whole-program scans. The panel used to
  // pull every balance, delegation and vault on the network — 1.6 MB, 52% of
  // the dashboard's bytes — purely to count them. See `useNetworkStats`.
  const { data: networkStats, isLoading } = useNetworkStats();
  const ticker = useGlobalState((state) => state.ticker);

  const stats: StatItem[] = [
    {
      label: 'Total Addresses',
      value: networkStats ? formatWithCommas(networkStats.totalAddresses) : '-',
      isLoading,
      tooltip: (
        <div>
          Total number of unique addresses holding {ticker} tokens on the
          network
        </div>
      ),
    },
    {
      label: 'Unique Delegates',
      value: networkStats
        ? formatWithCommas(networkStats.uniqueDelegates)
        : '-',
      isLoading,
      tooltip: (
        <div>
          Number of unique addresses that are delegating stake. Many addresses
          delegate to multiple gateways.
        </div>
      ),
    },
    {
      label: 'Total Vaults',
      value: networkStats ? formatWithCommas(networkStats.totalVaults) : '-',
      isLoading,
      tooltip: (
        <div>
          Total number of active vaults containing locked {ticker} tokens
          awaiting withdrawal
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-72 w-full flex-col rounded-xl border border-grey-500">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-mid">Network Statistics</h3>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs text-low">{stat.label}</span>
              {stat.tooltip && (
                <Tooltip message={stat.tooltip} side="right">
                  <InfoIcon className="h-3 w-3 text-low cursor-help" />
                </Tooltip>
              )}
            </div>
            {stat.isLoading ? (
              <Placeholder className="mt-1 h-6 w-20" />
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
