import { mIOToken } from '@ar.io/sdk/web';
import { NBSP } from '@src/constants';
import useEpochCountdown from '@src/hooks/useEpochCountdown';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { ReactNode } from 'react';
import Placeholder from './Placeholder';
import Profile from './Profile';

interface HeaderItemProps {
  value?: ReactNode;
  label: string;
  loading?: boolean;

  leftPadding?: boolean;
}

const HeaderItem = ({
  value,
  label,
  loading = false,
  leftPadding = true,
}: HeaderItemProps) => {
  return (
    <div
      className={`inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r ${leftPadding ? 'px-6' : 'pr-6'} dark:border-transparent-100-8`}
    >
      <div className="text-xs text-high">
        {loading ? (
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
  const blockHeight = useGlobalState((state) => state.blockHeight);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const epochCountdown = useEpochCountdown();
  const ticker = useGlobalState((state) => state.ticker);
  const { isLoading: gatewaysLoading, data: gateways } = useGateways();

  const { data: protocolBalance } = useProtocolBalance();

  return (
    <header className="mt-6 flex h-[4.5rem] rounded-xl border py-4 pl-6 pr-4 leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300">
      <HeaderItem
        value={currentEpoch?.epochIndex.toLocaleString('en-US')}
        label="AR.IO EPOCH"
        loading={!currentEpoch}
        leftPadding={false}
      />
      <HeaderItem
        value={epochCountdown}
        label="NEXT EPOCH"
        loading={!currentEpoch}
      />
      <HeaderItem
        value={blockHeight?.toLocaleString('en-US')}
        label="ARWEAVE BLOCK"
        loading={!blockHeight}
      />
      <HeaderItem
        value={gateways ? Object.keys(gateways).length : undefined}
        label="GATEWAYS"
        loading={gatewaysLoading}
      />
      <HeaderItem
        value={
          protocolBalance ? (
            <div>
              {formatWithCommas(new mIOToken(protocolBalance).toIO().valueOf())}{' '}
              {ticker}
            </div>
          ) : undefined
        }
        label="PROTOCOL BALANCE"
        loading={!protocolBalance}
      />
      <div className="grow" />
      <div className="content-center">
        <Profile />
      </div>
    </header>
  );
};

export default Header;
