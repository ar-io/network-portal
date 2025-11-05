import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const usePrimaryName = (walletAddress?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery({
    queryKey: ['primaryName', walletAddress, arIOReadSDK],
    queryFn: async () => {
      if (!walletAddress || !arIOReadSDK) {
        throw new Error('Wallet Address or SDK not available');
      }

      try {
        const primaryName = await arIOReadSDK.getPrimaryName({
          address: walletAddress.toString(),
        });
        return primaryName;
      } catch (_e) {
        // getPrimaryName throws exception if a name is not set for a wallet
        // catch and return null to prevent retrying
        return null;
      }
    },
    enabled: !!walletAddress && !!arIOReadSDK,
    staleTime: 5 * 60 * 1000,
  });

  return res;
};

export default usePrimaryName;
