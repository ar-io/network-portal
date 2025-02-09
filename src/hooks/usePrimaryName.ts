import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const usePrimaryName = (walletAddress?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const arioProcessId = useGlobalState((state) => state.arioProcessId);

  const res = useQuery({
    queryKey: ['primaryName', walletAddress, arIOReadSDK, arioProcessId],
    queryFn: async () => {
      if (!walletAddress || !arIOReadSDK) {
        throw new Error('Wallet Address or SDK not available');
      }
      const primaryName = await arIOReadSDK.getPrimaryName({
        address: walletAddress.toString(),
      });
      return primaryName;
    },
    enabled: !!walletAddress && !!arIOReadSDK,
  });

  return res;
};

export default usePrimaryName;
