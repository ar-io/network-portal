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
 * Pass the *next* future instant; callers recompute it each render, so when one
 * passes the next takes its place and the effect re-arms. An instant already in
 * the past arms nothing, which is what keeps this from looping.
 */
export const useTickAt = (at?: number) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (at === undefined) return;

    const delay = at - Date.now();
    if (delay <= 0) return;

    // A second past the boundary, so the comparison this triggers is settled
    // rather than racing the timer's own resolution.
    const id = setTimeout(
      () => setTick((t) => t + 1),
      Math.min(delay + 1_000, MAX_TIMEOUT_MS),
    );
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
