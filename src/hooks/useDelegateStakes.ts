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

      // Deliberately NOT served from the snapshot, unlike the other bulk
      // reads. `getDelegations` unions two account types keyed by the
      // delegator: `type: 'stake'` rows from DELEGATION accounts and
      // `type: 'vault'` rows from WITHDRAWAL accounts. `delegates.json` covers
      // only the stake half and carries no `type`, and `withdrawals.json`
      // cannot supply the other half because both public SDK projections drop
      // the withdrawal's `owner`. Rendering half a wallet's position is worse
      // than spending the call — and this is a memcmp-filtered read, not the
      // whole-program scan this service exists to displace.
      //
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
