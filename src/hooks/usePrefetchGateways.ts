import { useGlobalState } from '@src/store';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UsePrefetchGatewaysOptions {
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

const usePrefetchGateways = (options: UsePrefetchGatewaysOptions = {}) => {
  const queryClient = useQueryClient();
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const {
    limit = 50,
    sortBy = 'totalDelegatedStake',
    sortOrder = 'desc',
    filters,
  } = options;

  const prefetchPage = useCallback(
    async (page: number) => {
      if (!arIOReadSDK || page < 1) return;

      const queryKey = [
        'paginatedGateways',
        page,
        limit,
        sortBy,
        sortOrder,
        filters,
        solanaRpcUrl,
      ];

      // Only prefetch if not already cached or stale
      const existingData = queryClient.getQueryData(queryKey);

      // Don't prefetch if we already have data
      if (existingData) {
        return;
      }

      try {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: async () => {
            // Use the same fetch logic as usePaginatedGateways: the SDK
            // paginates in memory, so fetch everything in one chain sweep and
            // slice the requested page locally.
            const safeLimit =
              Number.isFinite(limit) && limit > 0 && limit <= 1000
                ? limit
                : 1000;
            const safePage = Number.isFinite(page) && page > 0 ? page : 1;

            const fullResult = await arIOReadSDK.getGateways({
              limit: Number.MAX_SAFE_INTEGER,
              sortBy: sortBy as any,
              sortOrder,
              filters,
            });

            const totalItems = fullResult.totalItems ?? fullResult.items.length;
            const totalPages = Math.ceil(totalItems / safeLimit);

            const startIndex = (safePage - 1) * safeLimit;
            const pageItems = fullResult.items.slice(
              startIndex,
              startIndex + safeLimit,
            );
            const hasNextPage = safePage < totalPages;

            return {
              items: pageItems,
              limit: safeLimit,
              totalItems,
              sortOrder: sortOrder as 'asc' | 'desc',
              hasMore: hasNextPage,
              currentPage: safePage,
              totalPages,
              hasNextPage,
            };
          },
          staleTime: 60 * 60 * 1000, // 1 hour
        });
      } catch (error) {
        // Silently fail prefetching to not disrupt user experience
        console.debug('Failed to prefetch gateways page:', page, error);
      }
    },
    [arIOReadSDK, solanaRpcUrl, limit, sortBy, sortOrder, filters, queryClient],
  );

  const prefetchNextPage = useCallback(
    (currentPage: number, totalPages: number) => {
      if (currentPage < totalPages) {
        prefetchPage(currentPage + 1);
      }
    },
    [prefetchPage],
  );

  const prefetchPreviousPage = useCallback(
    (currentPage: number) => {
      if (currentPage > 1) {
        prefetchPage(currentPage - 1);
      }
    },
    [prefetchPage],
  );

  const prefetchAdjacentPages = useCallback(
    (currentPage: number, totalPages: number) => {
      // Prefetch next page if it exists
      if (currentPage < totalPages) {
        prefetchPage(currentPage + 1);
      }
      // Prefetch previous page if it exists
      if (currentPage > 1) {
        prefetchPage(currentPage - 1);
      }
    },
    [prefetchPage],
  );

  return {
    prefetchPage,
    prefetchNextPage,
    prefetchPreviousPage,
    prefetchAdjacentPages,
  };
};

export default usePrefetchGateways;
