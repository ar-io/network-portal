import type { AnalyzerEconomicsRow } from '@src/utils/analyzerApi';

export type InflowPoint = {
  epochIndex: number;
  endTimestamp?: number;
  /** Net inflow for the epoch, in ARIO. */
  ario: number;
  /** The same inflow at that epoch's closing price, or undefined without one. */
  usd?: number;
  /**
   * True when this epoch's movement is too large to be ordinary income and
   * would flatten every other bar. See {@link deriveInflowSeries}.
   */
  offScale: boolean;
};

export type InflowSeries = {
  points: InflowPoint[];
  /** Y-axis ceiling, chosen so one treasury event cannot flatten the rest. */
  cap: number;
};

const M_ARIO = 1_000_000;

/**
 * Multiple of the 90th percentile above which an epoch is treated as an event
 * rather than income.
 *
 * Live mainnet is the reason this exists: epoch 510 moved 60.1M ARIO against a
 * 95k median, 631x. That is a treasury operation — the balance jumped and then
 * held — and plotted on a shared axis it compresses every real epoch to a
 * hairline. Three times p90 clears the largest genuine epoch by a wide margin
 * while isolating that one.
 */
const OFF_SCALE_MULTIPLE = 3;

const percentile = (sorted: number[], p: number): number =>
  sorted.length
    ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
    : 0;

/**
 * Net inflow per epoch from consecutive treasury samples.
 *
 *   inflow(t) = balance(t) - balance(t-1) + rewards(t)
 *
 * The first row yields no point: a delta needs two samples, and emitting zero
 * there would read as an epoch with no income rather than one we cannot compute.
 *
 * Rows are sorted and consecutive pairs are only used when their epochs are
 * adjacent — a gap in the archive would otherwise be attributed as one enormous
 * epoch of income.
 */
export const deriveInflowSeries = (
  rows: AnalyzerEconomicsRow[] | undefined,
): InflowSeries | undefined => {
  if (!rows?.length) return undefined;

  const usable = rows
    .filter(
      (r) =>
        typeof r.protocolBalance === 'number' &&
        typeof r.epochIndex === 'number',
    )
    .sort((a, b) => a.epochIndex - b.epochIndex);

  const points: InflowPoint[] = [];
  for (let i = 1; i < usable.length; i++) {
    const prev = usable[i - 1];
    const row = usable[i];
    if (row.epochIndex !== prev.epochIndex + 1) continue;

    const delta =
      ((row.protocolBalance as number) - (prev.protocolBalance as number)) /
      M_ARIO;
    const rewards = (row.totalEligibleRewards ?? 0) / M_ARIO;
    const ario = delta + rewards;
    const price = row.arioPriceUsd;

    points.push({
      epochIndex: row.epochIndex,
      endTimestamp: row.endTimestamp,
      ario,
      usd: typeof price === 'number' ? ario * price : undefined,
      offScale: false,
    });
  }

  if (!points.length) return undefined;

  // Threshold from the positive values only: a negative epoch is a treasury
  // paying out more than it took in, which is ordinary and belongs on scale.
  const positives = points
    .map((p) => p.ario)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  const cap = percentile(positives, 0.9) * OFF_SCALE_MULTIPLE;

  for (const point of points) {
    point.offScale = cap > 0 && point.ario > cap;
  }

  return { points, cap };
};
