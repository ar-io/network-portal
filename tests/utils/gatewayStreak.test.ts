import { gatewayStreak } from '@src/utils/gatewayStreak';

const gw = (
  status: string,
  passedConsecutiveEpochs: number,
  failedConsecutiveEpochs: number,
) =>
  ({
    status,
    stats: { passedConsecutiveEpochs, failedConsecutiveEpochs },
  }) as never;

describe('gatewayStreak', () => {
  it('reports a passing run as positive', () => {
    expect(gatewayStreak(gw('joined', 12, 0))).toBe(12);
  });

  it('reports a failing run as negative', () => {
    // The registry stores this as a positive failure counter. Sorting on that
    // counter directly would rank the worst gateway as the best.
    expect(gatewayStreak(gw('joined', 0, 7))).toBe(-7);
  });

  it('sorts a failing gateway below every passing one', () => {
    const rows = [gw('joined', 3, 0), gw('joined', 0, 9), gw('joined', 0, 0)];
    expect(rows.map(gatewayStreak).sort((a, b) => a - b)).toEqual([-9, 0, 3]);
  });

  it('does not bury failing gateways together at zero', () => {
    // The bug this exists to prevent: `stats.passedConsecutiveEpochs` is 0 for
    // every failing gateway, so ascending order — the direction a user picks
    // to find the worst — returned them in arbitrary order.
    const mild = gatewayStreak(gw('joined', 0, 1));
    const severe = gatewayStreak(gw('joined', 0, 30));
    expect(severe).toBeLessThan(mild);
  });

  it('ranks a leaving gateway below any in-progress streak', () => {
    expect(gatewayStreak(gw('leaving', 40, 0))).toBe(Number.NEGATIVE_INFINITY);
    expect(gatewayStreak(gw('leaving', 40, 0))).toBeLessThan(
      gatewayStreak(gw('joined', 0, 100)),
    );
  });
});
