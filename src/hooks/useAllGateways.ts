import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

interface UseAllGatewaysOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const useAllGateways = (options: UseAllGatewaysOptions = {}) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const { sortBy = 'totalDelegatedStake', sortOrder = 'desc' } = options;

  return useQuery<AoGatewayWithAddress[]>({
    queryKey: ['allGateways', arIOReadSDK, sortBy, sortOrder],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const allGateways: AoGatewayWithAddress[] = [];
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

      // if totalStake sorting, we need to do it client side because totalStake is not a field in the API
      if (sortBy === 'totalStake') {
        allGateways.sort((a, b) => {
          const stakeA = a.totalDelegatedStake + a.operatorStake;
          const stakeB = b.totalDelegatedStake + b.operatorStake;
          if (sortOrder === 'asc') {
            return stakeA - stakeB;
          } else {
            return stakeB - stakeA;
          }
        });
      }

      return allGateways;
    },
    staleTime: 60 * 60 * 1000,
    enabled: !!arIOReadSDK,
    placeholderData: (previousData) => previousData,
  });
};

export default useAllGateways;
