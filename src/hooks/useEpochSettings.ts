import {
  deserializeEpochSettingsFull,
  getEpochSettingsPDA,
  withRetry,
} from '@ar.io/sdk/solana';
import { EpochSettings } from '@ar.io/sdk/web';
import type { Commitment } from '@solana/kit';
import { fetchEncodedAccount } from '@solana/kit';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

export type EpochSettingsFull = ReturnType<typeof deserializeEpochSettingsFull>;

export const epochSettingsQueryKey = (
  solanaRpcUrl: string,
  garProgram?: string,
) => ['epochSettings', solanaRpcUrl, garProgram];

/**
 * Read the EpochSettings account.
 *
 * Deserialized with the *Full* decoder even though the UI only consumes the
 * public subset: `currentEpochIndex` exists only in the full shape, and the
 * current-epoch bootstrap in GlobalDataProvider needs it. Sharing one decoder
 * lets both callers share one cache entry — the same account used to be fetched
 * three times on every cold load (once inside `getInfo()`, once by the epoch
 * bootstrap, once by this hook).
 */
export const fetchEpochSettings = async (
  rpc: any,
  garProgram: string,
  commitment: Commitment = 'confirmed',
): Promise<EpochSettingsFull> => {
  const [settingsPda] = await getEpochSettingsPDA(garProgram as any);
  const settingsAccount = await withRetry(() =>
    fetchEncodedAccount(rpc, settingsPda, { commitment }),
  );
  if (!settingsAccount.exists) {
    throw new Error('Epoch settings account not found');
  }
  return deserializeEpochSettingsFull(Buffer.from(settingsAccount.data));
};

/** Project the on-chain account onto the shape the UI consumes. */
export const toPublicEpochSettings = (
  settings: EpochSettingsFull,
): EpochSettings & { hasEpochZeroStarted: boolean } => {
  const epochZeroStartTimestamp = settings.genesisTimestamp * 1000;

  return {
    epochZeroStartTimestamp,
    durationMs: settings.epochDuration * 1000,
    prescribedNameCount: settings.prescribedNameCount,
    maxObservers: settings.prescribedObserverCount,
    hasEpochZeroStarted: dayjs().isAfter(new Date(epochZeroStartTimestamp)),
  };
};

const useEpochSettings = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const garProgram = (arIOReadSDK as any)?.garProgram as string | undefined;
  // Read from the SDK rather than defaulting, so this and the current-epoch
  // bootstrap in GlobalDataProvider agree — they share a cache entry, and
  // whichever fetches first would otherwise decide the commitment for both.
  const commitment =
    ((arIOReadSDK as any)?.commitment as Commitment) ?? 'confirmed';

  const queryResults = useQuery({
    queryKey: epochSettingsQueryKey(solanaRpcUrl, garProgram),
    queryFn: () => fetchEpochSettings(rpc, garProgram as string, commitment),
    select: toPublicEpochSettings,
    enabled: !!rpc && !!garProgram,
    staleTime: Infinity,
  });

  return queryResults;
};

export default useEpochSettings;
