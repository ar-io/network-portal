import { ANT } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useLogo = ({ primaryName }: { primaryName?: string }) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['logo', primaryName],
    queryFn: async () => {
      if (!primaryName || !arIOReadSDK) {
        throw new Error('Primary Name or ArIO Read SDK not available');
      }
      const record = await arIOReadSDK.getArNSRecord({ name: primaryName });

      if (!record?.processId) {
        return undefined;
      }

      const antProcess = ANT.init({
        processId: record.processId,
      });

      return await antProcess.getLogo();
    },
    enabled: !!primaryName && !!arIOReadSDK,
  });

  return queryResults;
};

export default useLogo;
