import { AoWalletVault } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useVaults = () => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery({
    queryKey: ['vaults', arioReadSDK],
    queryFn: async () => {
      if (!arioReadSDK)
        throw new Error('arIOReadSDK or walletAddress is not initialized');

      let cursor: string | undefined;
      let vaults: Array<AoWalletVault> = [];

      do {
        const pageResult = await arioReadSDK.getVaults({ cursor, limit: 1000 });
        vaults = vaults.concat(pageResult.items);
        cursor = pageResult.nextCursor;
      } while (cursor !== undefined);

      return vaults;
    },
    enabled: !!arioReadSDK,
    staleTime: Infinity,
  });
  return res;
};

export default useVaults;
