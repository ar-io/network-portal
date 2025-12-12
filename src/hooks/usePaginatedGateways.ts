import { AoARIORead, AoGatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

interface PaginationResult<T> {
  items: T[];
  hasNextPage: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  nextCursor?: string;
}

const usePaginatedGateways = (options: PaginationOptions = {}) => {
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
  ): Promise<PaginationResult<AoGatewayWithAddress>> => {
    // For pagination, we need to calculate the cursor position
    // Since SDK uses cursor-based pagination, we'll need to fetch pages sequentially
    let currentCursor: string | undefined;
    let currentPage = 1;
    let currentCursor: string | undefined;
    let currentPage = 1;

    // If not on page 1, we need to skip to the correct page
    while (currentPage < page) {
      const pageResult = await arIOReadSDK.getGateways({
        cursor: currentCursor,
        limit,
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
          hasNextPage: false,
          currentPage: page,
          itemsPerPage: limit,
          totalItems: 0,
          totalPages: 0,
        };
      }
    }

    // Fetch the target page
    const pageResult = await arIOReadSDK.getGateways({
      cursor: currentCursor,
      limit,
      sortBy: sortBy as any, // Type assertion needed for SDK
      sortOrder,
      filters,
    });

    const totalPages = Math.ceil(pageResult.totalItems / limit);

    return {
      items: pageResult.items,
      hasNextPage: !!pageResult.nextCursor,
      currentPage: page,
      itemsPerPage: limit,
      totalItems: pageResult.totalItems,
      totalPages,
      nextCursor: pageResult.nextCursor,
    };
  };

  const queryResults = useQuery({
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!arIOReadSDK,
  });

  return queryResults;
};

export default usePaginatedGateways;
