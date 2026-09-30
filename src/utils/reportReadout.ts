/**
 * What the observers' own reports turned out to say about one gateway.
 *
 * This runs only where the results bitmap has already named the observers
 * that failed a gateway, so every report read here is expected to explain a
 * failure. Three things can come back instead, and conflating them is how a
 * panel ends up crediting a report with an answer it did not give:
 *
 * - **A recorded failure**, with or without reasons. The ordinary case.
 * - **A recorded pass**, which contradicts the on-chain result. Reachable in
 *   practice rather than theoretical: observers frequently submit the same
 *   report transaction as each other — 34 observations over 21 distinct
 *   reports in a recent epoch — so an observer whose bitmap failed a gateway
 *   may have cited a report that passes it. That disagreement is worth
 *   showing, not hiding behind "no result".
 * - **No mention of this gateway at all**, which is legitimate for a gateway
 *   that joined mid-epoch.
 *
 * Unreadable reports are counted separately and never inferred from silence.
 */

/** The parts of an observer verdict this needs, kept structural for testing. */
export interface VerdictLike {
  observer: string;
  outcome?: { pass: boolean } | undefined;
  notAssessed?: boolean;
  unreadable?: string;
}

export interface ReportReadout {
  /** Reports recording a failure — the ones that can carry a reason. */
  explained: number;
  /** Reports recording a pass, against an on-chain result that says fail. */
  contradicted: number;
  /** Reports read that do not mention this gateway. */
  unassessed: number;
}

/**
 * Classify the verdicts belonging to the observers that failed this gateway.
 *
 * Verdicts for anyone else are ignored rather than counted: with the read
 * narrowed to the failing observers the two sets already agree, but a caller
 * that widens it must not have the totals shift underneath the sentence.
 */
export function classifyReportReadout(
  verdicts: readonly VerdictLike[],
  failingObserverIds: readonly string[],
): ReportReadout {
  const failing = new Set(failingObserverIds);
  const readout: ReportReadout = {
    explained: 0,
    contradicted: 0,
    unassessed: 0,
  };

  for (const verdict of verdicts) {
    if (!failing.has(verdict.observer)) continue;
    if (verdict.outcome?.pass === false) readout.explained += 1;
    else if (verdict.outcome?.pass === true) readout.contradicted += 1;
    else if (verdict.notAssessed) readout.unassessed += 1;
  }

  return readout;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * One line for the panel header, stating only what the reports actually said.
 *
 * Ordered by what a reader most needs: the reasons if there are any, then a
 * contradiction if there is one, then the honest "nothing here" — and the
 * unreadable tail appended to whichever it was, because a partial read must
 * never present itself as a complete one.
 */
export function describeReportReadout({
  readout,
  failingObservers,
  readCount,
  unreadableCount,
}: {
  readout: ReportReadout;
  failingObservers: number;
  readCount: number;
  unreadableCount: number;
}): string {
  const tail =
    unreadableCount > 0 ? ` ${unreadableCount} could not be read.` : '';

  if (readCount === 0) return `No report could be read.${tail}`;

  const { explained, contradicted } = readout;

  if (explained > 0) {
    const note =
      contradicted > 0
        ? ` ${plural(contradicted, 'report')} instead ${contradicted === 1 ? 'records' : 'record'} it as passing.`
        : '';
    return `Reasons read from ${explained} of ${plural(failingObservers, 'report')}.${note}${tail}`;
  }

  if (contradicted > 0) {
    return `Read ${plural(readCount, 'report')}; ${contradicted === 1 ? 'it records' : `${contradicted} record`} this gateway as passing, which the on-chain result contradicts.${tail}`;
  }

  return `Read ${plural(readCount, 'report')}; none records a result for this gateway.${tail}`;
}
