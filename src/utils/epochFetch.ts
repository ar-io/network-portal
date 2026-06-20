import { deserializeEpoch, getEpochPDA } from '@ar.io/sdk/solana';
import { EpochData } from '@ar.io/sdk/web';
import type { Commitment } from '@solana/kit';
import { fetchEncodedAccount } from '@solana/kit';

const DEFAULT_ADDRESS = '11111111111111111111111111111111';

const secToMs = (n: number): number => n * 1000;

/**
 * Fetch an epoch by index using a single RPC call (getAccount on the
 * Epoch PDA), then build the EpochData shape from the raw on-chain data.
 * This is ~25x faster than the SDK's getEpoch() which makes ~55 calls
 * (per-gateway weight lookups, name resolution, observations).
 *
 * Weights are left as zeros — the dashboard doesn't need them (they're
 * available from useGateways when the Observers table needs them).
 * Observations are left empty — useObservations fetches them separately.
 */
export async function fetchEpochLightweight(
  rpc: any,
  garProgram: string,
  epochIndex: number,
  commitment: Commitment = 'confirmed',
): Promise<EpochData> {
  const [epochPda] = await getEpochPDA(epochIndex, garProgram as any);
  const epochAccount = await fetchEncodedAccount(rpc, epochPda, {
    commitment,
  });
  if (!epochAccount.exists) {
    throw new Error(`Epoch ${epochIndex} not found`);
  }
  const epochData = deserializeEpoch(Buffer.from(epochAccount.data));

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
