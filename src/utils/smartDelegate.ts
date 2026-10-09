import { ARIOToken, type GatewayWithAddress, mARIOToken } from '@ar.io/sdk/web';
import { minimumDelegationFor } from './delegationMinimum';
import { calculateGatewayRewards, calculateUserRewards } from './rewards';

/** Stamped on every result, so a recommendation can be traced to a model. */
export const SMART_DELEGATE_VERSION = 'smart-delegate-v1';

/**
 * Per-failure decay of the recent-failure penalty.
 *
 * Lifetime pass rate cannot see a gateway that is down *now*: twelve
 * consecutive failures after five hundred good epochs still reads 0.87.
 * Geometric decay at 0.7 gives 0.34 at three failures and 0.12 at six, which
 * is effectively zero well before the prune threshold.
 *
 * Deliberately not scaled against `maxConsecutiveFailures`, which is 30 — that
 * would leave a gateway on five consecutive failures at 0.83.
 */
export const STREAK_DECAY = 0.7;

/**
 * Epochs of history before a gateway can be ranked.
 *
 * This is the only defence against the cheapest attack on the ranking.
 * Expected yield divides by delegated stake, so a gateway with none and a high
 * reward share takes the top slot outright, and an operator can manufacture
 * that for the minimum operator stake plus one settings write — there were 134
 * such slots open on mainnet when this was designed. A history floor makes the
 * position additionally cost 30 passing epochs, which is what an honest
 * operator pays. It is close to free in practice (115 of those 134 already
 * exceeded 100 epochs) and a real barrier to a brand-new one. That is the
 * trade. It also gives a pruned operator 30 epochs to rebuild, since a rejoin
 * resets the stats to zero.
 *
 * A *performance* floor would be wrong and there is none: pass rate is folded
 * into the numerator, so a failing gateway falls out on the arithmetic.
 */
export const MIN_EPOCH_HISTORY = 30;

/** How many gateways the card shows. */
export const RESULT_COUNT = 3;

/**
 * Epochs in a year. Epochs are daily, matching `walletRewards.ts`.
 *
 * Used to turn the annualised figure `rewards.ts` produces back into one
 * epoch, because **the epoch is the honest unit here.** An annual percentage
 * compounds a year of assumptions onto a reward the protocol resets every
 * epoch: on live mainnet data the top result for a 100 ARIO delegation
 * annualises to 605%, which is arithmetically right and reads as a promise
 * nobody can keep. The same figure is 1.7 ARIO for the next epoch — true,
 * checkable tomorrow, and not a forecast.
 */
export const EPOCHS_PER_YEAR = 365;

/**
 * `STREAK_DECAY ^ failedConsecutiveEpochs`.
 *
 * Returns 1 for a gateway with no current streak, so it is a no-op on a
 * healthy gateway rather than a across-the-board haircut.
 */
export const streakPenalty = (
  gateway: Pick<GatewayWithAddress, 'stats'>,
): number => {
  const streak = gateway.stats?.failedConsecutiveEpochs ?? 0;
  if (!Number.isFinite(streak) || streak <= 0) {
    return 1;
  }
  return STREAK_DECAY ** streak;
};

/**
 * Can this wallet delegate `amount` to this gateway right now?
 *
 * The allowlist arm keys off existing stake rather than membership, because
 * the published snapshot never carries the allowlist. A wallet with no
 * position at an allowlist gateway might still be entitled to delegate and
 * this cannot tell, so the gateway is omitted rather than recommended and then
 * refused at signature. `DelegateStakeTable` tests `allowDelegatedStaking` for
 * truthiness, which admits `'allowlist'` for every wallet — here that would
 * promote an unsignable recommendation, so it is checked properly.
 */
export const isEligible = ({
  gateway,
  walletAddress,
  amount,
  protocolMinStake,
  existingStake,
}: {
  gateway: GatewayWithAddress;
  walletAddress: string | undefined;
  /** The amount the user entered, in ARIO. */
  amount: number;
  /** `delegates.minStake`, in mARIO. */
  protocolMinStake: number | undefined;
  /** This wallet's current stake at this gateway, in mARIO. */
  existingStake: number;
}): boolean => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return false;
  }
  if (!acceptsThisWallet({ gateway, walletAddress, existingStake })) {
    return false;
  }

  return (
    amount >=
    minimumDelegationFor({
      gatewayMinDelegatedStake: gateway.settings?.minDelegatedStake,
      protocolMinStake,
      hasExistingStake: existingStake > 0,
    })
  );
};

/**
 * Everything about eligibility that does not depend on the amount.
 *
 * Split out so `explainEmptyRanking` can ask "would this gateway qualify if
 * the amount were right?" without a sentinel amount to probe with. The first
 * attempt passed `Infinity`, which `isEligible` rightly rejects as non-finite
 * — so every gateway came back ineligible and the diagnostic blamed the wrong
 * rule. A guard defeating its own probe is a good argument for not probing.
 */
