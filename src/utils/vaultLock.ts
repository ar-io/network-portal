import dayjs from 'dayjs';

/**
 * Rules and date/duration conversion for locked transfers (vaulted transfers).
 *
 * **The chain stores a duration, not a date.** `vaultedTransfer` sends
 * `lockDurationSeconds` and the program computes
 * `end_timestamp = clock.unix_timestamp + duration` when the transaction
 * *lands*. A vault therefore unlocks slightly later than the date the user
 * picked — by however long the wallet round-trip took, which a hardware wallet
 * makes noticeable. UI copy says "on or around" for that reason.
 *
 * Everything here works in whole days so a 30-day pick is exactly 30 days and
 * the date shown is the date the user clicked, with no rounding drift.
 */

export const MS_PER_DAY = 86_400_000;

/**
 * Minimum lock the portal will submit, in days.
 *
 * Checked client-side because the program exposes no way to read its own bound
 * — `LockDurationTooShort` (6006) is otherwise only discoverable by spending a
 * signature on it. The value mirrors the SDK's `assertLockLengthInRange`, and
 * live data agrees: across all 716 mainnet vaults the shortest is exactly
 * 1,209,600,000 ms, i.e. 14.000 days, with none below it.
 */
export const MIN_LOCK_DAYS = 14;

/**
 * Maximum lock in days (~12 years), matching the SDK's documented cap. The
 * longest vault on mainnet is ~1,720 days, well inside it.
 */
export const MAX_LOCK_DAYS = 4380;

/**
 * Minimum ARIO per vault, enforced on chain — the program names the figure in
 * the error itself (`VaultBelowMinimum`, 6014: "below minimum (100 ARIO)"), and
 * no live vault on either network sits under it.
 */
export const MIN_VAULT_ARIO = 100;

/** Durations offered as one-click chips, in days. */
export const LOCK_PRESETS: ReadonlyArray<{ label: string; days: number }> = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];

export const lockDaysToMs = (days: number): number => days * MS_PER_DAY;

/** The date a lock of `days` starting at `from` unlocks on. */
export const unlockDateFromDays = (days: number, from: Date = new Date()) =>
  dayjs(from).add(days, 'day').toDate();

/**
 * Whole calendar days between `from` and `date`.
 *
 * Both sides are floored to the start of the day so picking "the 25th" always
 * yields the same number of days regardless of the time of day it was picked.
 */
export const lockDaysFromDate = (date: Date, from: Date = new Date()): number =>
  dayjs(date).startOf('day').diff(dayjs(from).startOf('day'), 'day');

/** Earliest date the picker may offer. */
export const minUnlockDate = (from: Date = new Date()) =>
  unlockDateFromDays(MIN_LOCK_DAYS, from);

/** Latest date the picker may offer. */
export const maxUnlockDate = (from: Date = new Date()) =>
  unlockDateFromDays(MAX_LOCK_DAYS, from);

/**
 * Human-readable lock length. Long locks lead with years but keep the exact
 * day count, because "12 years" alone hides whether the user picked 4380 days
 * or 4379 and this is the number they are agreeing to.
 */
export const formatLockDuration = (days: number): string => {
  if (days < 365) {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  const years = days / 365;
  const label = Number.isInteger(years)
    ? `${years} ${years === 1 ? 'year' : 'years'}`
    : `${years.toFixed(1)} years`;
  return `${label} (${days.toLocaleString()} days)`;
};

/** Validate a lock length in days. Returns an error message, or undefined. */
export const validateLockDays = (days: number): string | undefined => {
  if (!Number.isFinite(days) || !Number.isInteger(days)) {
    return 'Select an unlock date.';
  }
  if (days < MIN_LOCK_DAYS) {
    return `Unlock date must be at least ${MIN_LOCK_DAYS} days from today.`;
  }
  if (days > MAX_LOCK_DAYS) {
    return `Unlock date must be within ${formatLockDuration(MAX_LOCK_DAYS)} of today.`;
  }
  return undefined;
};

/**
 * Validate the amount going into a vault. Separate from the plain-transfer
 * check because a vault has a protocol minimum a plain transfer does not.
 */
export const validateVaultAmount = (
  amount: number,
  balance: number,
  ticker: string,
): string | undefined => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Invalid amount';
  }
  if (amount < MIN_VAULT_ARIO) {
    return `Locked transfers must be at least ${MIN_VAULT_ARIO} ${ticker}.`;
  }
  if (amount > balance) {
    return 'Insufficient funds.';
  }
  return undefined;
};
