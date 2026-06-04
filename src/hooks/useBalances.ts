import { mARIOToken } from '@ar.io/sdk/web';
import { address } from '@solana/kit';
import { useGlobalState } from '@src/store';
import { AoAddress } from '@src/types';
import { useQuery } from '@tanstack/react-query';

// Constant from @solana/web3.js - 1 billion lamports per SOL
const LAMPORTS_PER_SOL = 1000000000;

export type Balances = { sol: number; ario: number };

const useBalances = (walletAddress?: AoAddress) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery<Balances>({
    queryKey: ['balances', walletAddress, solanaRpcUrl],
    refetchInterval: 2 * 60 * 1000, // Refresh balances every 2 minutes
    queryFn: async () => {
      if (!walletAddress || !rpc || !arIOReadSDK) {
        throw new Error(
          'Error: Wallet Address, rpc, or arIOReadSDK is not initialized',
        );
      }

      const [mioBalance, lamports] = await Promise.all([
        arIOReadSDK.getBalance({ address: walletAddress.toString() }),
        rpc.getBalance(address(walletAddress.toString())).send(),
      ]);

      const solBalance = Number(lamports.value) / LAMPORTS_PER_SOL;
      const ioBalance = new mARIOToken(mioBalance).toARIO().valueOf();

      return { sol: solBalance, ario: ioBalance };
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!walletAddress && !!rpc && !!arIOReadSDK,
  });

  return res;
};

export default useBalances;
