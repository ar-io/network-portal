import { UserWithdrawal } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useWithdrawals = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  return useQuery<Array<UserWithdrawal>>({
    queryKey: ['withdrawals', solanaRpcUrl, address],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      // The SDK paginates in memory, so a single call fetches the full set
      // with exactly one chain sweep.
      const pageResult = await arIOReadSDK.getWithdrawals({
        address,
        limit: Number.MAX_SAFE_INTEGER,
      });

      return pageResult.items;
    },
    enabled: !!address && !!arIOReadSDK,
    staleTime: 5 * 60 * 1000,
  });
};

export default useWithdrawals;
