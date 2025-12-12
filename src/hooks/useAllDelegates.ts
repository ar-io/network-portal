import { AoAllDelegates } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useAllDelegates = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  return useQuery<AoAllDelegates[]>({
    queryKey: ['allDelegates', arIOReadSDK],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      const allDelegates: AoAllDelegates[] = [];
      let hasNextPage = true;
      let cursor: string | undefined;
      const limit = 1000;

      // Fetch all delegates paginated 1k at a time
      while (hasNextPage) {
        const result = await arIOReadSDK.getAllDelegates({
          cursor,
          limit,
        });

        allDelegates.push(...result.items);
        hasNextPage = result.hasMore;
        cursor = result.nextCursor;
      }

      return allDelegates;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!arIOReadSDK,
  });
};

export default useAllDelegates;
