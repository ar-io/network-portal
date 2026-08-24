import { WalletVault, mARIOToken } from '@ar.io/sdk/web';
import { useCallback } from 'react';
import { useVaultsQuery } from './useVaultsQuery';

export interface VaultsSummary {
  address: string;
  vaultCount: number;
  totalVaultBalance: number;
}

/** Vaults aggregated per address. A view over the shared vaults query. */
const useAllVaults = () => {
  const select = useCallback((vaults: WalletVault[]) => {
    const vaultsByAddress = new Map<string, VaultsSummary>();

    for (const vault of vaults) {
      const existing = vaultsByAddress.get(vault.address) ?? {
        address: vault.address,
        vaultCount: 0,
        totalVaultBalance: 0,
      };

      existing.vaultCount += 1;
      existing.totalVaultBalance += new mARIOToken(vault.balance)
        .toARIO()
        .valueOf();

      vaultsByAddress.set(vault.address, existing);
    }

    return vaultsByAddress;
  }, []);

  return useVaultsQuery(select);
};

export default useAllVaults;
