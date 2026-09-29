import { nextFutureTimestamp } from '@src/hooks/useTickAt';

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
