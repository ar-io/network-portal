import { BalanceWithAddress, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

export interface ProcessedBalance extends BalanceWithAddress {
  arioBalance: number;
}

interface UseAllBalancesOptions {
  sortBy?: 'balance' | 'address';
  sortOrder?: 'asc' | 'desc';
}

const useAllBalances = (options: UseAllBalancesOptions = {}) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const { sortBy = 'balance', sortOrder = 'desc' } = options;

  return useQuery<ProcessedBalance[]>({
    queryKey: ['allBalances', solanaRpcUrl, sortBy, sortOrder],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      // The SDK fetches the entire dataset and paginates in memory, so a
      // single call requesting everything performs exactly one chain sweep.
      const result = await arIOReadSDK.getBalances({
        limit: Number.MAX_SAFE_INTEGER,
        sortBy,
        sortOrder,
      });

      const allBalances: BalanceWithAddress[] = [...result.items];

      allBalances.sort((a, b) => {
        const valueA = sortBy === 'address' ? a.address : a.balance;
        const valueB = sortBy === 'address' ? b.address : b.balance;

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          const comparison = valueA.localeCompare(valueB);
          return sortOrder === 'asc' ? comparison : -comparison;
        }

        const comparison = Number(valueA) - Number(valueB);
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      // Convert mARIO to ARIO after ordering to keep server/client behavior consistent.
      return allBalances.map((item) => ({
        ...item,
        arioBalance: new mARIOToken(item.balance).toARIO().valueOf(),
      }));
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!arIOReadSDK,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new sort/filter
  });
};

export default useAllBalances;
