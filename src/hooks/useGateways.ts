import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGateways = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['gateways'],
    queryFn: () => {
      if (arIOReadSDK) {
        return arIOReadSDK.getGateways();
      }
    },
  });

  return queryResults;
};

export default useGateways;
