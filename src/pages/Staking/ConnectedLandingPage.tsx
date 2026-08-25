import { mARIOToken } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import ProtocolParametersCard from '@src/components/ProtocolParametersCard';
import useBalances from '@src/hooks/useBalances';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useWalletRewards from '@src/hooks/useWalletRewards';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useState } from 'react';
import DelegateStake from './DelegateStakeTable';
import MyRewardsPanel from './MyRewardsPanel';
import MyStakesTable from './MyStakesTable';

const TopPanel = ({
  title,
  value,
  ticker,
}: {
  title: string;
  value?: string;
  ticker: string;
}) => {
  return (
    <div className="rounded-xl border border-grey-600 px-6 pb-5 pt-10 text-center h-48 flex flex-col">
      <div className="text-sm text-mid">{title}</div>
      <div className="flex-grow flex items-center justify-center">
        <div className="flex items-baseline gap-2">
          <div className="text-[3.5rem] font-bold leading-none text-high">
            {value ?? (
              <div className="h-[3.5rem]">
                <Placeholder className="m-auto" />
              </div>
            )}
          </div>
          <div className="text-sm text-high">{ticker}</div>
        </div>
      </div>
    </div>
  );
};

const ConnectedLandingPage = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const [amountStaking, setAmountStaking] = useState<number>();

  const { data: balances } = useBalances(walletAddress);

  const { data: delegatedStakes } = useDelegateStakes(
    walletAddress?.toString(),
  );
  const { summary: rewards } = useWalletRewards();

  useEffect(() => {
    if (delegatedStakes) {
      const staked = delegatedStakes.stakes.reduce((acc, stake) => {
        return acc + stake.balance;
      }, 0);

      const withdrawing = delegatedStakes.withdrawals.reduce(
        (acc, withdrawal) => {
          return acc + withdrawal.balance;
        },
        0,
      );
      setAmountStaking(new mARIOToken(staked + withdrawing).toARIO().valueOf());
    }
  }, [delegatedStakes]);

  const topPanels = [
    {
      title: 'Your Balance',
      balance: balances ? formatWithCommas(balances.ario) : undefined,
    },
    {
      title: 'Amount Staking + Pending Withdrawals',
      balance:
        amountStaking !== undefined
          ? formatWithCommas(amountStaking)
          : undefined,
    },
    {
      title: 'Rewards Earned',
      // Lifetime, so it does not quietly reset when the published window rolls.
      balance: rewards
        ? formatWithCommas(Math.round(rewards.earned))
        : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {topPanels.map((panel, index) => (
          <TopPanel
            key={index}
            title={panel.title}
            value={panel.balance}
            ticker={ticker}
          />
        ))}
      </div>
      <MyRewardsPanel />
      {/* Connected delegators see no connect card, so the same limits and
          docs link reach them here. */}
      <ProtocolParametersCard
        variant="delegate"
        docsUrl="https://docs.ar.io/learn/oip/staking#delegated-staking"
      />
      <MyStakesTable />
      <DelegateStake />
    </div>
  );
};
export default ConnectedLandingPage;
