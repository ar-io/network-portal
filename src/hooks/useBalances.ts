import { mARIOToken } from '@ar.io/sdk/web';
import { AR } from '@src/constants';
import { useGlobalState } from '@src/store';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import { useQuery } from '@tanstack/react-query';

export type Balances = { ar: number; io: number };

const useBalances = (walletAddress?: ArweaveTransactionID) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const arweave = useGlobalState((state) => state.arweave);
  const blockHeight = useGlobalState((state) => state.blockHeight);

  const res = useQuery<Balances>({
    queryKey: ['balances', arIOReadSDK, arweave, blockHeight, walletAddress],
    queryFn: async () => {
      if (!walletAddress || !arweave || !arIOReadSDK) {
        throw new Error(
          'Error: Wallet Address, arweave, or arIOReadSDK is not initialized',
        );
      }

      const [mioBalance, winstonBalance] = await Promise.all([
        arIOReadSDK.getBalance({ address: walletAddress.toString() }),
        arweave.wallets.getBalance(walletAddress.toString()),
      ]);

      const arBalance = +AR.winstonToAr(winstonBalance);
      const ioBalance = new mARIOToken(mioBalance).toARIO().valueOf();

      return { ar: arBalance, io: ioBalance };
    },
    staleTime: 5 * 60 * 1000,
  });

  return res;
};

export default useBalances;
