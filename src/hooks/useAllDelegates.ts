import { AllDelegates } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useAllDelegates = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  return useQuery<AllDelegates[]>({
    queryKey: ['allDelegates', solanaRpcUrl],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      // The SDK paginates in memory, so a single call fetches the full set
      // with exactly one chain sweep.
      const result = await arIOReadSDK.getAllDelegates({
        limit: Number.MAX_SAFE_INTEGER,
      });

      return result.items;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!arIOReadSDK,
  });
};

export default useAllDelegates;
