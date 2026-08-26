import {
  MAX_LOCK_DAYS,
  MIN_LOCK_DAYS,
  MIN_VAULT_ARIO,
  MS_PER_DAY,
  formatLockDuration,
  lockDaysFromDate,
  lockDaysToMs,
  maxUnlockDate,
  minUnlockDate,
  unlockDateFromDays,
  validateLockDays,
  validateVaultAmount,
} from '@src/utils/vaultLock';
import dayjs from 'dayjs';

/**
 * Dates are built with the local-time constructor throughout. The picker
 * renders a local calendar and `lockDaysFromDate` floors to the local day, so
 * a UTC instant in a fixture would make these tests pass or fail on the
 * runner's timezone rather than on the behaviour.
 */
const local = (y: number, m: number, d: number, h = 12, min = 0) =>
  new Date(y, m - 1, d, h, min);

describe('vaultLock', () => {
  describe('day/ms conversion', () => {
    it('converts whole days to exact milliseconds', () => {
      expect(lockDaysToMs(1)).toBe(86_400_000);
      expect(lockDaysToMs(MIN_LOCK_DAYS)).toBe(1_209_600_000);
      expect(lockDaysToMs(MAX_LOCK_DAYS)).toBe(378_432_000_000);
    });

    it('keeps the SDK bounds exactly representable in whole days', () => {
      // The SDK documents 14 days and ~12 years in ms; if either stopped
      // dividing evenly by a day the picker could not express the boundary.
      expect(1_209_600_000 % MS_PER_DAY).toBe(0);
      expect(378_432_000_000 % MS_PER_DAY).toBe(0);
    });
  });

  describe('lockDaysFromDate', () => {
    const from = local(2026, 8, 26, 14, 30);

    it('counts whole calendar days regardless of time of day', () => {
      expect(lockDaysFromDate(local(2026, 9, 25, 0, 0), from)).toBe(30);
      expect(lockDaysFromDate(local(2026, 9, 25, 23, 59), from)).toBe(30);
    });

    it('round-trips against unlockDateFromDays', () => {
      for (const days of [14, 30, 90, 365, 4380]) {
        expect(lockDaysFromDate(unlockDateFromDays(days, from), from)).toBe(
          days,
        );
      }
    });

    it('returns 0 for today and negative for the past', () => {
      expect(lockDaysFromDate(local(2026, 8, 26, 1, 0), from)).toBe(0);
      expect(lockDaysFromDate(local(2026, 8, 20), from)).toBe(-6);
    });

    it('round-trips across a daylight-saving transition', () => {
      // A calendar day is not always 24 hours. The picker must still report
      // the number of days the user actually clicked past a DST boundary.
      for (const start of [local(2026, 3, 1), local(2026, 10, 25)]) {
        for (const days of [14, 30, 90]) {
          expect(lockDaysFromDate(unlockDateFromDays(days, start), start)).toBe(
            days,
          );
        }
      }
    });
  });

  describe('picker bounds', () => {
    it('offers a first date that is exactly the minimum lock away', () => {
      const from = local(2026, 8, 26, 14, 30);
      expect(lockDaysFromDate(minUnlockDate(from), from)).toBe(MIN_LOCK_DAYS);
    });

    it('offers a last date that is exactly the maximum lock away', () => {
      const from = local(2026, 8, 26, 14, 30);
      expect(lockDaysFromDate(maxUnlockDate(from), from)).toBe(MAX_LOCK_DAYS);
    });

    it('never offers a date that would be rejected as too short', () => {
      // Across month ends, a leap day, a year boundary and both DST
      // transitions the first selectable date must still validate — an
      // off-by-one here spends a user's signature on a rejected transaction.
      for (const from of [
        local(2026, 1, 31, 23, 59),
        local(2028, 2, 28, 0, 1),
        local(2026, 12, 31, 12, 0),
        local(2026, 3, 1, 23, 30),
        local(2026, 10, 25, 0, 30),
      ]) {
        expect(
          validateLockDays(lockDaysFromDate(minUnlockDate(from), from)),
        ).toBeUndefined();
        expect(
          validateLockDays(lockDaysFromDate(maxUnlockDate(from), from)),
        ).toBeUndefined();
      }
    });
  });

  describe('validateLockDays', () => {
    it('rejects anything below the minimum', () => {
      expect(validateLockDays(MIN_LOCK_DAYS - 1)).toMatch(/at least 14 days/);
      expect(validateLockDays(0)).toMatch(/at least 14 days/);
      expect(validateLockDays(-5)).toMatch(/at least 14 days/);
    });

    it('rejects anything above the maximum', () => {
      expect(validateLockDays(MAX_LOCK_DAYS + 1)).toMatch(/within/);
    });

    it('accepts the boundaries themselves', () => {
      expect(validateLockDays(MIN_LOCK_DAYS)).toBeUndefined();
      expect(validateLockDays(MAX_LOCK_DAYS)).toBeUndefined();
    });

    it('rejects non-integer and non-finite day counts', () => {
      expect(validateLockDays(30.5)).toMatch(/Select an unlock date/);
      expect(validateLockDays(Number.NaN)).toMatch(/Select an unlock date/);
      expect(validateLockDays(Number.POSITIVE_INFINITY)).toMatch(
        /Select an unlock date/,
      );
    });
  });

  describe('validateVaultAmount', () => {
    it('enforces the on-chain 100 ARIO vault minimum', () => {
      expect(validateVaultAmount(MIN_VAULT_ARIO - 1, 1000, 'ARIO')).toMatch(
        /at least 100 ARIO/,
      );
      expect(validateVaultAmount(MIN_VAULT_ARIO, 1000, 'ARIO')).toBeUndefined();
    });

    it('rejects more than the wallet holds', () => {
      expect(validateVaultAmount(1001, 1000, 'ARIO')).toBe(
        'Insufficient funds.',
      );
    });

    it('rejects zero, negative, and non-numeric amounts', () => {
      expect(validateVaultAmount(0, 1000, 'ARIO')).toBe('Invalid amount');
      expect(validateVaultAmount(-100, 1000, 'ARIO')).toBe('Invalid amount');
      expect(validateVaultAmount(Number.NaN, 1000, 'ARIO')).toBe(
        'Invalid amount',
      );
    });

    it('reports the minimum before insufficient funds for a small balance', () => {
      // A wallet holding 5 ARIO cannot make any vault; saying "insufficient
      // funds" would imply topping up by 1 would help.
      expect(validateVaultAmount(5, 5, 'ARIO')).toMatch(/at least 100 ARIO/);
    });
  });

  describe('formatLockDuration', () => {
    it('uses days below a year', () => {
      expect(formatLockDuration(1)).toBe('1 day');
      expect(formatLockDuration(14)).toBe('14 days');
      expect(formatLockDuration(364)).toBe('364 days');
    });

    it('leads with whole years but keeps the exact day count', () => {
      expect(formatLockDuration(365)).toBe('1 year (365 days)');
      expect(formatLockDuration(730)).toBe('2 years (730 days)');
      expect(formatLockDuration(MAX_LOCK_DAYS)).toBe('12 years (4,380 days)');
    });

    it('falls back to a fractional year for uneven lengths', () => {
      expect(formatLockDuration(400)).toBe('1.1 years (400 days)');
    });
  });

  describe('unlockDateFromDays', () => {
    it('lands on the calendar date the user picked', () => {
      const from = local(2026, 8, 26, 14, 30);
      expect(dayjs(unlockDateFromDays(30, from)).format('YYYY-MM-DD')).toBe(
        '2026-09-25',
      );
    });

    it('keeps the calendar date across a DST transition', () => {
      // Deliberately calendar arithmetic, not `from + days * 24h`: the user
      // clicked a date, so that is the date to show them. The duration sent to
      // the chain stays an exact multiple of 24h via lockDaysToMs, which can
      // differ by the DST hour — hence the "on or around" wording in the UI.
      const from = local(2026, 3, 1, 12, 0);
      expect(dayjs(unlockDateFromDays(30, from)).format('YYYY-MM-DD')).toBe(
        '2026-03-31',
      );
    });
  });
});
