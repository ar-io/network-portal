import { AoGatewayDelegate, mIOToken } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import StakingModal from '@src/components/modals/StakingModal';
import useGateways from '@src/hooks/useGateways';
import useRewardsEarned from '@src/hooks/useRewardsEarned';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useState } from 'react';
import DelegateStake from './DelegateStakeTable';
import MyStakesTable from './MyStakesTable';
import useBalances from '@src/hooks/useBalances';

const TopPanel = ({
  title,
  value,
  ticker,
  leftTitle,
  leftValue,
  rightTitle,
  rightValue,
}: {
  title: string;
  value?: string;
  ticker: string;
  leftTitle?: string;
  leftValue?: string;
  rightTitle?: string;
  rightValue?: string;
}) => {
  return (
    <div className="rounded-xl border border-grey-600 px-6 pb-5 pt-10 text-center">
      <div className="text-sm text-mid">{title}</div>
      <div className="mx-auto mb-1 mt-3 flex w-fit gap-2">
        <div className="text-[2.6rem] leading-none text-high">
          {value ?? <Placeholder />}
        </div>
        <div className="text-sm text-high">{ticker}</div>
      </div>
      <div className="flex justify-between align-bottom font-bold text-high">
        <div className="flex flex-col place-items-start text-left text-xs">
          <div className="grow" />
          {leftTitle &&
            (leftValue !== undefined ? (
              <>
                <div className="text-mid">{leftValue}</div>
                <div className="text-low">{leftTitle}</div>
              </>
            ) : (
              <Placeholder />
            ))}
        </div>
        <div className="flex flex-col place-items-end text-right text-xs">
          <div className="grow" />
          {rightTitle &&
            (rightValue !== undefined ? (
              <>
                <div className="text-mid">{rightValue}</div>
                <div className="text-low">{rightTitle}</div>
              </>
            ) : (
              <Placeholder />
            ))}
        </div>
      </div>
    </div>
  );
};

const ConnectedLandingPage = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const [amountStaking, setAmountStaking] = useState<number>();

  const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);

  const { data: gateways } = useGateways();
  const { data: balances }  = useBalances(walletAddress);
  const rewardsEarned = useRewardsEarned(walletAddress?.toString());

  useEffect(() => {
    if (gateways && walletAddress) {
      const amountStaking = Object.values(gateways).reduce((acc, gateway) => {
        const userDelegate:AoGatewayDelegate = gateway.delegates[walletAddress.toString()];
        const delegatedStake = userDelegate?.delegatedStake ?? 0;
        const withdrawn = userDelegate?.vaults
          ? Object.values(userDelegate.vaults).reduce((acc, withdrawal) => {
              return acc + withdrawal.balance;
            }, 0)
          : 0;

        return acc + delegatedStake + withdrawn;
      }, 0);
      setAmountStaking(new mIOToken(amountStaking).toIO().valueOf());
    }
  }, [gateways, walletAddress]);

  const topPanels = [
    {
      title: 'Your Balance',
      balance: balances ? formatWithCommas(balances.io) : undefined,
    },
    {
      title: 'Amount Staking + Pending Withdrawals',
      balance:
        amountStaking !== undefined
          ? formatWithCommas(amountStaking)
          : undefined,
    },
    {
      title: 'Total Rewards Earned (Last 14 Epochs)',
      balance:
        rewardsEarned?.totalForPastAvailableEpochs !== undefined
          ? formatWithCommas(rewardsEarned.totalForPastAvailableEpochs)
          : undefined,
      leftTitle: 'LAST EPOCH',
      leftValue:
        rewardsEarned?.previousEpoch !== undefined
          ? `${formatWithCommas(rewardsEarned.previousEpoch)} ${ticker}`
          : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="grid grid-cols-3 gap-6">
        {topPanels.map((panel, index) => (
          <TopPanel
            key={index}
            title={panel.title}
            value={panel.balance}
            ticker={ticker}
            leftTitle={panel.leftTitle}
            leftValue={panel.leftValue}
          />
        ))}
      </div>
      <MyStakesTable />
      <DelegateStake />
      {isStakingModalOpen && (
        <StakingModal
          open={isStakingModalOpen}
          onClose={() => setIsStakingModalOpen(false)}
        />
      )}
    </div>
  );
};
export default ConnectedLandingPage;
