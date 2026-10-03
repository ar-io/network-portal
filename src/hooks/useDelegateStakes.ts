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
    /**
     * Refreshable, where this was `staleTime: Infinity`.
     *
     * A wallet's position changes underneath this list without the tab doing
     * anything: a full withdrawal empties the delegation and the program
     * closes the account in a SEPARATE transaction moments later, and the
     * same wallet may act from another tab or device. With an infinite stale
     * time — and the app-wide `refetchOnWindowFocus: false` and
     * `refetchOnReconnect: false` — nothing could ever refresh this but an
     * explicit invalidation in this tab, or a reload.
     *
     * A user then saw a stake that no longer existed, and every attempt to
     * withdraw it failed with `AccountNotInitialized` while the list kept
     * offering it. The post-write invalidation did fire and was correct at
     * the time: the account was still there, merely empty, and closed 27
     * seconds later.
     *
     * Cheap to re-read, so there is no reason to hold it: this is a
     * memcmp-filtered call for one delegator, not the whole-program scan the
     * snapshot service exists to displace.
     */
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!address && !!arIOReadSDK,
  });

  return res;
};

export default useDelegateStakes;
