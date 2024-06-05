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
            // using 'as any' to read owner property from the object 
            // The value exists in the object but is not currently specified in ar.io SDK ArIOState type 
            address: (v as any).owner as string
          });
        });
      }
      throw new Error('Error: Arweave IO Read SDK is not initialized');
    },
  });

  return queryResults;
};

export default useProtocolBalance;
