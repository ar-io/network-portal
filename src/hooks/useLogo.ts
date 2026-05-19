import { ANT } from '@ar.io/sdk/web';
import { address } from '@solana/kit';
import { useGlobalState } from '@src/store';
import { useSettings } from '@src/store';
import { getOptionalSolanaAddress } from '@src/utils/solanaAddress';
import { useQuery } from '@tanstack/react-query';

const useLogo = ({ primaryName }: { primaryName?: string }) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaAntProgramId = useSettings((state) => state.solanaAntProgramId);
  const antProgramId = getOptionalSolanaAddress(solanaAntProgramId);

  const queryResults = useQuery({
    queryKey: ['logo', primaryName, arIOReadSDK, antProgramId],
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
        ...(antProgramId ? { antProgramId: address(antProgramId) } : {}),
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
