import { deserializeEpoch, getEpochPDA, withRetry } from '@ar.io/sdk/solana';
import { EpochData } from '@ar.io/sdk/web';
import type { Commitment } from '@solana/kit';
import { fetchEncodedAccount } from '@solana/kit';

const DEFAULT_ADDRESS = '11111111111111111111111111111111';

const secToMs = (n: number): number => n * 1000;

/**
 * `EpochData` plus the two counters that live on the Epoch account itself.
 *
 * These matter because `Observation` PDAs are deleted by the permissionless
 * `close_observation` once an epoch distributes (it refunds the observer's
 * rent). Counting those PDAs therefore returns 0 for every completed epoch.
 * `Epoch.observations_submitted` is incremented on submit and is never
 * cleared, so it is the only durable source for historical participation.
 *
 * Optional because the SDK fallback path (`getCurrentEpoch()`) returns a
 * plain `EpochData` without them; consumers should treat absent as unknown.
 */
export type EpochDataWithCounters = EpochData & {
  observationsSubmitted?: number;
  /** 1 once `distribute_epoch` has run — the epoch's counters are final. */
  rewardsDistributed?: number;
  /**
   * This epoch's reward for one eligible gateway, in mARIO, straight off the
   * Epoch account.
   *
   * The protocol computes it as `total_eligible_rewards *
   * gateway_reward_ratio / RATE_SCALE / joined_count`, and `joined_count` — the
   * count of registry slots with a positive composite weight after tally — is
   * never stored, so this value cannot be reconstructed from a gateway list.
   * Read it; do not derive it.
   *
   * Zero until `prescribe_epoch` has run, and absent on the SDK fallback path,
   * which returns a plain `EpochData`. Treat both as unknown.
   */
  perGatewayReward?: number;
};

/** The subset of a deserialized Epoch account the reward totals are built from. */
export type EpochRewardFields = {
  totalEligibleRewards: number;
  perObserverReward: number;
  observerCount: number;
  activeGatewayCount: number;
};

/**
 * Build the epoch's reward totals, in mARIO.
 *
 * The gateway pool is the remainder after the observer pool, NOT
 * `perGatewayReward * activeGatewayCount`. `active_gateway_count` bounds the
 * distribution traversal and counts every registry slot, leavers included: 620
 * on mainnet against 306 gateways actually eligible to earn. Multiplying by it
 * overstated the dashboard's rewards chart by roughly 2x.
 *
 * The true divisor is `joined_count`, computed inside `prescribe_epoch` and
 * never stored, so it cannot be read back. Subtraction avoids needing it: the
 * protocol requires `gateway_reward_ratio + observer_reward_ratio ==
 * RATE_SCALE` (`epoch.rs`, `require!(sum == RATE_SCALE)`), so the two pools
 * partition `total_eligible_rewards` exactly. The observer pool is safe to
 * compute directly because `observer_count` IS the divisor the protocol used
 * for `per_observer_reward`.
 */
export const epochRewardTotals = (epoch: EpochRewardFields) => {
  const totalEligibleObserverReward =
    epoch.perObserverReward * epoch.observerCount;

  return {
    totalEligibleGateways: epoch.activeGatewayCount,
    totalEligibleRewards: epoch.totalEligibleRewards,
    totalEligibleObserverReward,
    totalEligibleGatewayReward: Math.max(
      0,
      epoch.totalEligibleRewards - totalEligibleObserverReward,
    ),
  };
};

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
): Promise<EpochDataWithCounters> {
  const [epochPda] = await getEpochPDA(epochIndex, garProgram as any);
  // `withRetry` because this is a raw kit read rather than an SDK method call,
  // and React Query no longer retries on top of the SDK (see App.tsx).
  const epochAccount = await withRetry(() =>
    fetchEncodedAccount(rpc, epochPda, {
      commitment,
    }),
  );
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
    observationsSubmitted: epochData.observationsSubmitted,
    rewardsDistributed: epochData.rewardsDistributed,
    perGatewayReward: epochData.perGatewayReward,
    startHeight: 0,
    startTimestamp: secToMs(epochData.startTimestamp),
    endTimestamp: secToMs(epochData.endTimestamp),
    distributionTimestamp: secToMs(epochData.endTimestamp),
    observations: { reports: {}, failureSummaries: {} },
    prescribedObservers,
    prescribedNames: [],
    distributions: epochRewardTotals(epochData),
    arnsStats: {
      totalReturnedNames: 0,
      totalActiveNames: 0,
      totalGracePeriodNames: 0,
      totalReservedNames: 0,
    },
  };
}
