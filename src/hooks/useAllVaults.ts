import { WalletVault, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

export interface VaultsSummary {
  address: string;
  vaultCount: number;
  totalVaultBalance: number;
}

const useAllVaults = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  return useQuery<Map<string, VaultsSummary>>({
    queryKey: ['allVaults', solanaRpcUrl],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const vaultsByAddress = new Map<string, VaultsSummary>();

      // The SDK paginates in memory, so a single call fetches the full set
      // with exactly one chain sweep.
      const result = await arIOReadSDK.getVaults({
        limit: Number.MAX_SAFE_INTEGER,
      });

      // Process each vault
      result.items.forEach((vault: WalletVault) => {
        const existing = vaultsByAddress.get(vault.address) || {
          address: vault.address,
          vaultCount: 0,
          totalVaultBalance: 0,
        };

        existing.vaultCount += 1;
        existing.totalVaultBalance += new mARIOToken(vault.balance)
          .toARIO()
          .valueOf();

        vaultsByAddress.set(vault.address, existing);
      });

      return vaultsByAddress;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!arIOReadSDK,
  });
};

export default useAllVaults;
