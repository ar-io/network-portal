import { log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { cleanupDbCache } from '@src/store/db';
import { getErrorMessage } from '@src/utils/getErrorMessage';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { ReactElement, useEffect } from 'react';

const isEpochUnavailableError = (errorMessage: string): boolean => {
  const lowerMessage = errorMessage.toLowerCase();

  return /epoch\s+\d+\s+not\s+found/.test(lowerMessage);
};

const GlobalDataProvider = ({ children }: { children: ReactElement }) => {
  const setSolanaSlot = useGlobalState((state) => state.setSolanaSlot);
  const setCurrentEpoch = useGlobalState((state) => state.setCurrentEpoch);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const setTicker = useGlobalState((state) => state.setTicker);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const setIsMobile = useGlobalState((state) => state.setIsMobile);
  const networkPortalDB = useGlobalState((state) => state.networkPortalDB);
  const queryClient = useQueryClient();

  const logEpochFetchContext = (phase: string) => {
    const sdkShape = arioReadSDK as unknown as {
      coreProgram?: unknown;
      garProgram?: unknown;
      arnsProgram?: unknown;
      antProgram?: unknown;
      commitment?: unknown;
    };

    log.info(`[GlobalDataProvider] [${phase}] epoch fetch context`, {
      rpcUrl: solanaRpcUrl,
      dbName: networkPortalDB?.name,
      sdkCommitment: String(sdkShape.commitment ?? 'unknown'),
      coreProgram: String(sdkShape.coreProgram ?? 'unknown'),
      garProgram: String(sdkShape.garProgram ?? 'unknown'),
      arnsProgram: String(sdkShape.arnsProgram ?? 'unknown'),
      antProgram: String(sdkShape.antProgram ?? 'unknown'),
    });
  };

  useEffect(() => {
    const loadCurrentEpoch = async () => {
      setCurrentEpoch(undefined);
      setTicker('');
      logEpochFetchContext('start');

      try {
        const { Ticker } = await arioReadSDK.getInfo();
        setTicker(Ticker);
      } catch (error) {
        log.error('[GlobalDataProvider] Error fetching network info', {
          rpcUrl: solanaRpcUrl,
          errorMessage: getErrorMessage(error),
          error,
        });
      }

      try {
        const epoch = await arioReadSDK.getCurrentEpoch();

        log.info('[GlobalDataProvider] getCurrentEpoch response received', {
          rpcUrl: solanaRpcUrl,
          responseType: Array.isArray(epoch) ? 'array' : typeof epoch,
          hasEpochIndex:
            !Array.isArray(epoch) &&
            typeof epoch === 'object' &&
            epoch !== null &&
            'epochIndex' in epoch,
          responsePreview: Array.isArray(epoch) ? epoch.slice(0, 3) : epoch,
        });

        if (Array.isArray(epoch)) {
          log.error(
            '[GlobalDataProvider] Error fetching current epoch: unexpected array response',
            {
              rpcUrl: solanaRpcUrl,
              responseLength: epoch.length,
              responsePreview: epoch.slice(0, 3),
            },
          );
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
        const errorMessage = getErrorMessage(error);

        if (isEpochUnavailableError(errorMessage)) {
          log.warn(
            '[GlobalDataProvider] Current epoch is not available yet on this staging deployment',
            {
              rpcUrl: solanaRpcUrl,
              errorMessage,
            },
          );
          return;
        }

        log.error('[GlobalDataProvider] Error fetching current epoch', {
          rpcUrl: solanaRpcUrl,
          errorMessage,
          error,
        });
        showErrorToast(
          'Error fetching current epoch. Application may not function as expected.',
        );
      }
    };

    loadCurrentEpoch();
  }, [arioReadSDK, queryClient, setCurrentEpoch, setTicker, solanaRpcUrl]);

  useEffect(() => {
    if (currentEpoch?.epochIndex && networkPortalDB) {
      cleanupDbCache(networkPortalDB, currentEpoch.epochIndex);
    }
  }, [currentEpoch, networkPortalDB]);

  useEffect(() => {
    const updateSlot = async () => {
      try {
        const slot = await rpc.getSlot().send();
        setSolanaSlot(Number(slot));
      } catch (error) {
        log.error('Error fetching Solana slot', error);
      }
    };
    updateSlot();
  }, [rpc, setSolanaSlot]);

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
