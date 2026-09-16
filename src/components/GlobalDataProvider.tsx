import { EpochData } from '@ar.io/sdk/web';
import type { Commitment } from '@solana/kit';
import { ARIO_TICKER, log } from '@src/constants';
import {
  epochSettingsQueryKey,
  fetchEpochSettings,
} from '@src/hooks/useEpochSettings';
import { useGlobalState } from '@src/store';
import { cleanupDbCache } from '@src/store/db';
import { probeArIOGateway } from '@src/utils/arweaveUrl';
import { fetchEpochLightweight } from '@src/utils/epochFetch';
import { getErrorMessage } from '@src/utils/getErrorMessage';
import { showErrorToast } from '@src/utils/toast';
import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { ReactElement, useEffect } from 'react';

/**
 * Resolve the current epoch index from on-chain EpochSettings, then fetch the
 * epoch data via the shared lightweight fetch.
 *
 * Routed through `queryClient.fetchQuery` on the same key `useEpochSettings`
 * uses so the two share one account read. Reading it directly here is what made
 * EpochSettings a three-times-per-load fetch.
 */
async function fetchCurrentEpochLightweight(
  queryClient: QueryClient,
  rpc: any,
  solanaRpcUrl: string,
  garProgram: string,
  commitment: Commitment,
) {
  const settings = await queryClient.fetchQuery({
    queryKey: epochSettingsQueryKey(solanaRpcUrl, garProgram),
    queryFn: () => fetchEpochSettings(rpc, garProgram, commitment),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const epochIndex = Math.max(0, settings.currentEpochIndex - 1);

  return fetchEpochLightweight(rpc, garProgram, epochIndex, commitment);
}

const isEpochUnavailableError = (errorMessage: string): boolean => {
  const lowerMessage = errorMessage.toLowerCase();

  return /epoch\s+\d+\s+not\s+found/.test(lowerMessage);
};

const GlobalDataProvider = ({ children }: { children: ReactElement }) => {
  const setCurrentEpoch = useGlobalState((state) => state.setCurrentEpoch);
  const setEpochLoadFailed = useGlobalState(
    (state) => state.setEpochLoadFailed,
  );
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const setTicker = useGlobalState((state) => state.setTicker);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const setIsMobile = useGlobalState((state) => state.setIsMobile);
  const networkPortalDB = useGlobalState((state) => state.networkPortalDB);
  const queryClient = useQueryClient();

  useEffect(() => {
    // The effect reruns whenever the endpoint changes, and the request it
    // started is not cancellable. Without this, an older request rejecting
    // after a newer one began would flip `epochLoadFailed` while the newer one
    // is still in flight, and the header would read Unavailable during a load
    // that has not failed.
    let isCurrent = true;

    const loadCurrentEpoch = async () => {
      setCurrentEpoch(undefined);
      setEpochLoadFailed(false);

      const garProgram = (arioReadSDK as any)?.garProgram as string | undefined;
      const commitment =
        ((arioReadSDK as any)?.commitment as Commitment) ?? 'confirmed';

      // This used to be `(await arioReadSDK.getInfo()).Ticker`, which spent two
      // account reads to arrive at a value the SDK hardcodes. See ARIO_TICKER.
      setTicker(ARIO_TICKER);

      try {
        let epoch: EpochData;
        if (garProgram && rpc) {
          // Lightweight path: 2-3 RPC calls instead of ~55
          epoch = await fetchCurrentEpochLightweight(
            queryClient,
            rpc,
            solanaRpcUrl,
            garProgram,
            commitment,
          );
        } else {
          // Fallback to SDK (e.g. if garProgram isn't accessible)
          epoch = await arioReadSDK.getCurrentEpoch();
        }

        if (!isCurrent) return;

        if (Array.isArray(epoch)) {
          log.error(
            '[GlobalDataProvider] Error fetching current epoch: unexpected array response',
          );
          setEpochLoadFailed(true);
          showErrorToast(
            'Error fetching current epoch. Application may not function as expected.',
          );
          return;
        }
        log.info(
          `[GlobalDataProvider] Current epoch loaded: ${epoch.epochIndex} (RPC: ${solanaRpcUrl})`,
        );
        setCurrentEpoch(epoch);
      } catch (error) {
        if (!isCurrent) return;

        const errorMessage = getErrorMessage(error);

        if (isEpochUnavailableError(errorMessage)) {
          log.warn(
            '[GlobalDataProvider] Current epoch is not available yet on this staging deployment',
            {
              rpcUrl: solanaRpcUrl,
              errorMessage,
            },
          );
          setEpochLoadFailed(true);
          return;
        }

        log.error('[GlobalDataProvider] Error fetching current epoch', {
          rpcUrl: solanaRpcUrl,
          errorMessage,
          error,
        });
        setEpochLoadFailed(true);
        showErrorToast(
          'Error fetching current epoch. Application may not function as expected.',
        );
      }
    };

    loadCurrentEpoch();

    return () => {
      isCurrent = false;
    };
  }, [
    arioReadSDK,
    rpc,
    queryClient,
    setCurrentEpoch,
    setEpochLoadFailed,
    setTicker,
    solanaRpcUrl,
  ]);

  useEffect(() => {
    if (currentEpoch?.epochIndex && networkPortalDB) {
      cleanupDbCache(networkPortalDB, currentEpoch.epochIndex);
    }
  }, [currentEpoch, networkPortalDB]);

  // Probe whether the app is served from an ar.io gateway (fire-and-forget).
  // The cached result is used by arweaveTxUrl() to decide between relative
  // URLs and turbo-gateway.com.
  useEffect(() => {
    probeArIOGateway();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  return <>{children}</>;
};

export default GlobalDataProvider;
