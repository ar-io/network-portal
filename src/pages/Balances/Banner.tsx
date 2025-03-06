import { mARIOToken } from '@ar.io/sdk/web';
import {
  ArioCoinIcon,
  ObserversBgIcon,
  ObserversConnectIcon,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StartGatewayModal from '@src/components/modals/StartGatewayModal';
import Placeholder from '@src/components/Placeholder';
import useBalances from '@src/hooks/useBalances';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateway from '@src/hooks/useGateway';
import useVaults from '@src/hooks/useVaults';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useMemo, useState } from 'react';

const InfoSection = ({ label, value }: { label: string; value?: string }) => {
  return (
    <div className="inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r px-12 text-left dark:border-transparent-100-8">
      <div className="pt-1 text-xs leading-none text-low">{label}</div>
      <div className="text-nowrap text-xs text-mid">
        {value !== undefined ? value : <Placeholder className="w-12" />}
      </div>
    </div>
  );
};

type Balance = {
  label: string;
  value?: string;
};

const Banner = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const { data: balances } = useBalances(walletAddress);

  const [loginOpen, setLoginOpen] = useState(false);
  const [startGatewayOpen, setStartGatewayOpen] = useState(false);

  const { data: delegations } = useDelegateStakes(walletAddress?.toString());
  const { data: gateway, isFetched: gatewayFetched } = useGateway({
    ownerWalletAddress: walletAddress?.toString(),
  });
  const { data: vaults } = useVaults(walletAddress);

  const myBalances: Balance[] = useMemo(() => {
    const delegated = delegations?.stakes.reduce((acc, stake) => {
      return acc + new mARIOToken(stake.balance).toARIO().valueOf();
    }, 0);

    const withdrawing = delegations?.withdrawals.reduce((acc, withdrawal) => {
      return acc + new mARIOToken(withdrawal.balance).toARIO().valueOf();
    }, 0);

    const operator = gatewayFetched
      ? gateway
        ? new mARIOToken(gateway.operatorStake).toARIO().valueOf()
        : 0
      : undefined;

    const locked = vaults?.reduce((acc, vault) => {
      return acc + new mARIOToken(vault.balance).toARIO().valueOf();
    }, 0);

    const liquid = balances?.ario;

    const total =
      liquid !== undefined &&
      delegated !== undefined &&
      operator !== undefined &&
      withdrawing !== undefined &&
      locked !== undefined
        ? liquid + delegated + operator + withdrawing + locked
        : undefined;

    return [
      {
        label: 'Total',
        value: total !== undefined ? formatWithCommas(total) : undefined,
      },
      {
        label: 'Liquid',
        value: liquid !== undefined ? formatWithCommas(liquid) : undefined,
      },
      {
        label: 'Delegated',
        value:
          delegated !== undefined ? formatWithCommas(delegated) : undefined,
      },
      {
        label: 'Operator',
        value: operator !== undefined ? formatWithCommas(operator) : undefined,
      },
      {
        label: 'Withdrawing',
        value:
          withdrawing !== undefined ? formatWithCommas(withdrawing) : undefined,
      },
      {
        label: 'Locked',
        value: locked !== undefined ? formatWithCommas(locked) : undefined,
      },
    ];
  }, [balances, delegations, gateway, gatewayFetched, vaults]);

  return (
    <div>
      {!walletAddress ? (
        <div>
          <button
            className="group relative h-[7.5rem] w-full overflow-hidden rounded-xl bg-grey-800"
            onClick={() => {
              if (!walletAddress) {
                setLoginOpen(true);
              } else {
                setStartGatewayOpen(true);
              }
            }}
          >
            <div
              className="invisible size-full rounded-xl
       bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
            >
              <div className="size-full overflow-hidden rounded-xl bg-grey-800">
                <ObserversBgIcon className="relative left-[calc(4rem-1px)]  top-[calc(2rem-1px)] z-0 opacity-10" />
              </div>
            </div>
            <ObserversBgIcon className="visible absolute left-16 top-8 z-0 opacity-10  group-hover:invisible" />
            <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-6 align-middle">
              <div className="flex items-center gap-2">
                <ObserversConnectIcon className="size-4" />
                <div className="text-gradient">Connect your wallet</div>{' '}
              </div>

              <div className="pt-2 text-sm text-low">
                Login to view your observer status.
              </div>
            </div>
          </button>
        </div>
      ) : balances ? (
        <div className="relative h-[7.5rem] w-full overflow-hidden rounded-xl border border-grey-800">
          <div className="absolute top-0 z-10 flex size-full flex-col bg-transparent py-6 align-middle">
            <div className="flex items-center gap-3 pl-6">
              <ArioCoinIcon className="size-6" />
              <div className="group-hover:text-gradient text-sm text-high">
                My ${ticker} Balances
              </div>
            </div>
            <div className="mt-3 flex pl-1.5">
              {myBalances.map((balance, i) => (
                <InfoSection
                  key={i}
                  label={balance.label}
                  value={balance.value}
                />
              ))}
              {/* <InfoSection
                label="Observer Address"
                value={formatAddress(gateway.observerAddress)}
              />
              <InfoSection label="Status" value={prescribedStatus} />
              {myObserver && (
                <>
                  <InfoSection
                    label="Observation Chance"
                    value={
                      myObserver
                        ? formatPercentage(myObserver.normalizedCompositeWeight)
                        : 'N/A'
                    }
                  />
                  <InfoSection
                    label="Observer Performance"
                    value={
                      myObserver
                        ? formatPercentage(myObserver.observerPerformanceRatio)
                        : 'N/A'
                    }
                  />
                  <InfoSection
                    label="Failed Gateways"
                    value={numFailedGatewaysFound.toString()}
                  /> */}
              {/* </>
              )} */}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-[7.5rem] w-full justify-center overflow-hidden rounded-xl bg-grey-800 ">
          <div className="h-full content-center text-center text-sm text-low">
            Loading balances...
          </div>
        </div>
      )}
      {loginOpen && <ConnectModal onClose={() => setLoginOpen(false)} />}
      {startGatewayOpen && (
        <StartGatewayModal onClose={() => setStartGatewayOpen(false)} />
      )}
    </div>
  );
};

export default Banner;
