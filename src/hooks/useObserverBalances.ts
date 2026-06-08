import { address } from '@solana/kit';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

// Constant from @solana/web3.js - 1 billion lamports per SOL
const LAMPORTS_PER_SOL = 1000000000;

export type ObserverBalances = { sol: number; turboCredits: number };

const TURBO_API_URL = 'https://turbo.ardrive.io';

const useObserverBalances = (observerAddress?: string) => {
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery<ObserverBalances>({
    queryKey: ['observerBalances', observerAddress, solanaRpcUrl],
    queryFn: async () => {
      if (!observerAddress || !rpc) {
        throw new Error('Observer address or rpc is not initialized');
      }

      const balanceResult = await rpc
        .getBalance(address(observerAddress))
        .send();
      const solBalance = Number(balanceResult.value) / LAMPORTS_PER_SOL;

      try {
        const response = await fetch(
          `${TURBO_API_URL}/v1/account/balance?address=${observerAddress}`,
          {
            method: 'GET',
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch Turbo balance: ${response.statusText}`,
          );
        }

        const data = await response.json();
        const turboCredits = (data.balance || 0) / 1e12;

        return { sol: solBalance, turboCredits };
      } catch (error) {
        console.error('Error fetching Turbo balance:', error);
        return { sol: solBalance, turboCredits: 0 };
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!observerAddress && !!rpc,
  });

  return res;
};

export default useObserverBalances;
