import { log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import useEpochsWithCount from './useEpochsWithCount';

/**
 * Observation discriminator from @ar.io/solana-contracts/gar.
 */
const OBSERVATION_DISCRIMINATOR = new Uint8Array([
  0x6d, 0xbe, 0xbe, 0x5f, 0x1c, 0xac, 0xf3, 0x4a,
]);

export type ObserverHistoricalStats = {
  epochIndex: number;
  reportsCount: number;
  performancePercentage: number;
  prescribedObservers: number;
};

/**
 * Count observation accounts for a given epoch via getProgramAccounts
 * with base64 encoding (bypasses the SDK's broken base58 memcmp filters
 * in browser). Only fetches account keys (dataSlice size 0) to minimize
 * RPC response size.
 */
async function countObservationsForEpoch(
  rpc: any,
  garProgram: string,
  epochIndex: number,
): Promise<number> {
  const discBytes = btoa(String.fromCharCode(...OBSERVATION_DISCRIMINATOR));

  const epochBuf = new Uint8Array(8);
  new DataView(epochBuf.buffer).setBigUint64(0, BigInt(epochIndex), true);
  const epochBytes = btoa(String.fromCharCode(...epochBuf));

  try {
    const accounts = await rpc
      .getProgramAccounts(garProgram as any, {
        encoding: 'base64',
        dataSlice: { offset: 0, length: 0 },
        filters: [
          {
            memcmp: {
              offset: 0n,
              bytes: discBytes,
              encoding: 'base64',
            },
          },
          {
            memcmp: {
              offset: 8n,
              bytes: epochBytes,
              encoding: 'base64',
            },
          },
        ],
      })
      .send();
    return accounts.length;
  } catch {
    return 0;
  }
}

const useObserversWithCount = (epochCount: number) => {
  const rpc = useGlobalState((state) => state.rpc);
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const garProgram = (arIOReadSDK as any)?.garProgram as string | undefined;
  const { data: epochs } = useEpochsWithCount(epochCount);

  const res = useQuery<Array<ObserverHistoricalStats>>({
    queryKey: [
      'observersWithCount',
      epochs?.length,
      epochs?.[0]?.epochIndex,
      epochCount,
      garProgram,
    ],
    queryFn: async () => {
      if (!rpc || !garProgram || !epochs) {
        throw new Error('rpc, garProgram, or epochs not available');
      }

      const available = epochs
        .filter((epoch) => epoch !== undefined)
        .sort((a, b) => a!.epochIndex - b!.epochIndex);

      const results = await Promise.all(
        available.map(async (epoch) => {
          const prescribedObservers = epoch!.prescribedObservers.length;
          const reportsCount = await countObservationsForEpoch(
            rpc,
            garProgram,
            epoch!.epochIndex,
          );
          const performancePercentage =
            prescribedObservers > 0
              ? (reportsCount / prescribedObservers) * 100
              : 0;

          return {
            epochIndex: epoch!.epochIndex,
            reportsCount,
            performancePercentage,
            prescribedObservers,
          };
        }),
      );

      log.info(
        `[useObserversWithCount] ${results.length} epochs, reports: ${results.map((r) => `${r.epochIndex}:${r.reportsCount}`).join(', ')}`,
      );

      return results;
    },
    enabled: !!rpc && !!garProgram && !!epochs,
    staleTime: 5 * 60 * 1000,
  });
  return res;
};
export default useObserversWithCount;
