import { WalletVault } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useVaults = () => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: ['vaults', solanaRpcUrl],
    queryFn: async () => {
      if (!arioReadSDK) throw new Error('arIOReadSDK is not initialized');

      // The SDK paginates in memory, so a single call fetches the full set
      // with exactly one chain sweep.
      const pageResult = await arioReadSDK.getVaults({
        limit: Number.MAX_SAFE_INTEGER,
      });

      return pageResult.items as Array<WalletVault>;
    },
    enabled: !!arioReadSDK,
    staleTime: Infinity,
  });
  return res;
};

export default useVaults;
