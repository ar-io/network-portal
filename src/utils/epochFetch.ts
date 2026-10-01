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
   * True for a distributed epoch that collected no observations. The protocol
   * pays nothing and keeps the tokens in the treasury (ADR-0034 addendum), but
   * the epoch still carries the split `prescribe_epoch` wrote, so without this
   * flag it reads as a completed payout.
   */
  rewardsSkipped?: boolean;
  /**
   * Gateway reward this epoch did not pay out, because the gateways entitled
   * to it failed the epoch. In mARIO, and **undefined when not knowable** —
   * see {@link forfeitedGatewayReward}. Absent must render as unknown, never
   * as nothing forfeited.
   */
  forfeitedGatewayReward?: number;
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
 * 4: an epoch that collected no observations pays nothing, and is no longer
 *   reported as having distributed the split `prescribe_epoch` left on it.
 */
export const REWARD_TOTALS_VERSION = 4;

/** The subset of a deserialized Epoch account the reward totals are built from. */
export type EpochRewardFields = {
  totalEligibleRewards: number;
  perGatewayReward: number;
  perObserverReward: number;
  observerCount: number;
  /**
   * The protocol's own per-slot failure tally, indexed by registry slot.
   * Present on a live Epoch account; absent on the SDK fallback path and on
   * cached rows written before this field was stored.
   */
  failureCounts?: Uint16Array | number[];
  /**
   * The chain's own flag, non-zero once `prescribe_epoch` has run. Read, not
   * inferred from a non-zero reward: a prescribed epoch with no eligible
   * gateway keeps `per_gateway_reward` at zero, and inferring would call it
   * pending forever.
   */
  prescriptionsDone: number;
  /**
   * Zero for an epoch nobody observed.
   *
   * The program's own condition is `observations_submitted == 0 &&
   * distribution_index == 0`, and the second half is **not recoverable after
   * the fact**: a skipped epoch ends with `distribution_index ==
   * active_gateway_count`, the same as a paid one. So this is a close
   * approximation, not the chain's branch. It differs for one case, which the
   * program's own comment describes: an epoch the pre-Wave-2 program had
   * already begun paying falls through the skip and is finished the old way,
   * ending zero-observation and fully paid. Such an epoch reads as skipped
   * here, and nothing on the account can say otherwise.
   *
   * The alternative is `EpochSkippedNoObservationsEvent`, which a browser
   * cannot retrieve for a historical epoch at any price.
   */
  observationsSubmitted: number;
  /** 1 once distribution has run. A live epoch has simply not been paid yet. */
  rewardsDistributed: number;
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

/**
 * The gateway reward this epoch did not pay out.
 *
 * `distribution.rs` pays a gateway failed by a strict majority of the
 * observers that assessed it **nothing** for the epoch — not a reduced
 * amount:
 *
 * ```rust
 * let failed = observations_submitted > 0
 *     && epoch.failure_counts[dist_idx] > (observations_submitted as u16) / 2;
 * ```
 *
 * That share is simply retained, so the eligible pool a chart draws is larger
 * than what the treasury actually released. Across eight recent mainnet
 * epochs it was about one registry slot in sixteen.
 *
 * Returns undefined rather than zero whenever the answer is not knowable, and
 * the distinction matters: a bar with no shading must mean "not known", never
 * "nothing forfeited".
 *
 * - **Only once distributed.** A live epoch's verdict moves as observers
 *   report, so shading it would redraw several times an epoch and show a
 *   forfeit that may never happen.
 * - **Only with observations.** The program's own guard: zero submissions
 *   means nobody failed anybody, and `isSkippedEpoch` already covers the
 *   epoch that paid nothing at all.
 * - **Only with the tally.** A cached row from an older build has no
 *   `failureCounts`, and that epoch's account may since have closed.
 */
export const forfeitedGatewayReward = ({
  failureCounts,
  observationsSubmitted,
  perGatewayReward,
  rewardsDistributed,
  totalEligibleGatewayReward,
}: {
  failureCounts?: Uint16Array | number[];
  observationsSubmitted?: number;
  perGatewayReward: number;
  rewardsDistributed?: number;
  totalEligibleGatewayReward: number;
}): number | undefined => {
  if (!failureCounts || failureCounts.length === 0) return undefined;
  if (!rewardsDistributed) return undefined;
  if (!observationsSubmitted || observationsSubmitted <= 0) return undefined;
  if (!(perGatewayReward > 0)) return undefined;

  // Integer halving, matching the program: with 7 submissions the threshold
  // is 3, so 4 failures is a majority. Using 7/2 = 3.5 would disagree.
  const threshold = Math.floor(observationsSubmitted / 2);

  let failed = 0;
  for (const count of failureCounts) if (count > threshold) failed += 1;

  // Cannot exceed the pool it comes out of: `failureCounts` spans every
  // registry slot while the pool covers only the eligible ones, so a slot
  // that failed without being eligible would otherwise overdraw the bar.
  return Math.min(failed * perGatewayReward, totalEligibleGatewayReward);
};

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
    return {
      distributions: NO_SPLIT(totalEligibleRewards),
      splitKnown: false,
    };
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
    return {
      distributions: NO_SPLIT(totalEligibleRewards),
      splitKnown: false,
    };
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

/**
 * An epoch is skipped only once distribution has run: before that, zero
 * observations just means nobody has submitted *yet*, which is routine early
 * in an epoch.
 */
export const isSkippedEpoch = (
  observationsSubmitted: number | undefined,
  rewardsDistributed: number | undefined,
): boolean =>
  typeof observationsSubmitted === 'number' &&
  typeof rewardsDistributed === 'number' &&
  rewardsDistributed !== 0 &&
  observationsSubmitted === 0;

/**
 * The epoch's split, and whether it was actually paid.
 *
 * `skipped` rides alongside the split rather than replacing it. What
 * `prescribe_epoch` wrote stays on the row — it is a real fact about the
 * epoch, `totalEligibleGateways` is a count other panels read, and for a
 * cached row this is the only surviving copy once the account is closed. The
 * renderer decides what to draw; the data layer does not destroy it.
 */
export const epochRewardTotals = (epoch: EpochRewardFields) => {
  const totals = buildRewardTotals({
    prescribed: epoch.prescriptionsDone !== 0,
    totalEligibleRewards: epoch.totalEligibleRewards,
    perGatewayReward: epoch.perGatewayReward,
    observerPool: epoch.perObserverReward * epoch.observerCount,
  });

  return {
    ...totals,
    skipped: isSkippedEpoch(
      epoch.observationsSubmitted,
      epoch.rewardsDistributed,
    ),
    // A sibling of `distributions`, deliberately not inside it: that object's
    // meaning is versioned by REWARD_TOTALS_VERSION and recomputed by
    // `upgradeCachedEpoch` from a cached row's own fields. This cannot be
    // recovered that way — a row written before it existed has no
    // `failureCounts` — so it stays outside, where absent reads as unknown.
    forfeitedGatewayReward: forfeitedGatewayReward({
      failureCounts: epoch.failureCounts,
      observationsSubmitted: epoch.observationsSubmitted,
      perGatewayReward: epoch.perGatewayReward,
      rewardsDistributed: epoch.rewardsDistributed,
      totalEligibleGatewayReward:
        totals.distributions.totalEligibleGatewayReward,
    }),
  };
};

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
  //
  // The counters are on the row (the cache was cleared of rows predating
  // them), so the skip is recoverable here without re-reading chain — and
  // because it only sets a flag, a row this gets wrong is not destroyed and
  // can be re-derived by a later version.
  const totals = buildRewardTotals({
    prescribed: true,
    totalEligibleRewards: d.totalEligibleRewards,
    perGatewayReward,
    observerPool: d.totalEligibleObserverReward,
  });
  const skipped = isSkippedEpoch(
    row.observationsSubmitted,
    row.rewardsDistributed,
  );

  return {
    ...row,
    perGatewayReward,
    rewardsPrescribed: true,
    rewardsSplitKnown: totals.splitKnown,
    rewardsSkipped: skipped,
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
    rewardsSkipped: totals.skipped,
    forfeitedGatewayReward: totals.forfeitedGatewayReward,
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
