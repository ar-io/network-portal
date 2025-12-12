import { useGlobalState } from '@src/store';
import { useQueries } from '@tanstack/react-query';

export const usePrimaryNames = (
  addresses: string[],
): Map<string, string | null> => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const uniqueAddresses = Array.from(new Set(addresses.filter(Boolean)));

  const queries = useQueries({
    queries: uniqueAddresses.map((address) => ({
      queryKey: ['primaryName', address, arIOReadSDK],
      queryFn: async () => {
        if (!arIOReadSDK) {
          throw new Error('SDK not available');
        }
        try {
          const primaryName = await arIOReadSDK.getPrimaryName({
            address: address.toString(),
          });
          return { address, primaryName: primaryName?.name || null };
        } catch (_e) {
          // getPrimaryName throws exception if a name is not set
          return { address, primaryName: null };
        }
      },
      enabled: !!arIOReadSDK && !!address,
      staleTime: 4 * 60 * 60 * 1000, // 4 hours
    })),
  });

  const nameMap = new Map<string, string | null>();

  queries.forEach((query) => {
    if (query.data) {
      nameMap.set(query.data.address, query.data.primaryName);
    }
  });

  return nameMap;
};
