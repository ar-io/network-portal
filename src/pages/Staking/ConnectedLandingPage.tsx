import { mIOToken } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import StakingModal from '@src/components/modals/StakingModal';
import useGateways from '@src/hooks/useGateways';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useState } from 'react';
import ActiveStakes from './ActiveStakes';
import DelegateStake from './DelegateStakeTable';

const ConnectedLandingPage = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const [amountStaking, setAmountStaking] = useState<number>();

  const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);

  const { data: gateways } = useGateways();
  const balances = useGlobalState((state) => state.balances);

  useEffect(() => {
    if (gateways && walletAddress) {
      const amountStaking = Object.values(gateways).reduce((acc, gateway) => {
        const delegate = gateway.delegates[walletAddress.toString()];
        if (delegate) {
          return acc + delegate.delegatedStake;
        }
        return acc;
      }, 0);
      setAmountStaking(new mIOToken(amountStaking).toIO().valueOf());
    }
  }, [gateways, walletAddress]);

  const topPanels = [
    {
      title: 'Your Balance',
      balance: formatWithCommas(balances.io),
    },
    {
      title: 'Amount Staking',
      balance:
        amountStaking !== undefined
          ? formatWithCommas(amountStaking)
          : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="grid grid-cols-2 gap-6">
        {topPanels.map((panel, index) => (
          <div
            key={index}
            className="rounded-xl border border-grey-600 px-6 py-5 text-center"
          >
            <div className="text-sm text-mid">{panel.title}</div>
            <div className="m-auto my-3 flex w-fit gap-2">
              <div className="text-[2.6rem] leading-none text-high">
                {panel.balance ?? <Placeholder />}
              </div>
              <div className="text-sm text-high">{ticker}</div>
            </div>
          </div>
        ))}
      </div>
      <ActiveStakes />
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
