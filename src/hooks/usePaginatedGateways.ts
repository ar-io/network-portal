import {
  ARIORead,
  GatewayWithAddress,
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
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const fetchPaginatedGateways = async (
    arIOReadSDK: ARIORead,
  ): Promise<PageBasedPaginationResult<GatewayWithAddress>> => {
    const safeLimit =
      Number.isFinite(limit) && limit > 0 && limit <= 1000 ? limit : 1000;
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;

    // The SDK fetches the entire dataset and paginates in memory, so we fetch
    // everything in a single chain sweep and slice the requested page locally.
    const fullResult = await arIOReadSDK.getGateways({
      limit: Number.MAX_SAFE_INTEGER,
      sortBy: sortBy as any, // Type assertion needed for SDK
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
  };

  return useQuery({
    queryKey: [
      'paginatedGateways',
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
      solanaRpcUrl,
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
