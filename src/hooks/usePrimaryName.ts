import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const usePrimaryName = (walletAddress?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery({
    queryKey: ['primaryName', walletAddress],
    queryFn: async () => {
      if (!walletAddress || !arIOReadSDK) {
        throw new Error('Wallet Address or SDK not available');
      }
      const primaryName = await arIOReadSDK.getPrimaryName({
        address: walletAddress.toString(),
      });
      return primaryName;
    },
  });

  return res;
};

export default usePrimaryName;
