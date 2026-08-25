import { deriveInflowSeries } from '@src/utils/protocolInflow';

const row = (
  epochIndex: number,
  protocolBalance: number,
  totalEligibleRewards = 0,
  arioPriceUsd: number | null = null,
) => ({ epochIndex, protocolBalance, totalEligibleRewards, arioPriceUsd });

describe('deriveInflowSeries', () => {
  it('derives inflow as the balance delta plus rewards paid', () => {
    // 2 ARIO more in the treasury after paying out 3 means 5 came in.
    const s = deriveInflowSeries([
      row(1, 10_000_000),
      row(2, 12_000_000, 3_000_000),
    ]);
    expect(s?.points).toEqual([
      expect.objectContaining({ epochIndex: 2, ario: 5 }),
    ]);
  });

  it('emits no point for the first row, since a delta needs two samples', () => {
    expect(deriveInflowSeries([row(1, 10_000_000)])).toBeUndefined();
  });

  it('reports a shrinking treasury as inflow below what it paid out', () => {
    // Paid 3, balance fell by 1, so only 2 came in — not a negative reading.
    const s = deriveInflowSeries([
      row(1, 10_000_000),
      row(2, 9_000_000, 3_000_000),
    ]);
    expect(s?.points[0].ario).toBe(2);
  });

  it('can go negative when the treasury falls by more than it paid out', () => {
    const s = deriveInflowSeries([
      row(1, 10_000_000),
      row(2, 4_000_000, 1_000_000),
    ]);
    expect(s?.points[0].ario).toBe(-5);
  });

  // A missing epoch would otherwise be attributed to the next one as a single
  // enormous epoch of income.
  it('skips non-consecutive epochs rather than spanning the gap', () => {
    const s = deriveInflowSeries([
      row(1, 10_000_000),
      row(2, 11_000_000),
      row(9, 90_000_000),
      row(10, 91_000_000),
    ]);
    expect(s?.points.map((p) => p.epochIndex)).toEqual([2, 10]);
  });

  it('prices each epoch at its own close, not the latest one', () => {
    const s = deriveInflowSeries([
      row(1, 10_000_000),
      row(2, 12_000_000, 0, 0.5),
      row(3, 14_000_000, 0, 0.25),
    ]);
    expect(s?.points.map((p) => p.usd)).toEqual([1, 0.5]);
  });

  it('leaves usd undefined when an epoch has no price', () => {
    const s = deriveInflowSeries([row(1, 10_000_000), row(2, 12_000_000)]);
    expect(s?.points[0].usd).toBeUndefined();
  });

  describe('off-scale epochs', () => {
    // Mirrors live mainnet: epoch 510 moved 631x the median and would compress
    // every other bar to a hairline on a shared axis.
    const rows = [
      row(1, 0),
      ...Array.from({ length: 10 }, (_, i) => row(i + 2, (i + 1) * 100_000)),
      row(12, 1_000_000 + 60_000_000_000_000),
    ];

    it('flags the outlier and nothing else', () => {
      const s = deriveInflowSeries(rows);
      const flagged = s?.points
        .filter((p) => p.offScale)
        .map((p) => p.epochIndex);
      expect(flagged).toEqual([12]);
    });

    it('keeps the cap above every ordinary epoch', () => {
      const s = deriveInflowSeries(rows);
      const ordinary = s?.points.filter((p) => !p.offScale) ?? [];
      for (const p of ordinary) expect(p.ario).toBeLessThanOrEqual(s?.cap ?? 0);
    });

    it('does not flag a merely negative epoch', () => {
      const s = deriveInflowSeries([
        row(1, 100_000_000),
        row(2, 10_000_000),
        row(3, 11_000_000),
      ]);
      expect(s?.points.every((p) => !p.offScale)).toBe(true);
    });
  });
});
