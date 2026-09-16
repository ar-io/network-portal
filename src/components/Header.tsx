import { mARIOToken } from '@ar.io/sdk/web';
import { NBSP } from '@src/constants';
import useEpochCountdown from '@src/hooks/useEpochCountdown';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { ReactNode, useMemo } from 'react';
import Placeholder from './Placeholder';
import Profile from './Profile';

interface HeaderItemProps {
  value?: ReactNode;
  label: string;
  loading?: boolean;
  /** The read failed, so render text rather than a skeleton that never lands. */
  unavailable?: boolean;

  leftPadding?: boolean;
}

const HeaderItem = ({
  value,
  label,
  loading = false,
  unavailable = false,
  leftPadding = true,
}: HeaderItemProps) => {
  return (
    <div
      className={`inline-flex  h-[2.375rem] flex-col items-start justify-start gap-1 border-r lg:block ${leftPadding ? 'px-6' : 'pr-6'} dark:border-transparent-100-8`}
    >
      <div className="text-xs text-high">
        {unavailable ? (
          // A skeleton promises arrival. Once the read has failed, nothing is
          // coming, and shimmering forever is the more misleading of the two.
          <span className="text-low" title="Could not be read from the network">
            Unavailable
          </span>
        ) : loading ? (
          <Placeholder className="h-[1.0625rem]" />
        ) : value !== undefined ? (
          typeof value === 'number' ? (
            value.toLocaleString('en-US')
          ) : (
            value
          )
        ) : (
          NBSP
        )}
      </div>
      <div className="pt-1 text-xs leading-none text-low">{label}</div>
    </div>
  );
};

const Header = () => {
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const epochLoadFailed = useGlobalState((state) => state.epochLoadFailed);
  const epochCountdown = useEpochCountdown();
  const ticker = useGlobalState((state) => state.ticker);
  const { isLoading: gatewaysLoading, data: gateways } = useGateways();

  const { data: protocolBalance, isError: protocolBalanceError } =
    useProtocolBalance();

  const { data: epochSettings } = useEpochSettings();

  const currentEpochLabel = useMemo(() => {
    if (currentEpoch) {
      return currentEpoch?.epochIndex.toLocaleString('en-US');
    } else if (epochSettings && !epochSettings.hasEpochZeroStarted) {
      return 'Awaiting first epoch';
    } else {
      return undefined;
    }
  }, [currentEpoch, epochSettings]);

  return (
    <header className="z-30 mt-5 flex pl-6 leading-[1.4] lg:mt-6 lg:h-[4.5rem] lg:rounded-xl lg:border lg:py-4 lg:pr-4 dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <div className="hidden lg:flex">
        <HeaderItem
          value={currentEpochLabel}
          label="AR.IO EPOCH"
          loading={currentEpochLabel === undefined && !epochLoadFailed}
          unavailable={currentEpochLabel === undefined && epochLoadFailed}
          leftPadding={false}
        />
        <HeaderItem
          value={epochCountdown}
          label="NEXT EPOCH"
          loading={epochCountdown === undefined && !epochLoadFailed}
          unavailable={epochCountdown === undefined && epochLoadFailed}
        />
        <HeaderItem
          value={
            gateways
              ? Object.entries(gateways).filter(
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  ([_address, gateway]) => gateway.status === 'joined',
                ).length
              : undefined
          }
          label="GATEWAYS"
          loading={gatewaysLoading}
        />
        <HeaderItem
          value={
            protocolBalance ? (
              <div>
                {formatWithCommas(
                  new mARIOToken(protocolBalance).toARIO().valueOf(),
                )}{' '}
                {ticker}
              </div>
            ) : undefined
          }
          label="PROTOCOL BALANCE"
          loading={!protocolBalance && !protocolBalanceError}
          unavailable={!protocolBalance && protocolBalanceError}
        />
      </div>
      <div className="grow" />
      <div className="content-center">
        <Profile />
      </div>
    </header>
  );
};

export default Header;
