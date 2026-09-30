import { nextFutureTimestamp, scheduleDelay } from '@src/hooks/useTickAt';

const NOW = Date.UTC(2026, 8, 29);
const MINUTE = 60 * 1000;

describe('nextFutureTimestamp', () => {
  it('returns nothing when every instant has passed', () => {
    expect(
      nextFutureTimestamp([NOW - MINUTE, NOW - 10 * MINUTE], NOW),
    ).toBeUndefined();
  });

  /** The boundary instant is already claimable, so it is not still to come. */
  it('treats the current instant as passed', () => {
    expect(nextFutureTimestamp([NOW], NOW)).toBeUndefined();
  });

  it('picks the soonest instant still ahead', () => {
    expect(
      nextFutureTimestamp(
        [NOW + 10 * MINUTE, NOW + MINUTE, NOW + 60 * MINUTE],
        NOW,
      ),
    ).toEqual(NOW + MINUTE);
  });

  it('ignores passed instants when choosing', () => {
    expect(nextFutureTimestamp([NOW - MINUTE, NOW + 5 * MINUTE], NOW)).toEqual(
      NOW + 5 * MINUTE,
    );
  });

  /** Rows without a withdrawal carry no date. */
  it('skips undefined entries', () => {
    expect(
      nextFutureTimestamp([undefined, NOW + MINUTE, undefined], NOW),
    ).toEqual(NOW + MINUTE);
  });

  it('returns nothing for an empty list', () => {
    expect(nextFutureTimestamp([], NOW)).toBeUndefined();
  });
});

describe('scheduleDelay', () => {
  it('waits a second past the boundary so the comparison is settled', () => {
    expect(scheduleDelay(NOW + MINUTE, NOW)).toEqual(MINUTE + 1000);
  });

  it('arms nothing for an instant that has passed', () => {
    expect(scheduleDelay(NOW - MINUTE, NOW)).toBeUndefined();
    expect(scheduleDelay(NOW, NOW)).toBeUndefined();
  });

  /**
   * setTimeout overflows past 2^31-1 ms and fires immediately, which for a
   * 30-day withdrawal would be every render. Long waits clamp and re-arm.
   */
  it('clamps a wait longer than setTimeout can express', () => {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    expect(scheduleDelay(NOW + thirtyDays, NOW)).toEqual(2_147_483_647);
  });

  /**
   * `NaN <= 0` is false, so a naive guard would schedule `setTimeout(fn, NaN)`
   * — a zero delay that re-renders, re-runs the effect and spins.
   */
  it('arms nothing for a NaN instant', () => {
    expect(scheduleDelay(Number.NaN, NOW)).toBeUndefined();
  });
});
