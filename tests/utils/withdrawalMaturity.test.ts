import { VaultData } from '@ar.io/sdk/web';
import {
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

describe('canStillExpedite and protected vaults', () => {
  const now = Date.UTC(2026, 9, 9);

  it('refuses a protected vault however far it is from unlocking', () => {
    // The live case: a departing operator's 20,000 ARIO minimum stake. The
    // program rejects `instant_withdrawal` with ProtectedVault for the whole
    // leave period, so offering it offers a guaranteed failure.
    expect(
      canStillExpedite(
        { endTimestamp: now + 60 * DAY, isProtected: true },
        now,
      ),
    ).toBe(false);
  });

  it('still offers it on the unprotected vault from the same exit', () => {
    // A leave produces two vaults and only the minimum-stake one is
    // protected; the excess above it can still be expedited.
    expect(
      canStillExpedite(
        { endTimestamp: now + 10 * DAY, isProtected: false },
        now,
      ),
    ).toBe(true);
  });

  it('refuses a protected vault that has already matured', () => {
    expect(
      canStillExpedite({ endTimestamp: now - DAY, isProtected: true }, now),
    ).toBe(false);
  });

  it('still refuses an unprotected vault past its unlock', () => {
    // Claiming returns it in full, so expediting only pays a penalty for
    // nothing — the rule that was already here.
    expect(
      canStillExpedite({ endTimestamp: now - DAY, isProtected: false }, now),
    ).toBe(false);
  });
});
