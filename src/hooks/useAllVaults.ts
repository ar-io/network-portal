import { AoWalletVault, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

export interface VaultsSummary {
  address: string;
  vaultCount: number;
  totalVaultBalance: number;
}

const useAllVaults = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  return useQuery<Map<string, VaultsSummary>>({
    queryKey: ['allVaults', arIOReadSDK],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const vaultsByAddress = new Map<string, VaultsSummary>();
      let hasNextPage = true;
      let cursor: string | undefined;
      const limit = 1000;

      // Fetch all vaults paginated
      while (hasNextPage) {
        const result = await arIOReadSDK.getVaults({
          cursor,
          limit,
        });

        // Process each vault
        result.items.forEach((vault: AoWalletVault) => {
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

        hasNextPage = result.hasMore;
        cursor = result.nextCursor;
      }

      return vaultsByAddress;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!arIOReadSDK,
  });
};

export default useAllVaults;
