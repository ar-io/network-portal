import { mARIOToken } from '@ar.io/sdk/web';
import { AR } from '@src/constants';
import { useGlobalState } from '@src/store';
import { AoAddress } from '@src/types';
import { useQuery } from '@tanstack/react-query';

export type Balances = { ar: number; ario: number };

const useBalances = (walletAddress?: AoAddress) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const arweave = useGlobalState((state) => state.arweave);
  const blockHeight = useGlobalState((state) => state.blockHeight);

  const res = useQuery<Balances>({
    queryKey: ['balances', arIOReadSDK, arweave, walletAddress, blockHeight],
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

      return { ar: arBalance, ario: ioBalance };
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!walletAddress && !!arweave && !!arIOReadSDK,
  });

  return res;
};

export default useBalances;
