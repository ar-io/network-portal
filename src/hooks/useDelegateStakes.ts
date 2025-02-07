import { AoStakeDelegation, AoVaultDelegation } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

type DelegateStakes = {
  stakes: Array<AoStakeDelegation>;
  withdrawals: Array<AoVaultDelegation>;
};

const useDelegateStakes = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery<DelegateStakes>({
    queryKey: ['delegateStakes', arIOReadSDK, address],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      const retVal: DelegateStakes = {
        stakes: [],
        withdrawals: [],
      };

      let cursor: string | undefined;

      do {
        const pageResult = await arIOReadSDK.getDelegations({
          address,
          cursor,
          limit: 100,
        });

        pageResult.items.forEach((d) => {
          if (d.type === 'stake') {
            retVal.stakes.push(d);
          } else {
            retVal.withdrawals.push(d);
          }
        });
        cursor = pageResult.nextCursor;
      } while (cursor !== undefined);

      return retVal;
    },
    staleTime: Infinity,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useDelegateStakes;