const acceptsThisWallet = ({
  gateway,
  walletAddress,
  existingStake,
}: {
  gateway: GatewayWithAddress;
  walletAddress: string | undefined;
  existingStake: number;
}): boolean => {
  if (gateway.status !== 'joined') {
    return false;
  }
  // An operator stakes to their own gateway through operator stake, and
  // `delegate_stake` rejects it outright (`CannotDelegateToSelf`).
  if (walletAddress !== undefined && gateway.gatewayAddress === walletAddress) {
    return false;
  }

  const allow = gateway.settings?.allowDelegatedStaking;
  if (allow !== true && !(allow === 'allowlist' && existingStake > 0)) {
    return false;
  }

  const total = gateway.stats?.totalEpochCount ?? 0;
  return Number.isFinite(total) && total >= MIN_EPOCH_HISTORY;
};

/**
 * Expected annual yield on `amount` delegated to this gateway, as a ratio.
 *
 * Deliberately composed from `calculateGatewayRewards` and
 * `calculateUserRewards` rather than restating the formula. Those already
 * compute
 *
 *   perGatewayReward x passRate x shareRatio x 365 / (delegated + amount)
 *
 * and they are what `StakingModal` shows through `useRewardsInfo`. Writing the
 * arithmetic again here is how the staking table and the staking modal came to
 * disagree by 25%, which Phase 0 of this feature existed to fix — so the
 * ranked figure and the figure in the modal are the same call, not two
 * derivations that happen to match.
 *
 * The only term this adds is `streakPenalty`, which the plain yield has no
 * business applying: the tables report what a gateway pays, while a *ranking*
 * has to prefer one that is not currently down.
 *
 * `undefined` when there is no reward to divide — the epoch has not been
 * prescribed, its read failed, or the SDK fallback path carried no reward
 * field. Suppressed rather than estimated, because a yield nobody can derive
 * is not a small yield.
 */
export const expectedEAY = ({
  gateway,
  amount,
  perGatewayReward,
}: {
  gateway: GatewayWithAddress;
  /** The amount the user entered, in ARIO. */
  amount: number;
  perGatewayReward: ARIOToken | undefined;
}): number | undefined => {
  if (perGatewayReward === undefined || perGatewayReward.valueOf() <= 0) {
    return undefined;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }

  const gatewayRewards = calculateGatewayRewards(perGatewayReward, gateway);
  const { EAY } = calculateUserRewards(gatewayRewards, new ARIOToken(amount));
  if (!Number.isFinite(EAY) || EAY < 0) {
    return undefined;
  }

  return EAY * streakPenalty(gateway);
};

export type SmartDelegateResult = {
  gateway: GatewayWithAddress;
  /**
   * Expected annual yield as a ratio, already carrying the streak penalty.
   *
   * **The ranking key, not a figure to display.** Its ordering is meaningful —
   * it is reward per token owned, which is what the protocol pays pro-rata —
   * but its magnitude assumes a year of unchanged rewards and no new
   * delegators, and neither holds. Show `expectedEpochReward` instead.
   */
  expectedEAY: number;
  /**
   * Expected reward for this delegation over the next epoch, in ARIO.
   *
   * What the card leads with. One epoch out, the inputs are known rather than
   * projected: the per-gateway reward is on the Epoch account and the pool is
   * whatever it is today.
   */
  expectedEpochReward: number;
  /**
   * Share of the gateway's delegate pool this delegation would own, 0-1.
   *
   * The dilution fact, stated rather than implied. At 1 the user is the pool
   * and every later delegator takes directly from their share, which is
   * exactly where the modelled yield looks most attractive and is least
   * durable.
   */
  poolShare: number;
  /** `passedEpochCount / totalEpochCount`, or undefined with no history. */
  passRate: number | undefined;
  passedEpochCount: number;
  totalEpochCount: number;
  failedConsecutiveEpochs: number;
  /** The gateway's delegate reward share, 0-100. */
  rewardShareRatio: number;
  /** Total delegated stake at the gateway, in ARIO. */
  totalDelegatedStake: number;
  /** True where the gateway holds no delegated stake at all. */
  noDelegatesYet: boolean;
  /** This wallet's existing stake at the gateway, in ARIO. */
  existingStake: number;
  version: typeof SMART_DELEGATE_VERSION;
};

/**
 * The top `RESULT_COUNT` eligible gateways for `amount`, best first.
 *
 * Ranked on `expectedEAY` and nothing else. Ties break on gateway address so
 * the order is stable across renders for identical inputs; without it React
 * would reshuffle equal-yield rows between reads.
 *
 * A gateway whose yield cannot be computed is dropped rather than ranked last,
 * since its position would be an assertion the data does not support.
 */
