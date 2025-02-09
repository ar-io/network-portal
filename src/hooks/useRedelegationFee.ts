import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useRedelegationFee = (walletAddress?: string) => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const arioProcessId = useGlobalState((state) => state.arioProcessId);

  const res = useQuery({
    queryKey: ['redelegationFee', walletAddress, arioReadSDK, arioProcessId],
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
