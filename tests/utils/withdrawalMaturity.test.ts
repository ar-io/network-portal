import { VaultData } from '@ar.io/sdk/web';
import {
  UNLOCK_SKEW_MARGIN_MS,
  calculateInstantWithdrawalPenaltyRate,
  canStillExpedite,
  isWithdrawalUnlocked,
} from '@src/utils/stake';

const DAY = 24 * 60 * 60 * 1000;
const START = Date.UTC(2026, 7, 1);
const THIRTY_DAYS = 30 * DAY;

const vault = (startTimestamp = START, endTimestamp = START + THIRTY_DAYS) =>
  ({ balance: 1_000, startTimestamp, endTimestamp }) as VaultData;

describe('calculateInstantWithdrawalPenaltyRate', () => {
  it('starts at the 50% maximum', () => {
    expect(
      calculateInstantWithdrawalPenaltyRate(vault(), new Date(START)),
    ).toBeCloseTo(0.5, 9);
  });

  it('decays linearly across the period', () => {
    expect(
      calculateInstantWithdrawalPenaltyRate(
        vault(),
        new Date(START + THIRTY_DAYS / 2),
      ),
    ).toBeCloseTo(0.3, 9);
  });

  it('reaches the 10% minimum exactly at maturity', () => {
    expect(
      calculateInstantWithdrawalPenaltyRate(
        vault(),
        new Date(START + THIRTY_DAYS),
      ),
    ).toBeCloseTo(0.1, 9);
  });

  /**
   * The bug behind the reported "no claim option" case: the decay kept
   * falling past maturity, so the modal quoted 7.33% two days late while
   * `instant_withdrawal` charged the 10% floor, and quoted a negative fee
   * from 42 days on.
   */
  it('holds at the minimum after maturity, never below', () => {
    for (const daysLate of [1, 2, 12, 60, 365]) {
      expect(
        calculateInstantWithdrawalPenaltyRate(
          vault(),
          new Date(START + THIRTY_DAYS + daysLate * DAY),
        ),
      ).toBeCloseTo(0.1, 9);
    }
  });

  it('never exceeds the maximum before the period starts', () => {
    expect(
      calculateInstantWithdrawalPenaltyRate(vault(), new Date(START - DAY)),
    ).toBeCloseTo(0.5, 9);
  });

  /** `total_period == 0` takes the minimum on chain, not a division by zero. */
  it('treats a zero-length period as fully elapsed', () => {
    expect(
      calculateInstantWithdrawalPenaltyRate(
        vault(START, START),
        new Date(START),
      ),
    ).toBeCloseTo(0.1, 9);
  });
});

describe('isWithdrawalUnlocked', () => {
  it('is locked before the end timestamp', () => {
    expect(isWithdrawalUnlocked(START + THIRTY_DAYS, START)).toBe(false);
  });

  /** The chain's guard is `>=`, so the boundary instant is claimable. */
  it('is unlocked at the end timestamp', () => {
    expect(isWithdrawalUnlocked(START, START)).toBe(true);
  });

  it('is unlocked after the end timestamp', () => {
    expect(isWithdrawalUnlocked(START, START + DAY)).toBe(true);
  });
});

describe('canStillExpedite', () => {
  const END = START + THIRTY_DAYS;

  it('is offered while the withdrawal is locked', () => {
    expect(canStillExpedite(END, END - DAY)).toBe(true);
  });

  /**
   * The margin exists because the chain gates on its own clock. Claim appears
   * at maturity, but the alternative is not taken away until the two clocks
   * cannot plausibly disagree.
   */
  it('is still offered just past maturity', () => {
    expect(canStillExpedite(END, END + 1000)).toBe(true);
  });

  it('is withdrawn once the margin has passed', () => {
    expect(canStillExpedite(END, END + UNLOCK_SKEW_MARGIN_MS + 1)).toBe(false);
  });

  /**
   * The instant both tables must schedule a re-render for: the margin is
   * exclusive, so the option is gone the moment it is reached.
   */
  it('turns over at the margin, exclusive', () => {
    expect(canStillExpedite(END, END + UNLOCK_SKEW_MARGIN_MS - 1)).toBe(true);
    expect(canStillExpedite(END, END + UNLOCK_SKEW_MARGIN_MS)).toBe(false);
  });
});
