import { latestPricedEpoch, resolveEpochPrice } from '@src/utils/epochPrice';

const latest = { price: 0.00153254, epochIndex: 558 };

describe('resolveEpochPrice', () => {
  it('uses the epoch’s own close when there is one', () => {
    const r = resolveEpochPrice({
      ownPrice: 0.0013808,
      isCurrentEpoch: false,
      latest,
    });

    expect(r).toEqual({ price: 0.0013808, basis: 'own' });
  });

  /**
   * The bug: epoch 559 is in progress, so the analyzer has no close for it.
   * Valuing it at nothing made its bar vanish in USD, which reads as "pays
   * zero" rather than "cannot be priced yet".
   */
  it('falls back to the latest close for the epoch in progress', () => {
    const r = resolveEpochPrice({
      ownPrice: undefined,
      isCurrentEpoch: true,
      latest,
    });

    expect(r).toEqual({
      price: latest.price,
      basis: 'latest',
      fromEpoch: 558,
    });
  });

  /**
   * A past epoch the analyzer has not caught up on keeps no price — it gets
   * its own close shortly, and a neighbour's would rewrite history.
   */
  it('does not substitute a price for a past epoch', () => {
    const r = resolveEpochPrice({
      ownPrice: undefined,
      isCurrentEpoch: false,
      latest,
    });

    expect(r).toEqual({ price: undefined, basis: 'none' });
  });

  it('has nothing to fall back to before any epoch is priced', () => {
    const r = resolveEpochPrice({
      ownPrice: undefined,
      isCurrentEpoch: true,
      latest: undefined,
    });

    expect(r).toEqual({ price: undefined, basis: 'none' });
  });

  it('prefers its own close over the latest even when both exist', () => {
    const r = resolveEpochPrice({
      ownPrice: 0.001,
      isCurrentEpoch: true,
      latest,
    });

    expect(r.basis).toEqual('own');
    expect(r.price).toEqual(0.001);
  });
});

describe('latestPricedEpoch', () => {
  it('picks the highest epoch index, not the last inserted', () => {
    const prices = new Map([
      [557, 0.00153533],
      [558, 0.00153254],
      [551, 0.0013808],
    ]);

    expect(latestPricedEpoch(prices)).toEqual({
      epochIndex: 558,
      price: 0.00153254,
    });
  });

  it('is undefined when nothing is priced', () => {
    expect(latestPricedEpoch(new Map())).toBeUndefined();
  });
});
