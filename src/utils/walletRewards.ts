import type {
  AnalyzerRewardPosition,
  AnalyzerRewardsDocument,
} from '@src/utils/analyzerApi';

/** Epochs are daily, so this is the annualisation factor. */
const EPOCHS_PER_YEAR = 365;
const M_ARIO = 1_000_000;

export type PositionSummary = {
  gatewayAddress?: string;
  kind: 'delegate' | 'operator';
  basis: 'events' | 'inferred';
  /** Lifetime earnings in ARIO — never the windowed sum. */
  earned: number;
  currentStake?: number;
  /**
   * Annualised return of `earned` against `currentStake`, or undefined when
   * there is no stake left to divide by.
   *
   * Distorted whenever the stake changed during the period, because the
   * numerator spans history and the denominator is only today. On live mainnet
   * the median position reads 29.6% against a true network aggregate of 5.0%.
   * Present it as the position's own realized figure, never as a rate to expect.
   */
  annualisedReturn?: number;
  epochsRewarded: number;
};

export type WalletRewards = {
  /** Lifetime earnings in ARIO across every position this wallet holds. */
  earned: number;
  positions: PositionSummary[];
  /** Per-epoch totals in ARIO; null where every position had a gap. */
  perEpoch: Array<{ epochIndex: number; ario: number | null }>;
  /** Epochs of recorded history — the divisor for any rate. */
  epochsRecorded: number;
  /** Combined return across the wallet's positions, subject to the same caveat. */
  annualisedReturn?: number;
  /** True when any position was derived rather than measured. */
  hasInferred: boolean;
};

/**
 * The network's realized return: total rewards over total stake over recorded
 * epochs.
 *
 * Worth showing beside a personal figure because it is the one number here that
 * is not distorted by individual stake changes — those wash out in aggregate.
 */
export const networkAnnualisedReturn = (
  doc: AnalyzerRewardsDocument | undefined,
  kind?: 'delegate' | 'operator',
): number | undefined => {
  const all = doc?.positions;
  const epochs = doc?.totalEpochsRecorded;
  if (!all?.length || !epochs) return undefined;

  // Delegate and operator rewards are measured differently — the first from the
  // program's own events, the second by differencing stake observations — so a
  // combined rate would blend an exact figure with a derived one.
  const positions = kind ? all.filter((p) => p.kind === kind) : all;
  if (!positions.length) return undefined;

  let rewards = 0;
  let stake = 0;
  for (const p of positions) {
    rewards += p.lifetimeRewards ?? 0;
    stake += p.currentStake ?? 0;
  }
  if (stake <= 0) return undefined;

  return (rewards / stake / epochs) * EPOCHS_PER_YEAR;
};

const summarise = (
  position: AnalyzerRewardPosition,
  epochsRecorded: number,
): PositionSummary => {
  // Lifetime, not window: the per-epoch arrays are capped at 30 epochs, so
  // windowRewards silently starts understating once history passes that.
  const lifetime = position.lifetimeRewards ?? 0;
  const stake = position.currentStake ?? 0;

  return {
    gatewayAddress: position.gatewayAddress,
    kind: position.kind,
    basis: position.basis ?? 'events',
    earned: lifetime / M_ARIO,
    currentStake: stake > 0 ? stake / M_ARIO : undefined,
    annualisedReturn:
      stake > 0 && epochsRecorded > 0
        ? (lifetime / stake / epochsRecorded) * EPOCHS_PER_YEAR
        : undefined,
    epochsRewarded: position.epochsRewarded ?? 0,
  };
};

/**
 * Everything one wallet earned, across all of its positions.
 *
 * A wallet can hold a position per gateway plus an operator position, and
 * gateways set reward shares anywhere from 0% to 95%, so the per-gateway split
 * matters as much as the total.
 */
export const summariseWalletRewards = (
  doc: AnalyzerRewardsDocument | undefined,
  address: string | undefined,
): WalletRewards | undefined => {
  if (!doc?.positions?.length || !address) return undefined;

  const mine = doc.positions.filter((p) => p.address === address);
  if (!mine.length) return undefined;

  // Recorded history, not the published window and not epochs-with-a-reward.
  // Both alternatives inflate any rate derived from them.
  const epochsRecorded = doc.totalEpochsRecorded ?? doc.epochs?.length ?? 0;

  const positions = mine.map((p) => summarise(p, epochsRecorded));
  const totalLifetime = mine.reduce(
    (sum, p) => sum + (p.lifetimeRewards ?? 0),
    0,
  );
  const totalStake = mine.reduce((sum, p) => sum + (p.currentStake ?? 0), 0);

  const epochs = doc.epochs ?? [];
  const perEpoch = epochs.map((epochIndex, i) => {
    let total: number | null = null;
    for (const p of mine) {
      const value = p.rewards?.[i];
      // null is a gap. Only a real number contributes, and a position with no
      // entry must not drag the epoch to zero.
      if (typeof value === 'number') total = (total ?? 0) + value;
    }
    return { epochIndex, ario: total === null ? null : total / M_ARIO };
  });

  return {
    earned: totalLifetime / M_ARIO,
    positions: positions.sort((a, b) => b.earned - a.earned),
    perEpoch,
    epochsRecorded,
    annualisedReturn:
      totalStake > 0 && epochsRecorded > 0
        ? (totalLifetime / totalStake / epochsRecorded) * EPOCHS_PER_YEAR
        : undefined,
    hasInferred: positions.some((p) => p.basis === 'inferred'),
  };
};
