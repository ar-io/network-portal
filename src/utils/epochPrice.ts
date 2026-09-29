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
 */
export type EpochPrice =
  | { price: number; basis: 'own' }
  | { price: number; basis: 'latest'; fromEpoch: number }
  | { price: undefined; basis: 'none' };

export const resolveEpochPrice = ({
  ownPrice,
  isCurrentEpoch,
  latest,
}: {
  ownPrice: number | undefined;
  isCurrentEpoch: boolean;
  latest: { price: number; epochIndex: number } | undefined;
}): EpochPrice => {
  if (ownPrice !== undefined) return { price: ownPrice, basis: 'own' };
  if (isCurrentEpoch && latest !== undefined) {
    return {
      price: latest.price,
      basis: 'latest',
      fromEpoch: latest.epochIndex,
    };
  }
  return { price: undefined, basis: 'none' };
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
