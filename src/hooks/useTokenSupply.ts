import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useTokenSupply = () => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: ['tokenSupply', solanaRpcUrl],
    queryFn: () => {
      if (!arioReadSDK) throw new Error('arIOReadSDK not initialized');
      return arioReadSDK.getTokenSupply();
    },
    enabled: !!arioReadSDK,
    staleTime: Infinity,
  });
  return res;
};

export default useTokenSupply;
