import { mIOToken } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import { PinkArrowIcon } from '@src/components/icons';
import StakingModal from '@src/components/modals/StakingModal';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useState } from 'react';
import ActiveStakes from './ActiveStakes';
import DelegateStake from './DelegateStakeTable';

const ConnectedLandingPage = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const [amountStaking, setAmountStaking] = useState<number>();

  const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);

  const { data: protocolBalance } = useProtocolBalance();
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
      title: 'Total Protocol Balance',
      balance:
        protocolBalance !== undefined
          ? formatWithCommas(new mIOToken(protocolBalance).toIO().valueOf())
          : undefined,
    },
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
    <div className="flex flex-col gap-[24px] py-[24px]">
      <div className="grid grid-cols-3 gap-[24px]">
        {topPanels.map((panel, index) => (
          <div
            key={index}
            className="rounded-xl border border-grey-600 px-[24px] py-[20px] text-center"
          >
            <div className="text-sm text-mid">{panel.title}</div>
            <div className="m-auto my-[12px] flex w-fit gap-[8px]">
              <div className="text-[42px] leading-none text-high">
                {panel.balance ?? <Placeholder />}
              </div>
              <div className="text-sm text-high">IO</div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="group relative h-[120px] w-full overflow-hidden rounded-xl bg-grey-800"
        onClick={() => {
          setIsStakingModalOpen(true);
        }}
      >
        <div
          className="invisible size-full rounded-xl
bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
        >
          <div className="size-full overflow-hidden rounded-xl bg-grey-800"></div>
        </div>
        <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-[24px] align-middle">
          <div className="flex items-center gap-[8px]">
            <div className="text-gradient">Delegate your Stake</div>{' '}
            <PinkArrowIcon />
          </div>

          <div className="pt-[8px] text-sm text-low">
            Quick Stake by entering a wallet address to delegate to.
          </div>
        </div>
      </button>
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
