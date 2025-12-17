import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import { InfoIcon, LinkArrowIcon } from '@src/components/icons';
import {
  BASE_TOKEN_CONTRACT_URL,
  BRIDGE_BALANCE_ADDRESS,
} from '@src/constants';
import useAllBalances from '@src/hooks/useAllBalances';
import useAllDelegates from '@src/hooks/useAllDelegates';
import useAllVaults from '@src/hooks/useAllVaults';
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
  const { data: allBalances, isLoading: balancesLoading } = useAllBalances();
  const { data: allDelegates, isLoading: delegatesLoading } = useAllDelegates();
  const { data: vaultsByAddress, isLoading: vaultsLoading } = useAllVaults();
  const ticker = useGlobalState((state) => state.ticker);

  const bridgeBalance = allBalances?.find(
    (balance) => balance.address === BRIDGE_BALANCE_ADDRESS,
  );

  // Calculate total vaults
  const totalVaults = vaultsByAddress
    ? Array.from(vaultsByAddress.values()).reduce(
        (acc, summary) => acc + summary.vaultCount,
        0,
      )
    : 0;

  const stats: StatItem[] = [
    {
      label: 'Total Addresses',
      value: allBalances ? formatWithCommas(allBalances.length) : '-',
      isLoading: balancesLoading,
      tooltip: (
        <div>
          Total number of unique addresses holding {ticker} tokens on the
          network
        </div>
      ),
    },
    {
      label: 'Unique Delegates',
      value: allDelegates
        ? formatWithCommas(new Set(allDelegates.map((d) => d.address)).size)
        : '-',
      isLoading: delegatesLoading,
      tooltip: (
        <div>
          Number of unique addresses that are delegating stake. Many addresses
          delegate to multiple gateways.
        </div>
      ),
    },
    {
      label: 'Total Vaults',
      value: totalVaults ? formatWithCommas(totalVaults) : '-',
      isLoading: vaultsLoading,
      tooltip: (
        <div>
          Total number of active vaults containing locked {ticker} tokens
          awaiting withdrawal
        </div>
      ),
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
              href={BASE_TOKEN_CONTRACT_URL}
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
            ) : stat.label.includes('Bridged') ? (
              <div className="flex items-center gap-2">
                <a
                  href={BASE_TOKEN_CONTRACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-semibold text-high underline hover:text-primary transition-colors"
                >
                  {stat.value}
                </a>
                <a
                  href={BASE_TOKEN_CONTRACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mid hover:text-primary transition-colors"
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
