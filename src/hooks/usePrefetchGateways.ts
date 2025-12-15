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
        arIOReadSDK,
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
            // Use the same fetch logic as usePaginatedGateways
            const safeLimit =
              Number.isFinite(limit) && limit > 0 && limit <= 1000
                ? limit
                : 1000;
            const safePage = Number.isFinite(page) && page > 0 ? page : 1;
            let currentCursor: string | undefined;
            let currentPage = 1;

            // Skip to the correct page
            while (currentPage < page) {
              const pageResult = await arIOReadSDK.getGateways({
                cursor: currentCursor,
                limit: safeLimit,
                sortBy: sortBy as any,
                sortOrder,
                filters,
              });

              if (pageResult.nextCursor) {
                currentCursor = pageResult.nextCursor;
                currentPage++;
              } else {
                return {
                  items: [],
                  limit: safeLimit,
                  totalItems: pageResult.totalItems,
                  sortOrder: sortOrder as 'asc' | 'desc',
                  hasMore: false,
                  currentPage: safePage,
                  totalPages: Math.ceil(pageResult.totalItems / safeLimit),
                  hasNextPage: false,
                };
              }
            }

            // Fetch the target page
            const pageResult = await arIOReadSDK.getGateways({
              cursor: currentCursor,
              limit: safeLimit,
              sortBy: sortBy as any,
              sortOrder,
              filters,
            });

            const totalPages = Math.ceil(pageResult.totalItems / limit);

            return {
              ...pageResult,
              currentPage: page,
              totalPages,
              hasNextPage: !!pageResult.nextCursor,
            };
          },
          staleTime: 60 * 60 * 1000, // 1 hour
        });
      } catch (error) {
        // Silently fail prefetching to not disrupt user experience
        console.debug('Failed to prefetch gateways page:', page, error);
      }
    },
    [arIOReadSDK, limit, sortBy, sortOrder, filters, queryClient],
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
