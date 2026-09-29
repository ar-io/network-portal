/**
 * Which point in an epoch series a panel should lead with.
 *
 * The last point is the epoch in progress, and its counters are still
 * accumulating: minutes after a rollover an epoch legitimately reads 0/50,
 * which as a headline figure — beside a red delta against a finished epoch —
 * says the network has failed when it has merely just started.
 *
 * So panels lead with the newest *finished* epoch, which is the most recent
 * number that actually means something, and keep the live one on the chart to
 * be hovered and labelled.
 *
 * Returns the last index when nothing is finished yet (a fresh network, or a
 * series of one), because showing the live epoch is better than showing
 * nothing. Undefined for an empty series.
 */
export const latestSettledIndex = (
  series: ReadonlyArray<{ epochIndex: number }>,
  currentEpochIndex: number | undefined,
): number | undefined => {
  if (series.length === 0) return undefined;
  if (currentEpochIndex === undefined) return series.length - 1;

  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].epochIndex < currentEpochIndex) return i;
  }
  return series.length - 1;
};

/** Whether this point is the epoch still running. */
export const isLiveEpoch = (
  point: { epochIndex: number } | undefined,
  currentEpochIndex: number | undefined,
): boolean =>
  point !== undefined &&
  currentEpochIndex !== undefined &&
  point.epochIndex >= currentEpochIndex;
