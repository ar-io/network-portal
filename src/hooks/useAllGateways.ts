import { GatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

interface UseAllGatewaysOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const getNestedValue = (obj: Record<string, any>, path: string) =>
  path.split('.').reduce((value, key) => value?.[key], obj);

const compareValues = (
  valueA: string | number | undefined,
  valueB: string | number | undefined,
) => {
  if (valueA == null && valueB == null) return 0;
  if (valueA == null) return 1;
  if (valueB == null) return -1;

  if (typeof valueA === 'number' && typeof valueB === 'number') {
    return valueA - valueB;
  }

  return String(valueA).localeCompare(String(valueB));
};

const useAllGateways = (options: UseAllGatewaysOptions = {}) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const { sortBy = 'totalDelegatedStake', sortOrder = 'desc' } = options;

  return useQuery<GatewayWithAddress[]>({
    queryKey: ['allGateways', arIOReadSDK, sortBy, sortOrder],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const allGateways: GatewayWithAddress[] = [];
      let hasNextPage = true;
      let cursor: string | undefined;
      const limit = 1000;

      // Fetch all gateways paginated 1k at a time with sorting
      while (hasNextPage) {
        const result = await arIOReadSDK.getGateways({
          cursor,
          limit,
          sortBy: sortBy as any,
          sortOrder,
        });

        allGateways.push(...result.items);
        hasNextPage = result.hasMore;
        cursor = result.nextCursor;
      }

      allGateways.sort((a, b) => {
        const valueA =
          sortBy === 'totalStake'
            ? a.totalDelegatedStake + a.operatorStake
            : (getNestedValue(a as Record<string, any>, sortBy) as
                | string
                | number
                | undefined);
        const valueB =
          sortBy === 'totalStake'
            ? b.totalDelegatedStake + b.operatorStake
            : (getNestedValue(b as Record<string, any>, sortBy) as
                | string
                | number
                | undefined);

        const comparison = compareValues(valueA, valueB);
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return allGateways;
    },
    staleTime: 60 * 60 * 1000,
    enabled: !!arIOReadSDK,
    placeholderData: (previousData) => previousData,
  });
};

export default useAllGateways;
