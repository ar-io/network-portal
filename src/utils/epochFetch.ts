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
  /**
   * False until `prescribe_epoch` has split the pool between gateways and
   * observers. `create_epoch` sets `total_eligible_rewards` immediately but
   * leaves both per-unit rewards at zero, so before prescription the total is
   * known and its split is not. Consumers render that as pending, never as a
   * split of zero or of everything.
   */
  rewardsPrescribed?: boolean;
  /**
   * Whether `distributions` carries a real gateway/observer split. False while
   * unprescribed, and also for the edge where an epoch was prescribed with no
   * observers selected, whose gateway pool cannot be derived.
   */
  rewardsSplitKnown?: boolean;
  /**
   * The formula `distributions` was computed with. IndexedDB keeps distributed
   * epochs across releases, so a row can outlive the code that wrote it; see
   * {@link upgradeCachedEpoch}. Absent on rows written before this field.
   */
  rewardTotalsVersion?: number;
};

/**
 * Bump when the meaning of `distributions` changes, and teach
 * {@link upgradeCachedEpoch} to recompute older rows from their own fields.
 *
 * 1 (implicit, absent): gateway pool was `perGatewayReward * activeGatewayCount`,
 *   about 2x the real pool on mainnet, and `totalEligibleGateways` counted every
 *   registry slot.
 * 2: gateway pool is the remainder after the observer pool; the eligible count
 *   is derived from it; unprescribed epochs carry no split.
 * 3: prescription is the chain's `prescriptions_done` flag rather than inferred
 *   from a non-zero reward, and `rewardsSplitKnown` says whether the split is
 *   real.
 */
export const REWARD_TOTALS_VERSION = 3;

/** The subset of a deserialized Epoch account the reward totals are built from. */
export type EpochRewardFields = {
  totalEligibleRewards: number;
  perGatewayReward: number;
  perObserverReward: number;
  observerCount: number;
  /**
   * The chain's own flag, non-zero once `prescribe_epoch` has run. Read, not
   * inferred from a non-zero reward: a prescribed epoch with no eligible
   * gateway keeps `per_gateway_reward` at zero, and inferring would call it
   * pending forever.
   */
  prescriptionsDone: number;
};

type RewardTotalsInputs = {
  prescribed: boolean;
  totalEligibleRewards: number;
  perGatewayReward: number;
  observerPool: number;
};

type RewardTotals = {
  distributions: EpochDataWithCounters['distributions'];
  /** False when the pool has not been split, or its split cannot be derived. */
  splitKnown: boolean;
};

const NO_SPLIT = (totalEligibleRewards: number) => ({
  totalEligibleGateways: 0,
  totalEligibleRewards,
  totalEligibleObserverReward: 0,
  totalEligibleGatewayReward: 0,
});

const buildRewardTotals = ({
  prescribed,
  totalEligibleRewards,
  perGatewayReward,
  observerPool,
}: RewardTotalsInputs): RewardTotals => {
  // Not yet prescribed: the pool exists but has not been split. The remainder
  // formula below would otherwise credit all of it to gateways, because the
  // observer pool is still zero.
  if (!prescribed) {
    return { distributions: NO_SPLIT(totalEligibleRewards), splitKnown: false };
  }

  // Prescribed with no eligible gateway (`joined_count == 0`): the protocol
  // leaves `per_gateway_reward` at zero, and gateways earn nothing. That is a
  // known split of zero, not a pending one.
  if (!(perGatewayReward > 0)) {
    return {
      distributions: {
        ...NO_SPLIT(totalEligibleRewards),
        totalEligibleObserverReward: observerPool,
      },
      splitKnown: true,
    };
  }

  // Prescribed with gateways but no observers selected: the observer share
  // stays in the treasury, so the remainder is NOT the gateway pool, and the
  // divisor that would give it is never stored. Report the split as unknown
  // rather than credit the observer share to gateways.
  if (!(observerPool > 0)) {
    return { distributions: NO_SPLIT(totalEligibleRewards), splitKnown: false };
  }

  const totalEligibleGatewayReward = Math.max(
    0,
    totalEligibleRewards - observerPool,
  );

  return {
    distributions: {
      // The protocol's divisor, `joined_count`, is never stored, but it is
      // recoverable: the gateway pool is `per_gateway_reward * joined_count`
      // up to integer-division dust. `active_gateway_count` is not a
      // substitute; it counts every registry slot, leavers included.
      totalEligibleGateways: Math.round(
        totalEligibleGatewayReward / perGatewayReward,
      ),
      totalEligibleRewards,
      totalEligibleObserverReward: observerPool,
      totalEligibleGatewayReward,
    },
    splitKnown: true,
  };
};

export const epochRewardTotals = (epoch: EpochRewardFields) =>
  buildRewardTotals({
    prescribed: epoch.prescriptionsDone !== 0,
    totalEligibleRewards: epoch.totalEligibleRewards,
    perGatewayReward: epoch.perGatewayReward,
    observerPool: epoch.perObserverReward * epoch.observerCount,
  });

/**
 * Bring a cached epoch row up to {@link REWARD_TOTALS_VERSION}, from its own
 * fields, without touching the network.
 *
 * Deliberately not a Dexie schema bump. Clearing the table would throw away
 * rows that may be the only copy left once an epoch account is closed, and a
 * higher schema version cannot be opened by older code, so a revert would
 * silently switch caching off. A row upgraded here is still readable by any
 * older build, which ignores the extra fields.
 *
 * Recomputing is exact. A version-1 row stored
 * `totalEligibleGatewayReward = perGatewayReward * activeGatewayCount` and
 * `totalEligibleGateways = activeGatewayCount`, so dividing one by the other
 * recovers `perGatewayReward`; its observer pool was already correct. A row
 * written between the two versions carries `perGatewayReward` directly and uses
 * it, since its gateway total no longer encodes it.
 */
export const upgradeCachedEpoch = (
  row: EpochDataWithCounters,
): EpochDataWithCounters => {
  if (row.rewardTotalsVersion === REWARD_TOTALS_VERSION) return row;

  const d = row.distributions;
  const perGatewayReward =
    row.perGatewayReward ??
    (d.totalEligibleGateways > 0
      ? d.totalEligibleGatewayReward / d.totalEligibleGateways
      : 0);

  // Only distributed epochs are ever cached, and `distribute_epoch` requires
  // `prescriptions_done`, so every cached row was prescribed.
  const totals = buildRewardTotals({
    prescribed: true,
    totalEligibleRewards: d.totalEligibleRewards,
    perGatewayReward,
    observerPool: d.totalEligibleObserverReward,
  });

  return {
    ...row,
    perGatewayReward,
    rewardsPrescribed: true,
    rewardsSplitKnown: totals.splitKnown,
    rewardTotalsVersion: REWARD_TOTALS_VERSION,
    distributions: { ...d, ...totals.distributions },
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

  const totals = epochRewardTotals(epochData);

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
    rewardsPrescribed: epochData.prescriptionsDone !== 0,
    rewardsSplitKnown: totals.splitKnown,
    rewardTotalsVersion: REWARD_TOTALS_VERSION,
    startHeight: 0,
    startTimestamp: secToMs(epochData.startTimestamp),
    endTimestamp: secToMs(epochData.endTimestamp),
    distributionTimestamp: secToMs(epochData.endTimestamp),
    observations: { reports: {}, failureSummaries: {} },
    prescribedObservers,
    prescribedNames: [],
    distributions: totals.distributions,
    arnsStats: {
      totalReturnedNames: 0,
      totalActiveNames: 0,
      totalGracePeriodNames: 0,
      totalReservedNames: 0,
    },
  };
}
