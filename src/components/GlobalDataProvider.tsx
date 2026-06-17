import {
  deserializeEpoch,
  deserializeEpochSettingsFull,
  getEpochPDA,
  getEpochSettingsPDA,
} from '@ar.io/sdk/solana';
import { EpochData } from '@ar.io/sdk/web';
import type { Commitment } from '@solana/kit';
import { fetchEncodedAccount } from '@solana/kit';
import { log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { cleanupDbCache } from '@src/store/db';
import { probeArIOGateway } from '@src/utils/arweaveUrl';
import { getErrorMessage } from '@src/utils/getErrorMessage';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { ReactElement, useEffect } from 'react';

const DEFAULT_ADDRESS = '11111111111111111111111111111111';

const secToMs = (n: number): number => n * 1000;

/**
 * Lightweight alternative to getCurrentEpoch() that fetches the epoch
 * metadata in ~2-3 RPC calls instead of ~55. Reads the EpochSettings PDA
 * to resolve the current epoch index, then reads the Epoch PDA directly.
 * Builds the prescribedObservers list from the on-chain data WITHOUT
 * making individual getGateway calls for each observer (weights can be
 * looked up from useGateways when needed).
 */
async function fetchCurrentEpochLightweight(
  rpc: any,
  garProgram: string,
  commitment: Commitment,
): Promise<EpochData> {
  // 1. Resolve current epoch index from EpochSettings (1 RPC call)
  const [settingsPda] = await getEpochSettingsPDA(garProgram as any);
  const settingsAccount = await fetchEncodedAccount(rpc, settingsPda, {
    commitment,
  });
  if (!settingsAccount.exists) {
    throw new Error('EpochSettings account not found');
  }
  const settings = deserializeEpochSettingsFull(
    Buffer.from(settingsAccount.data),
  );
  const epochIndex = Math.max(0, settings.currentEpochIndex - 1);

  // 2. Fetch the Epoch account (1 RPC call)
  const [epochPda] = await getEpochPDA(epochIndex, garProgram as any);
  const epochAccount = await fetchEncodedAccount(rpc, epochPda, {
    commitment,
  });
  if (!epochAccount.exists) {
    throw new Error(`Epoch ${epochIndex} not found`);
  }
  const epochData = deserializeEpoch(Buffer.from(epochAccount.data));

  // 3. Build prescribed observers from the epoch account data (0 RPC calls)
  const prescribedObservers = [];
  for (let i = 0; i < epochData.observerCount; i++) {
    const observerAddress = epochData.prescribedObservers[i] as string;
    const gatewayAddress = epochData.prescribedObserverGateways[i] as string;
    if (observerAddress === DEFAULT_ADDRESS) continue;

    prescribedObservers.push({
      gatewayAddress,
      observerAddress,
      stake: 0,
      startTimestamp: 0,
      stakeWeight: 0,
      tenureWeight: 0,
      gatewayRewardRatioWeight: 0,
      observerRewardRatioWeight: 0,
      gatewayPerformanceRatio: 0,
      observerPerformanceRatio: 0,
      compositeWeight: 0,
      normalizedCompositeWeight: 0,
    });
  }

  return {
    epochIndex,
    startHeight: 0,
    startTimestamp: secToMs(epochData.startTimestamp),
    endTimestamp: secToMs(epochData.endTimestamp),
    distributionTimestamp: secToMs(epochData.endTimestamp),
    observations: { reports: {}, failureSummaries: {} },
    prescribedObservers,
    prescribedNames: [],
    distributions: {
      totalEligibleGateways: epochData.activeGatewayCount,
      totalEligibleRewards: epochData.totalEligibleRewards,
      totalEligibleObserverReward:
        epochData.perObserverReward * epochData.observerCount,
      totalEligibleGatewayReward:
        epochData.perGatewayReward * epochData.activeGatewayCount,
    },
    arnsStats: {
      totalReturnedNames: 0,
      totalActiveNames: 0,
      totalGracePeriodNames: 0,
      totalReservedNames: 0,
    },
  };
}

const isEpochUnavailableError = (errorMessage: string): boolean => {
  const lowerMessage = errorMessage.toLowerCase();

  return /epoch\s+\d+\s+not\s+found/.test(lowerMessage);
};

const GlobalDataProvider = ({ children }: { children: ReactElement }) => {
  const setCurrentEpoch = useGlobalState((state) => state.setCurrentEpoch);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const setTicker = useGlobalState((state) => state.setTicker);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const setIsMobile = useGlobalState((state) => state.setIsMobile);
  const networkPortalDB = useGlobalState((state) => state.networkPortalDB);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadCurrentEpoch = async () => {
      setCurrentEpoch(undefined);
      setTicker('');

      const garProgram = (arioReadSDK as any)?.garProgram as string | undefined;
      const commitment =
        ((arioReadSDK as any)?.commitment as Commitment) ?? 'confirmed';

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
        let epoch: EpochData;
        if (garProgram && rpc) {
          // Lightweight path: 2-3 RPC calls instead of ~55
          epoch = await fetchCurrentEpochLightweight(
            rpc,
            garProgram,
            commitment,
          );
        } else {
          // Fallback to SDK (e.g. if garProgram isn't accessible)
          epoch = await arioReadSDK.getCurrentEpoch();
        }

        if (Array.isArray(epoch)) {
          log.error(
            '[GlobalDataProvider] Error fetching current epoch: unexpected array response',
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
  }, [arioReadSDK, rpc, queryClient, setCurrentEpoch, setTicker, solanaRpcUrl]);

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
