import { getErrorMessage } from './getErrorMessage';

/**
 * Turn an `ario-core` failure into something a user can act on.
 *
 * Anchor surfaces these as `custom program error: 0x177e` — or, when the
 * simulation logs come through, as `Error Code: VaultBelowMinimum`. A wallet
 * shows whichever it got, so both spellings are matched.
 *
 * Codes are from `@ar.io/solana-contracts` `core/errors/arioCore`.
 */
const CORE_ERRORS: ReadonlyArray<{
  code: number;
  name: string;
  message: string;
}> = [
  {
    code: 0x1771,
    name: 'InsufficientBalance',
    message: 'Insufficient ARIO balance for this transfer.',
  },
  {
    code: 0x1773,
    name: 'SelfTransfer',
    message:
      'You cannot send a locked transfer to your own address. Use a vault on your own tokens instead.',
  },
  {
    code: 0x1776,
    name: 'LockDurationTooShort',
    message:
      'The network rejected this lock as too short. Choose a later unlock date.',
  },
  {
    code: 0x1777,
    name: 'LockDurationTooLong',
    message:
      'The network rejected this lock as too long. Choose an earlier unlock date.',
  },
  {
    code: 0x177d,
    name: 'MaxVaultsExceeded',
    message:
      'The recipient already holds the maximum number of vaults and cannot receive another.',
  },
  {
    code: 0x177e,
    name: 'VaultBelowMinimum',
    message: 'Locked transfers must be at least 100 ARIO.',
  },
];

/**
 * A locked transfer derives its vault address from the recipient's vault
 * counter, read *before* signing. If anyone else vaults to that recipient in
 * the meantime, the derived address is stale by the time the transaction lands
 * and the account is already taken. A hardware wallet's slower confirmation
 * widens that window, which is why this gets its own message rather than
 * falling through to the raw Anchor text.
 */
const STALE_VAULT_PATTERNS = [
  'already in use',
  'constraintseeds',
  'constraint seeds',
  'a seeds constraint was violated',
];

/**
 * Map a write failure to user-facing copy, or undefined when it is not a
 * failure this module recognises (callers should fall back to the raw message).
 */
export const getVaultErrorMessage = (error: unknown): string | undefined => {
  const raw = getErrorMessage(error);
  const lower = raw.toLowerCase();

  for (const { code, name, message } of CORE_ERRORS) {
    if (
      lower.includes(`0x${code.toString(16)}`) ||
      lower.includes(name.toLowerCase())
    ) {
      return message;
    }
  }

  if (STALE_VAULT_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return 'Another vault was created for this recipient while you were signing. Please try again.';
  }

  return undefined;
};

/** The message to show the user for a failed locked transfer. */
export const describeVaultError = (error: unknown): string =>
  getVaultErrorMessage(error) ?? getErrorMessage(error);
