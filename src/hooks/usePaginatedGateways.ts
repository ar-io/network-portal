import {
  AoARIORead,
  AoGatewayWithAddress,
  PaginationParams,
  PaginationResult,
} from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

interface PageBasedOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Extend SDK PaginationResult with page-based properties for UI convenience
type PageBasedPaginationResult<T> = PaginationResult<T> & {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
};

const usePaginatedGateways = (options: PageBasedOptions = {}) => {
  const {
    page = 1,
    limit = 50,
    sortBy = 'totalDelegatedStake',
    sortOrder = 'desc',
    filters,
  } = options;

  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const fetchPaginatedGateways = async (
    arIOReadSDK: AoARIORead,
  ): Promise<PageBasedPaginationResult<AoGatewayWithAddress>> => {
    const safeLimit =
      Number.isFinite(limit) && limit > 0 && limit <= 1000 ? limit : 1000;
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    let currentCursor: string | undefined;
    let currentPage = 1;

    // If not on page 1, we need to skip to the correct page
    while (currentPage < page) {
      const pageResult = await arIOReadSDK.getGateways({
        cursor: currentCursor,
        limit: safeLimit,
        sortBy: sortBy as any, // Type assertion needed for SDK
        sortOrder,
        filters,
      });

      if (pageResult.nextCursor) {
        currentCursor = pageResult.nextCursor;
        currentPage++;
      } else {
        // No more pages available
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
      sortBy: sortBy as any, // Type assertion needed for SDK
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
  };

  return useQuery({
    queryKey: [
      'paginatedGateways',
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
      arIOReadSDK,
    ],
    queryFn: () => {
      if (arIOReadSDK) {
        return fetchPaginatedGateways(arIOReadSDK);
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!arIOReadSDK,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export default usePaginatedGateways;
