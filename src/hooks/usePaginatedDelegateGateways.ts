import { AoARIORead, AoGatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import useProtocolBalance from './useProtocolBalance';

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

const usePaginatedDelegateGateways = (options: PaginationOptions = {}) => {
  const {
    page = 1,
    limit = 50,
    sortBy = 'totalDelegatedStake',
    sortOrder = 'desc',
  } = options;

  // Always apply filters for delegate staking gateways
  const delegateFilters = {
    status: 'joined' as const,
    'settings.allowDelegatedStaking': true,
  };

  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const fetchPaginatedDelegateGateways = async (
    arIOReadSDK: AoARIORead,
  ): Promise<PaginationResult<AoGatewayWithAddress>> => {
    // For pagination, we need to calculate the cursor position
    let currentCursor: string | undefined;
    let currentPage = 1;

    // If not on page 1, we need to skip to the correct page
    while (currentPage < page) {
      const pageResult = await arIOReadSDK.getGateways({
        cursor: currentCursor,
        limit,
        sortBy: sortBy as any, // Type assertion needed for SDK
        sortOrder,
        filters: delegateFilters,
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
      filters: delegateFilters,
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
      'paginatedDelegateGateways',
      page,
      limit,
      sortBy,
      sortOrder,
      arIOReadSDK,
    ],
    queryFn: () => {
      if (arIOReadSDK) {
        return fetchPaginatedDelegateGateways(arIOReadSDK);
      }
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
    enabled: !!arIOReadSDK,
  });

  return queryResults;
};

export default usePaginatedDelegateGateways;