export const rankGateways = ({
  gateways,
  amount,
  perGatewayReward,
  walletAddress,
  protocolMinStake,
  existingStakeByGateway,
  resultCount = RESULT_COUNT,
}: {
  gateways: GatewayWithAddress[];
  /** The amount the user entered, in ARIO. */
  amount: number;
  perGatewayReward: ARIOToken | undefined;
  walletAddress: string | undefined;
  /** `delegates.minStake`, in mARIO. */
  protocolMinStake: number | undefined;
  /** Gateway address -> this wallet's stake there, in mARIO. */
  existingStakeByGateway: Record<string, number>;
  resultCount?: number;
}): SmartDelegateResult[] => {
  const results: SmartDelegateResult[] = [];

  for (const gateway of gateways) {
    const existingStake = existingStakeByGateway[gateway.gatewayAddress] ?? 0;

    if (
      !isEligible({
        gateway,
        walletAddress,
        amount,
        protocolMinStake,
        existingStake,
      })
    ) {
      continue;
    }

    const eay = expectedEAY({ gateway, amount, perGatewayReward });
    if (eay === undefined) {
      continue;
    }

    const passed = gateway.stats?.passedEpochCount ?? 0;
    const total = gateway.stats?.totalEpochCount ?? 0;
    const delegated = new mARIOToken(gateway.totalDelegatedStake ?? 0)
      .toARIO()
      .valueOf();

    const poolShare =
      delegated + amount > 0 ? amount / (delegated + amount) : 0;

    results.push({
      gateway,
      expectedEAY: eay,
      expectedEpochReward: (eay * amount) / EPOCHS_PER_YEAR,
      poolShare,
      passRate:
        total > 0 ? Math.min(1, Math.max(0, passed / total)) : undefined,
      passedEpochCount: passed,
      totalEpochCount: total,
      failedConsecutiveEpochs: gateway.stats?.failedConsecutiveEpochs ?? 0,
      rewardShareRatio: gateway.settings?.delegateRewardShareRatio ?? 0,
      totalDelegatedStake: delegated,
      noDelegatesYet: delegated <= 0,
      existingStake: new mARIOToken(existingStake).toARIO().valueOf(),
      version: SMART_DELEGATE_VERSION,
    });
  }

  results.sort(
    (a, b) =>
      b.expectedEAY - a.expectedEAY ||
      a.gateway.gatewayAddress.localeCompare(b.gateway.gatewayAddress),
  );

  return results.slice(0, resultCount);
};

/** Why a ranking came back empty, in the user's terms. */
export type EmptyRankingReason =
  | { kind: 'noGateways' }
  | { kind: 'amountBelowEveryMinimum'; lowestMinimum: number }
  | { kind: 'noRewardAvailable' }
  | { kind: 'nothingEligible' };

/**
 * Name the constraint that excluded everything (SD-1.7).
 *
 * An empty card must say which rule emptied it. "No matches" invites the user
 * to conclude the network has nothing to offer, when overwhelmingly the real
 * answer is that they typed an amount below every gateway's minimum — which is
 * fixable in one keystroke if we say so.
 *
 * Checked in the order the user can act on: a missing reward is ours to fix,
 * an amount is theirs, and only then the catch-all.
 */
export const explainEmptyRanking = ({
  gateways,
  amount,
  perGatewayReward,
  walletAddress,
  protocolMinStake,
  existingStakeByGateway,
}: {
  gateways: GatewayWithAddress[];
  amount: number;
  perGatewayReward: ARIOToken | undefined;
  walletAddress: string | undefined;
  protocolMinStake: number | undefined;
  existingStakeByGateway: Record<string, number>;
}): EmptyRankingReason => {
  if (gateways.length === 0) {
    return { kind: 'noGateways' };
  }
  if (perGatewayReward === undefined || perGatewayReward.valueOf() <= 0) {
    return { kind: 'noRewardAvailable' };
  }

  // Everything except the amount, so the amount can be isolated as the cause.
  const minimums: number[] = [];
  for (const gateway of gateways) {
    const existingStake = existingStakeByGateway[gateway.gatewayAddress] ?? 0;
    if (!acceptsThisWallet({ gateway, walletAddress, existingStake })) {
      continue;
    }

    minimums.push(
      minimumDelegationFor({
        gatewayMinDelegatedStake: gateway.settings?.minDelegatedStake,
        protocolMinStake,
        hasExistingStake: existingStake > 0,
      }),
    );
  }

  if (minimums.length === 0) {
    return { kind: 'nothingEligible' };
  }

  const lowestMinimum = Math.min(...minimums);
  if (amount < lowestMinimum) {
    return { kind: 'amountBelowEveryMinimum', lowestMinimum };
  }

  return { kind: 'nothingEligible' };
};
