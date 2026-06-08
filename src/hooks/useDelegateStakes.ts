import { StakeDelegation, VaultDelegation } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

type DelegateStakes = {
  stakes: Array<StakeDelegation>;
  withdrawals: Array<VaultDelegation>;
};

const useDelegateStakes = (address?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery<DelegateStakes>({
    queryKey: ['delegateStakes', solanaRpcUrl, address],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is not set');
      }

      const retVal: DelegateStakes = {
        stakes: [],
        withdrawals: [],
      };

      // The SDK paginates in memory, so a single call fetches the full set
      // with exactly one chain sweep.
      const pageResult = await arIOReadSDK.getDelegations({
        address,
        limit: Number.MAX_SAFE_INTEGER,
      });

      pageResult.items.forEach((d) => {
        if (d.type === 'stake') {
          retVal.stakes.push(d);
        } else {
          retVal.withdrawals.push(d);
        }
      });

      return retVal;
    },
    staleTime: Infinity,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useDelegateStakes;
