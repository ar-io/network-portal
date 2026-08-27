import { AllDelegates } from '@ar.io/sdk/web';
import { usePortalProgramIds } from '@src/hooks/usePortalProgramIds';
import { useGlobalState } from '@src/store';
import { networkTierFromRpcUrl, snapshotOrRpc } from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

const useAllDelegates = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const portalProgramIds = usePortalProgramIds();
  return useQuery<AllDelegates[]>({
    // NOTE: still invalidated by nothing — a write to a delegation does not
    // refresh this table, it just ages out after `staleTime`. Left alone
    // deliberately: connecting it means adding whole-program scan triggers to
    // the staking flows, which is its own change with its own cost.
    queryKey: ['allDelegates', solanaRpcUrl],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK is not initialized');
      }

      return snapshotOrRpc<AllDelegates>(
        'delegates',
        networkTierFromRpcUrl(solanaRpcUrl),
        async () => {
          // The SDK paginates in memory, so a single call fetches the full set
          // with exactly one chain sweep.
          const result = await arIOReadSDK.getAllDelegates({
            limit: Number.MAX_SAFE_INTEGER,
          });
          return result.items;
        },
        portalProgramIds,
      );
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!arIOReadSDK,
  });
};

export default useAllDelegates;
