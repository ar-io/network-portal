import { mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UsePrefetchBalancesOptions {
  sortBy?: 'balance' | 'address';
  sortOrder?: 'asc' | 'desc';
}

const usePrefetchBalances = (_options: UsePrefetchBalancesOptions = {}) => {
  const queryClient = useQueryClient();
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const prefetchBalances = useCallback(
    async (
      targetSortBy: 'balance' | 'address',
      targetSortOrder: 'asc' | 'desc',
    ) => {
      if (!arIOReadSDK) return;

      const queryKey = [
        'allBalances',
        arIOReadSDK,
        targetSortBy,
        targetSortOrder,
      ];

      // Only prefetch if not already cached
      const existingData = queryClient.getQueryData(queryKey);

      // Don't prefetch if we already have data
      if (existingData) {
        return;
      }

      try {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: async () => {
            const allBalances: any[] = [];
            let hasNextPage = true;
            let cursor: string | undefined;
            const limit = 1000;

            // Fetch all balances paginated with the target sort
            while (hasNextPage) {
              const result = await arIOReadSDK.getBalances({
                cursor,
                limit,
                sortBy: targetSortBy,
                sortOrder: targetSortOrder,
              });

              allBalances.push(...result.items);
              hasNextPage = result.hasMore;
              cursor = result.nextCursor;
            }

            // Convert mARIO to ARIO
            return allBalances.map((item) => ({
              ...item,
              arioBalance: new mARIOToken(item.balance).toARIO().valueOf(),
            }));
          },
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      } catch (error) {
        // Silently fail prefetching to not disrupt user experience
        console.debug(
          'Failed to prefetch balances:',
          targetSortBy,
          targetSortOrder,
          error,
        );
      }
    },
    [arIOReadSDK, queryClient],
  );

  const prefetchNextSort = useCallback(
    (
      currentSortBy: 'balance' | 'address',
      currentSortOrder: 'asc' | 'desc',
    ) => {
      // Prefetch the opposite sort order for the same column
      const oppositeSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
      prefetchBalances(currentSortBy, oppositeSortOrder);

      // Also prefetch the other sortable column
      const otherSortBy = currentSortBy === 'balance' ? 'address' : 'balance';
      prefetchBalances(otherSortBy, currentSortOrder);
    },
    [prefetchBalances],
  );

  return {
    prefetchBalances,
    prefetchNextSort,
  };
};

export default usePrefetchBalances;
