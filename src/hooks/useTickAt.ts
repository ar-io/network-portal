import { useEffect, useState } from 'react';

/**
 * `setTimeout` silently overflows past this and fires immediately, which for a
 * 30-day withdrawal would be every render. Long waits re-arm instead.
 */
const MAX_TIMEOUT_MS = 2_147_483_647;

/**
 * Re-render once the given instant passes.
 *
 * Maturity is derived at render — a withdrawal unlocks on the clock, not on a
 * refetch — so without this a row that matures while the page is open keeps
 * rendering as locked until something else happens to re-render it. React
 * Query will not do it: these tables have no refetch interval.
 *
 * Pass the *next* future instant, computed inline on every render — **not
 * memoised on the row data**. The re-render this hook causes does not change
 * that data, so a memo would hand back the instant that just passed and the
 * next one would never be scheduled: with two pending withdrawals the first
 * would unlock and every later one would sit there until a reload. `at` is a
 * primitive, so recomputing it costs a comparison and the effect still no-ops
 * when it has not moved.
 *
 * An instant already in the past arms nothing, which is what keeps this from
 * looping.
 */
/**
 * How long to wait before re-rendering for `at`, or undefined when there is
 * nothing to wait for.
 *
 * A second past the boundary, so the comparison this triggers is settled
 * rather than racing the timer's own resolution. Written as `!(delay > 0)`
 * rather than `delay <= 0` so a NaN instant arms nothing: `NaN <= 0` is false,
 * which would schedule `setTimeout(fn, NaN)` — a zero delay that re-renders,
 * re-runs this effect and spins.
 */
export const scheduleDelay = (
  at: number,
  now: number = Date.now(),
): number | undefined => {
  const delay = at - now;
  if (!(delay > 0)) return undefined;
  return Math.min(delay + 1_000, MAX_TIMEOUT_MS);
};

export const useTickAt = (at?: number) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (at === undefined) return;

    const delay = scheduleDelay(at);
    if (delay === undefined) return;

    const id = setTimeout(() => setTick((t) => t + 1), delay);
    return () => clearTimeout(id);
    // `tick` re-arms the clamped timer for waits longer than MAX_TIMEOUT_MS.
  }, [at, tick]);
};

/** The soonest of these instants still in the future, if any. */
export const nextFutureTimestamp = (
  timestamps: Array<number | undefined>,
  now: number = Date.now(),
): number | undefined => {
  let soonest: number | undefined;
  for (const t of timestamps) {
    if (t === undefined || t <= now) continue;
    if (soonest === undefined || t < soonest) soonest = t;
  }
  return soonest;
};
