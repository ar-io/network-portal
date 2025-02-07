import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useTokenSupply = () => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const res = useQuery({
    queryKey: ['tokenSupply'],
    queryFn: () => {
      if (!arioReadSDK) throw new Error('arIOReadSDK not initialized');
      return arioReadSDK.getTokenSupply();
    },
    enabled: !!arioReadSDK,
  });
  return res;
};

export default useTokenSupply;
