import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useProtocolBalance = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['protocolBalance', arIOReadSDK],
    queryFn: () => {
      if (arIOReadSDK) {
        return arIOReadSDK.getState().then((v) => {
          return arIOReadSDK.getBalance({
            address: (v as any).owner
          });
        });
      }
      throw new Error('Error: Arweave IO Read SDK is not initialized');
    },
  });

  return queryResults;
};

export default useProtocolBalance;
