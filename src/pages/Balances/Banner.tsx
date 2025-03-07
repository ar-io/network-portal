import { mARIOToken } from '@ar.io/sdk/web';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArioCoinIcon,
  ObserversBgIcon,
  ObserversConnectIcon,
  ThreeDotsIcon,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import WalletAddressModal from '@src/components/modals/WalletAddressModal';
import Placeholder from '@src/components/Placeholder';
import useBalances from '@src/hooks/useBalances';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateway from '@src/hooks/useGateway';
import useVaults from '@src/hooks/useVaults';
import { useGlobalState } from '@src/store';
import { AoAddress } from '@src/types';
import { formatWithCommas } from '@src/utils';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const Banner = ({
  walletAddress,
  showActions = false,
}: {
  walletAddress?: AoAddress;
  showActions?: boolean;
}) => {
  const navigate = useNavigate();

  const ticker = useGlobalState((state) => state.ticker);
  const loggedinWalletAddress = useGlobalState((state) => state.walletAddress);
  const { data: balances } = useBalances(walletAddress);

  const [loginOpen, setLoginOpen] = useState(false);

  const { data: delegations } = useDelegateStakes(walletAddress?.toString());
  const { data: gateway, isFetched: gatewayFetched } = useGateway({
    ownerWalletAddress: walletAddress?.toString(),
  });
  const { data: vaults } = useVaults();

  const [showWalletAddressModal, setShowWalletAddressModal] = useState(false);

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

    const locked = vaults
      ?.filter((vault) => vault.address === walletAddress?.toString())
      .reduce((acc, vault) => {
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
  }, [
    balances?.ario,
    delegations?.stakes,
    delegations?.withdrawals,
    gateway,
    gatewayFetched,
    vaults,
    walletAddress,
  ]);

  return (
    <div>
      {!walletAddress ? (
        <div>
          <button
            className="group relative h-[7.5rem] w-full overflow-hidden rounded-xl bg-grey-800"
            onClick={() => {
              setLoginOpen(true);
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
                <div className="text-gradient">
                  Login to see your balances
                </div>{' '}
              </div>

              <div className="pt-2 text-sm text-low">
                See your liquid, staked, operator, and locked ${ticker} token
                balances.
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="relative h-[7.5rem] w-full overflow-hidden rounded-xl border border-grey-800">
          <div className="absolute top-0 z-10 flex size-full flex-col bg-transparent py-6 align-middle">
            {showActions && (
              <div className="absolute right-4">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger
                    asChild
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <div className="cursor-pointer rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start to-btn-primary-outer-gradient-end p-px">
                      <div className="inline-flex size-full items-center justify-start gap-[0.6875rem] rounded-md bg-btn-primary-base bg-gradient-to-b from-btn-primary-gradient-start to-btn-primary-gradient-end px-[0.3125rem] py-[.3125rem] shadow-inner">
                        <ThreeDotsIcon className="size-4" />
                      </div>
                    </div>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    className="z-50 rounded border border-grey-500 bg-containerL0 text-sm"
                    align="end"
                  >
                    <DropdownMenu.Item
                      className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowWalletAddressModal(true);
                      }}
                    >
                      View balances for another address
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            )}

            <div className="flex items-center gap-3 pl-6">
              <ArioCoinIcon className="size-6" />
              <div className="group-hover:text-gradient text-sm text-high">
                {walletAddress.toString() ==
                  loggedinWalletAddress?.toString() && 'My '}
                ${ticker} Balances
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
            </div>
          </div>
        </div>
      )}
      {loginOpen && <ConnectModal onClose={() => setLoginOpen(false)} />}
      {showWalletAddressModal && (
        <WalletAddressModal
          onClose={() => setShowWalletAddressModal(false)}
          onSuccess={(walletAddress) => {
            navigate(`/balances/${walletAddress}`);
          }}
        />
      )}
    </div>
  );
};

export default Banner;
