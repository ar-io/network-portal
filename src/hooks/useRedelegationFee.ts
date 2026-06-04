import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useRedelegationFee = (walletAddress?: string) => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: ['redelegationFee', walletAddress, solanaRpcUrl],
    queryFn: async () => {
      if (!arioReadSDK) throw new Error('arIOReadSDK not initialized');
      if (!walletAddress) throw new Error('walletAddress not initialized');

      return await arioReadSDK.getRedelegationFee({ address: walletAddress });
    },
    enabled: !!arioReadSDK && !!walletAddress,
  });
  return res;
};

export default useRedelegationFee;
