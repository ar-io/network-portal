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

      const logoTxId = await antProcess.getLogo();

      const imgSrc = `https://arweave.net/${logoTxId}`;

      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imgSrc;
      });
    },
    enabled: !!primaryName && !!arIOReadSDK,
  });

  return queryResults;
};

export default useLogo;
