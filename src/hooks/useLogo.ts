import { ANT } from '@ar.io/sdk/web';
import { address } from '@solana/kit';
import { SOLANA_ANT_PROGRAM_ID } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useLogo = ({ primaryName }: { primaryName?: string }) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const rpc = useGlobalState((state) => state.rpc);

  const queryResults = useQuery({
    queryKey: ['logo', primaryName, arIOReadSDK],
    queryFn: async () => {
      if (!primaryName || !arIOReadSDK) {
        throw new Error('Primary Name or ArIO Read SDK not available');
      }
      const record = await arIOReadSDK.getArNSRecord({ name: primaryName });

      if (!record?.processId) {
        return undefined;
      }

      const antProcess = await ANT.init({
        backend: 'solana',
        processId: record.processId,
        rpc,
        ...(SOLANA_ANT_PROGRAM_ID
          ? { antProgramId: address(SOLANA_ANT_PROGRAM_ID) }
          : {}),
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
    staleTime: 5 * 60 * 1000,
  });

  return queryResults;
};

export default useLogo;
