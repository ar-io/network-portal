import { BalanceWithAddress, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { networkTierFromRpcUrl, snapshotOrRpc } from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

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

  // Sorting happens here rather than in the query key. The rows were always
  // re-sorted client-side anyway, so passing sort through to the SDK only
  // fragmented the cache — every column click missed and triggered another
  // whole-program scan to reorder data the browser already had.
  const select = useCallback(
    (balances: ProcessedBalance[]) => {
      const sorted = [...balances];

      sorted.sort((a, b) => {
        const valueA = sortBy === 'address' ? a.address : a.balance;
        const valueB = sortBy === 'address' ? b.address : b.balance;

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          const comparison = valueA.localeCompare(valueB);
          return sortOrder === 'asc' ? comparison : -comparison;
        }

        const comparison = Number(valueA) - Number(valueB);
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return sorted;
    },
    [sortBy, sortOrder],
  );

  return useQuery<ProcessedBalance[], Error, ProcessedBalance[]>({
    queryKey: ['allBalances', solanaRpcUrl],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const balances = await snapshotOrRpc<BalanceWithAddress>(
        'balances',
        networkTierFromRpcUrl(solanaRpcUrl),
        async () => {
          // The SDK fetches the entire dataset and paginates in memory, so
          // this is one whole-program scan. Keep it to a single cache entry.
          const result = await arIOReadSDK.getBalances({
            limit: Number.MAX_SAFE_INTEGER,
          });
          return result.items;
        },
      );

      // Both sources return mARIO, so the conversion happens once, here.
      return balances.map((item) => ({
        ...item,
        arioBalance: new mARIOToken(item.balance).toARIO().valueOf(),
      }));
    },
    select,
    staleTime: 5 * 60 * 1000,
    enabled: !!arIOReadSDK,
    placeholderData: (previousData) => previousData,
  });
};

export default useAllBalances;
