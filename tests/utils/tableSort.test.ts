import { compareRowValues } from '@src/utils/tableSort';

const sortWith = <T>(rows: T[], pick: (row: T) => unknown, opts = {}) =>
  [...rows].sort((a, b) => compareRowValues(pick(a), pick(b), opts));

describe('compareRowValues', () => {
  it('orders numbers ascending by default and descending on request', () => {
    const rows = [{ v: 3 }, { v: 1 }, { v: 2 }];
    expect(sortWith(rows, (r) => r.v).map((r) => r.v)).toEqual([1, 2, 3]);
    expect(sortWith(rows, (r) => r.v, { desc: true }).map((r) => r.v)).toEqual([
      3, 2, 1,
    ]);
  });

  it('compares strings by locale rather than code point', () => {
    const rows = [{ v: 'banana' }, { v: 'Apple' }, { v: 'cherry' }];
    expect(sortWith(rows, (r) => r.v).map((r) => r.v)).toEqual([
      'Apple',
      'banana',
      'cherry',
    ]);
  });

  it('keeps nulls last in both directions', () => {
    const rows = [{ v: 2 }, { v: null }, { v: 1 }];
    expect(sortWith(rows, (r) => r.v).map((r) => r.v)).toEqual([1, 2, null]);
    expect(sortWith(rows, (r) => r.v, { desc: true }).map((r) => r.v)).toEqual([
      2,
      1,
      null,
    ]);
  });

  describe('negative sentinels', () => {
    // The delegate table renders performance/EAY/rewardShareRatio of -1 as
    // "N/A". Without negativeMeansMissing every N/A row leads the ascending
    // sort, which is the opposite of keeping missing data last.
    const rows = [{ v: 0.9 }, { v: -1 }, { v: 0.5 }, { v: -1 }, { v: 0.7 }];

    it('sorts sentinel rows last ascending, not first', () => {
      expect(
        sortWith(rows, (r) => r.v, { negativeMeansMissing: true }).map(
          (r) => r.v,
        ),
      ).toEqual([0.5, 0.7, 0.9, -1, -1]);
    });

    it('sorts sentinel rows last descending too', () => {
      expect(
        sortWith(rows, (r) => r.v, {
          negativeMeansMissing: true,
          desc: true,
        }).map((r) => r.v),
      ).toEqual([0.9, 0.7, 0.5, -1, -1]);
    });

    it('treats negatives as real data when the column does not opt in', () => {
      // `streak` encodes a failing run as a negative: -5 is genuinely worse
      // than -1, and both are worse than any passing streak.
      const streaks = [{ v: 3 }, { v: -5 }, { v: 0 }, { v: -1 }];
      expect(sortWith(streaks, (r) => r.v).map((r) => r.v)).toEqual([
        -5, -1, 0, 3,
      ]);
    });
  });
});
