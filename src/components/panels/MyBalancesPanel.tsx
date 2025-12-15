import { mARIOToken } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import useBalances from '@src/hooks/useBalances';
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

  const walletVaults = useMemo(() => {
    if (!allVaults || !walletAddress) return [];

    return allVaults.filter(
      (vault) => vault.controller === walletAddress.toString(),
    );
  }, [allVaults, walletAddress]);

  const vaultBalance = useMemo(() => {
    return walletVaults.reduce((total, vault) => {
      return total + new mARIOToken(vault.balance).toARIO().valueOf();
    }, 0);
  }, [walletVaults]);

  const totalBalance = (balances?.ario || 0) + vaultBalance;

  const handleVaultClick = () => {
    if (walletAddress) {
      navigate(`/balances/${walletAddress}`);
    }
  };

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="flex w-full flex-col rounded-xl border border-grey-500">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-gradient text-sm font-semibold">
          My {ticker} Balances
        </h3>
        <p className="mt-1 text-xs text-low">Your wallet balances and vaults</p>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5">
        {/* Liquid Balance */}
        <div className="flex flex-col">
          <span className="text-xs text-low">Liquid {ticker}</span>
          {balancesLoading ? (
            <Placeholder className="mt-1 h-6 w-20" />
          ) : (
            <span className="text-2xl font-semibold text-high">
              {balances?.ario ? formatWithCommas(balances.ario) : '0'}
            </span>
          )}
        </div>

        {/* Vault Balance */}
        <div className="flex flex-col">
          <span className="text-xs text-low">
            Vault {ticker} ({walletVaults.length} vault
            {walletVaults.length !== 1 ? 's' : ''})
          </span>
          {vaultsLoading ? (
            <Placeholder className="mt-1 h-6 w-20" />
          ) : (
            <button
              onClick={handleVaultClick}
              className="text-left text-2xl font-semibold text-primary hover:text-high transition-colors underline"
              title="Click to view vaults"
            >
              {formatWithCommas(vaultBalance)}
            </button>
          )}
        </div>

        {/* Total Balance */}
        <div className="flex flex-col border-t border-grey-600 pt-4">
          <span className="text-xs text-low">Total {ticker}</span>
          {balancesLoading || vaultsLoading ? (
            <Placeholder className="mt-1 h-6 w-24" />
          ) : (
            <span className="text-2xl font-semibold text-gradient">
              {formatWithCommas(totalBalance)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBalancesPanel;
