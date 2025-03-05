import { AoWalletVault } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { AoAddress } from '@src/types';
import { useQuery } from '@tanstack/react-query';

const useVaults = (walletAddress?: AoAddress) => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery({
    queryKey: ['vaults', arioReadSDK, walletAddress],
    queryFn: async () => {
      if (!arioReadSDK || !walletAddress)
        throw new Error('arIOReadSDK or walletAddress is not initialized');

      let cursor: string | undefined;
      let vaults: Array<AoWalletVault> = [];

      do {
        const pageResult = await arioReadSDK.getVaults({ cursor });
        vaults = vaults.concat(
          pageResult.items.filter((v) => v.address === walletAddress),
        );
        cursor = pageResult.nextCursor;
      } while (cursor !== undefined);

      return vaults;
    },
    enabled: !!arioReadSDK && !!walletAddress,
    staleTime: Infinity,
  });
  return res;
};

export default useVaults;
