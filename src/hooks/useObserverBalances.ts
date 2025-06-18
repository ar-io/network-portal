import { AR } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

export type ObserverBalances = { ar: number; turboCredits: number };

const TURBO_API_URL = 'https://turbo.ardrive.io';

const useObserverBalances = (observerAddress?: string) => {
  const arweave = useGlobalState((state) => state.arweave);
  const blockHeight = useGlobalState((state) => state.blockHeight);

  const res = useQuery<ObserverBalances>({
    queryKey: ['observerBalances', observerAddress, blockHeight],
    queryFn: async () => {
      if (!observerAddress || !arweave) {
        throw new Error(
          'Observer address or arweave client is not initialized',
        );
      }

      // Get AR balance
      const winstonBalance = await arweave.wallets.getBalance(observerAddress);
      const arBalance = +AR.winstonToAr(winstonBalance);

      // Get Turbo credits balance
      try {
        const response = await fetch(`${TURBO_API_URL}/account/balance`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch Turbo balance: ${response.statusText}`,
          );
        }

        const data = await response.json();
        // Convert winston to AR for consistency
        const turboCredits = +AR.winstonToAr(data.balance || '0');

        return { ar: arBalance, turboCredits };
      } catch (error) {
        console.error('Error fetching Turbo balance:', error);
        // Return 0 for turboCredits if there's an error
        return { ar: arBalance, turboCredits: 0 };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled:
      !!observerAddress &&
      !!arweave &&
      typeof window !== 'undefined' &&
      'arweaveWallet' in window,
  });

  return res;
};

export default useObserverBalances;
