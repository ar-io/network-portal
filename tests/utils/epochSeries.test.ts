import { isLiveEpoch, latestSettledIndex } from '@src/utils/epochSeries';

const series = (...indexes: number[]) =>
  indexes.map((epochIndex) => ({ epochIndex }));

describe('latestSettledIndex', () => {
  /**
   * The bug this exists for: the panel led with the last point, which is the
   * epoch still running. Minutes after a rollover that reads 0/50, and as a
   * headline beside a red delta it says the network failed.
   */
  it('skips the epoch in progress', () => {
    expect(latestSettledIndex(series(830, 831, 832), 832)).toEqual(1);
  });

  it('is the last point when every epoch has finished', () => {
    expect(latestSettledIndex(series(830, 831, 832), 833)).toEqual(2);
  });

  /** Better to show the live epoch than an empty panel. */
  it('falls back to the live epoch when nothing has finished', () => {
    expect(latestSettledIndex(series(832), 832)).toEqual(0);
  });

  it('leads with the last point when the current epoch is unknown', () => {
    expect(latestSettledIndex(series(830, 831), undefined)).toEqual(1);
  });

  it('has nothing to lead with for an empty series', () => {
    expect(latestSettledIndex([], 832)).toBeUndefined();
  });

  /** A series can trail the chain if a later epoch was omitted. */
  it('handles a series that stops short of the current epoch', () => {
    expect(latestSettledIndex(series(828, 829), 832)).toEqual(1);
  });
});

describe('isLiveEpoch', () => {
  it('is true for the running epoch', () => {
    expect(isLiveEpoch({ epochIndex: 832 }, 832)).toBe(true);
  });

  it('is false for a finished epoch', () => {
    expect(isLiveEpoch({ epochIndex: 831 }, 832)).toBe(false);
  });

  it('is false when either side is unknown', () => {
    expect(isLiveEpoch(undefined, 832)).toBe(false);
    expect(isLiveEpoch({ epochIndex: 832 }, undefined)).toBe(false);
  });
});
