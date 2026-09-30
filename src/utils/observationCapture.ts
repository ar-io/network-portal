/**
 * How much of an epoch's observation set the archive actually holds.
 *
 * The published epoch document reports `capture` alongside the observations
 * themselves, because the two answer different questions: the rows say what we
 * have, `capture` says whether that is everything the chain counted.
 *
 * This matters because an empty observation list has three unrelated meanings.
 * Epochs 550, 553 and 554 are `complete` with zero — nobody observed them, and
 * saying so is correct. Epochs 508 and 509 are `missing` — eight and ten
 * observers did report, and the accounts holding their reports were swept by
 * `close_observation` before capture ran. Rendering those two the same way
 * tells a user nobody observed an epoch that ten observers observed, and a
 * live read cannot correct it: the accounts are gone, so the fallback scan
 * comes back empty too and confirms the wrong answer.
 */
export type EpochCapture = 'complete' | 'partial' | 'missing' | 'unknown';

export type CaptureSummary =
  /** The held rows are the whole truth. A zero here is a real zero. */
  | { kind: 'authoritative' }
  /**
   * The chain counted more observations than the archive holds. `held` is a
   * floor, never a total, and no participation rate computed from it is valid.
   */
  | { kind: 'shortfall'; held: number; submitted: number }
  /**
   * Not knowable from the archive — no chain tally, or the epoch is still
   * running and has simply not been observed yet. The live read is the
   * authority here, not this document.
   */
  | { kind: 'indeterminate' };

/**
 * Decide whether a held observation count can be stated as fact.
 *
 * Deliberately driven by `capture` rather than by comparing the counts
 * ourselves: the publisher compares against the chain's own
 * `observations_submitted` at capture time, which is the only moment both
 * numbers are knowable. Recomputing it later from a tally that may itself be
 * absent would reintroduce the guess this field exists to remove.
 */
export function summarizeCapture({
  capture,
  held,
  chainObservationsSubmitted,
}: {
  capture?: EpochCapture;
  held: number;
  chainObservationsSubmitted?: number | null;
}): CaptureSummary {
  if (capture === 'complete') return { kind: 'authoritative' };

  if (capture === 'partial' || capture === 'missing') {
    // The chain tally is what makes a shortfall quantifiable. Without it we
    // still know the held count is short, but not by how much — and "N of ?"
    // states less than plain uncertainty does.
    const submitted =
      typeof chainObservationsSubmitted === 'number' &&
      chainObservationsSubmitted > held
        ? chainObservationsSubmitted
        : undefined;
    return submitted === undefined
      ? { kind: 'indeterminate' }
      : { kind: 'shortfall', held, submitted };
  }

  return { kind: 'indeterminate' };
}

/**
 * One short line for a header, or null when the count needs no qualification.
 *
 * Phrased around what is missing rather than around what we have, because the
 * failure mode this exists to prevent is a reader taking a partial count for a
 * complete one.
 */
export function describeCaptureShortfall(
  summary: CaptureSummary,
): string | null {
  if (summary.kind !== 'shortfall') return null;
  const { held, submitted } = summary;
  if (held === 0) {
    return `${submitted} report${submitted === 1 ? '' : 's'} submitted, none captured`;
  }
  return `${held} of ${submitted} reports captured`;
}
