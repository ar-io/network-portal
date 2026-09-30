/**
 * Which ARIO price to value an epoch at, and on what basis.
 *
 * Each epoch is normally valued at **its own close**: converting a historical
 * total at today's price is a different figure — about 16% apart over the
 * current window — and would move history whenever the price moved.
 *
 * The epoch in progress has no close, by definition. Valuing it at nothing
 * meant its bar simply vanished when the chart switched to USD, which reads as
 * "this epoch pays zero" rather than "we cannot price it yet" — the same false
 * zero the rest of this panel works to avoid. It is valued at the most recent
 * close instead, and labelled, since its total is a projection either way.
 *
 * A *past* epoch the analyzer has not caught up on keeps no price: it will get
 * its own close shortly, and substituting a neighbour's would quietly rewrite
 * history.
 *
 * The fallback is also bounded. A close is only borrowed from the epoch just
 * gone, or the one before it — see {@link MAX_BORROWED_PRICE_AGE}.
 */
/**
 * How many epochs back a borrowed close may come from.
 *
 * Mainnet epochs run a day, so the previous epoch's close is hours old and
 * stands in fairly for the one still running. If the analyzer has stalled for
 * longer than that, the newest close it holds may be days stale, and a figure
 * that far out is worse than an honest gap — the label would name the epoch,
 * but nobody reads a chart that carefully. Two allows for a single missed
 * publish without licensing a week-old price.
 */
export const MAX_BORROWED_PRICE_AGE = 2;

export type EpochPrice =
  | { price: number; basis: 'own' }
  | { price: number; basis: 'latest'; fromEpoch: number }
  | { price: undefined; basis: 'none' };

export const resolveEpochPrice = ({
  ownPrice,
  epochIndex,
  currentEpochIndex,
  latest,
}: {
  ownPrice: number | undefined;
  epochIndex: number;
  currentEpochIndex: number | undefined;
  latest: { price: number; epochIndex: number } | undefined;
}): EpochPrice => {
  if (ownPrice !== undefined) return { price: ownPrice, basis: 'own' };

  const isCurrentEpoch =
    currentEpochIndex !== undefined && epochIndex === currentEpochIndex;
  if (!isCurrentEpoch || latest === undefined) {
    return { price: undefined, basis: 'none' };
  }

  // Only from an epoch that has actually closed, and only a recent one. A
  // price stamped at or after the running epoch is not a close at all.
  const age = epochIndex - latest.epochIndex;
  if (age < 1 || age > MAX_BORROWED_PRICE_AGE) {
    return { price: undefined, basis: 'none' };
  }

  return {
    price: latest.price,
    basis: 'latest',
    fromEpoch: latest.epochIndex,
  };
};

/** The newest epoch the analyzer has priced, if any. */
export const latestPricedEpoch = (
  prices: ReadonlyMap<number, number>,
): { price: number; epochIndex: number } | undefined => {
  let best: { price: number; epochIndex: number } | undefined;
  for (const [epochIndex, price] of prices) {
    if (best === undefined || epochIndex > best.epochIndex) {
      best = { epochIndex, price };
    }
  }
  return best;
};
