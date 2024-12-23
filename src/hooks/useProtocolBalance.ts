import { ARIO_PROCESS_ID } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useProtocolBalance = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['protocolBalance'],
    queryFn: () => {
      if (arIOReadSDK) {
        return arIOReadSDK.getBalance({
          address: ARIO_PROCESS_ID.toString(),
        });
      }
      throw new Error('Error: ArIO Read SDK is not initialized');
    },
  });

  return queryResults;
};

export default useProtocolBalance;
