import { mARIOToken } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import useBalances from '@src/hooks/useBalances';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateway from '@src/hooks/useGateway';
import useVaults from '@src/hooks/useVaults';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const MyBalancesPanel = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const navigate = useNavigate();

  const { data: balances, isLoading: balancesLoading } =
    useBalances(walletAddress);
  const { data: allVaults, isLoading: vaultsLoading } = useVaults();
  const { data: delegations, isLoading: delegationsLoading } =
    useDelegateStakes(walletAddress?.toString());
  const {
    data: gateway,
    isLoading: gatewayLoading,
    isFetched: gatewayFetched,
  } = useGateway({
    ownerWalletAddress: walletAddress?.toString(),
  });

  const walletVaults = useMemo(() => {
    if (!allVaults || !walletAddress) return [];
    return allVaults.filter(
      (vault) => vault.controller === walletAddress.toString(),
    );
  }, [allVaults, walletAddress]);

  const calculatedBalances = useMemo(() => {
    const liquid = balances?.ario || 0;

    const delegated =
      delegations?.stakes.reduce((acc, stake) => {
        return acc + new mARIOToken(stake.balance).toARIO().valueOf();
      }, 0) || 0;

    const withdrawing =
      delegations?.withdrawals.reduce((acc, withdrawal) => {
        return acc + new mARIOToken(withdrawal.balance).toARIO().valueOf();
      }, 0) || 0;

    const operator = gatewayFetched
      ? gateway
        ? new mARIOToken(gateway.operatorStake).toARIO().valueOf()
        : 0
      : 0;

    const locked = walletVaults.reduce((acc, vault) => {
      return acc + new mARIOToken(vault.balance).toARIO().valueOf();
    }, 0);

    const total = liquid + delegated + withdrawing + operator + locked;

    return {
      liquid,
      delegated,
      withdrawing,
      operator,
      locked,
      total,
    };
  }, [balances?.ario, delegations, gateway, gatewayFetched, walletVaults]);

  const handleVaultClick = () => {
    if (walletAddress) {
      navigate(`/balances/${walletAddress}`);
    }
  };

  const isLoading =
    balancesLoading || vaultsLoading || delegationsLoading || gatewayLoading;

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="flex w-full flex-col rounded-xl border border-grey-500">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-gradient text-sm font-semibold">
          My {ticker} Balances
        </h3>
        <p className="mt-1 text-xs text-low">Your wallet balances and stakes</p>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-5">
        {/* Total Balance - Featured at top */}
        <div className="flex flex-col border-b border-grey-600 pb-3">
          <span className="text-xs text-low">Total {ticker}</span>
          {isLoading ? (
            <Placeholder className="mt-1 h-6 w-24" />
          ) : (
            <span className="text-2xl font-semibold text-gradient">
              {formatWithCommas(calculatedBalances.total)}
            </span>
          )}
        </div>

        {/* Liquid Balance */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-low">Liquid</span>
          {isLoading ? (
            <Placeholder className="h-4 w-16" />
          ) : (
            <span className="text-sm font-semibold text-high">
              {formatWithCommas(calculatedBalances.liquid)}
            </span>
          )}
        </div>

        {/* Delegated Balance */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-low">Delegated</span>
          {isLoading ? (
            <Placeholder className="h-4 w-16" />
          ) : (
            <span className="text-sm font-semibold text-high">
              {formatWithCommas(calculatedBalances.delegated)}
            </span>
          )}
        </div>

        {/* Operator Balance */}
        {(calculatedBalances.operator > 0 || gatewayLoading) && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-low">Operator</span>
            {isLoading ? (
              <Placeholder className="h-4 w-16" />
            ) : (
              <span className="text-sm font-semibold text-high">
                {formatWithCommas(calculatedBalances.operator)}
              </span>
            )}
          </div>
        )}

        {/* Withdrawing Balance */}
        {(calculatedBalances.withdrawing > 0 || delegationsLoading) && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-low">Withdrawing</span>
            {isLoading ? (
              <Placeholder className="h-4 w-16" />
            ) : (
              <span className="text-sm font-semibold text-high">
                {formatWithCommas(calculatedBalances.withdrawing)}
              </span>
            )}
          </div>
        )}

        {/* Vault Balance - Clickable */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-low">
            Locked ({walletVaults.length} vault
            {walletVaults.length !== 1 ? 's' : ''})
          </span>
          {isLoading ? (
            <Placeholder className="h-4 w-16" />
          ) : (
            <button
              onClick={handleVaultClick}
              className="text-sm font-semibold text-primary hover:text-high transition-colors underline"
              title="Click to view vaults"
            >
              {formatWithCommas(calculatedBalances.locked)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBalancesPanel;
