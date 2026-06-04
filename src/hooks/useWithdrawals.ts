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

      const withdrawals: Array<UserWithdrawal> = [];
      let cursor: string | undefined;

      do {
        const pageResult = await arIOReadSDK.getWithdrawals({
          address,
          cursor,
          limit: 100,
        });

        withdrawals.push(...pageResult.items);
        cursor = pageResult.nextCursor;
      } while (cursor !== undefined);

      return withdrawals;
    },
    enabled: !!address && !!arIOReadSDK,
    staleTime: 5 * 60 * 1000,
  });
};

export default useWithdrawals;
