import { AoBalanceWithAddress, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

export interface ProcessedBalance extends AoBalanceWithAddress {
  arioBalance: number;
}

interface UseAllBalancesOptions {
  sortBy?: 'balance' | 'address';
  sortOrder?: 'asc' | 'desc';
}

const useAllBalances = (options: UseAllBalancesOptions = {}) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const { sortBy = 'balance', sortOrder = 'desc' } = options;

  return useQuery<ProcessedBalance[]>({
    queryKey: ['allBalances', arIOReadSDK, sortBy, sortOrder],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const allBalances: AoBalanceWithAddress[] = [];
      let hasNextPage = true;
      let cursor: string | undefined;
      const limit = 1000;

      // Fetch all balances paginated 1k at a time with sorting
      while (hasNextPage) {
        const result = await arIOReadSDK.getBalances({
          cursor,
          limit,
          sortBy,
          sortOrder,
        });

        allBalances.push(...result.items);
        hasNextPage = result.hasMore;
        cursor = result.nextCursor;
      }

      // Convert mARIO to ARIO (no additional sorting since API handles it)
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
