import { describeGarError, getGarErrorMessage } from '@src/utils/garErrors';
import { describe, expect, it } from 'vitest';

/**
 * The `AccountNotInitialized` case is taken from a real production failure:
 * a wallet withdrew its whole delegation, the program closed the account in
 * a separate transaction 27 seconds later, and every further attempt
 * simulated against a PDA that no longer existed.
 */
const PRODUCTION_FAILURE =
  'SolanaError: Solana error #-32002; Program log: Instruction: DecreaseDelegateStake, ' +
  'Program log: AnchorError caused by account: delegation. Error Code: AccountNotInitialized. ' +
  'Error Number: 3012. Error Message: The program expected this account to be already initialized., ' +
  'Program failed: custom program error: 0xbc4';

describe('getGarErrorMessage', () => {
  it('explains a withdrawal whose delegation has already been closed', () => {
    const msg = getGarErrorMessage(PRODUCTION_FAILURE);
    expect(msg).toMatch(/no record of this delegation/i);
    expect(msg).toMatch(/may already have been withdrawn/i);
  });

  it('claims nothing the error code does not establish', () => {
    // The code says the account is absent. It does not say a withdrawal
    // exists, where the tokens are, or that anything has been refreshed —
    // and `ClaimWithdrawalModal` invalidates on success only, so a promise
    // of a refresh would be false there.
    const msg = getGarErrorMessage(PRODUCTION_FAILURE) ?? '';
    expect(msg).not.toMatch(/safe/i);
    expect(msg).not.toMatch(/refreshed/i);
    expect(msg).not.toMatch(/in a withdrawal/i);
  });

  it('matches on the raw custom error code as well as the Anchor name', () => {
    // Simulation logs are not always relayed; sometimes only `0xbc4` arrives.
    expect(getGarErrorMessage('custom program error: 0xbc4')).toBe(
      getGarErrorMessage(PRODUCTION_FAILURE),
    );
  });

  it('still maps the program errors it already covered', () => {
    expect(getGarErrorMessage('Error Code: WithdrawalNotReady')).toMatch(
      /has not unlocked yet/i,
    );
    expect(getGarErrorMessage('custom program error: 0x17c2')).toMatch(
      /minimum operator stake/i,
    );
  });

  it('returns undefined for an error it does not recognise', () => {
    // Callers fall back to the raw message rather than inventing one.
    expect(getGarErrorMessage('Blockhash not found')).toBeUndefined();
  });
});

describe('describeGarError', () => {
  it('falls back to the raw message rather than swallowing it', () => {
    expect(describeGarError('Blockhash not found')).toBe('Blockhash not found');
  });

  it('never returns the raw SolanaError dump for a known case', () => {
    const shown = describeGarError(PRODUCTION_FAILURE);
    expect(shown).not.toMatch(/SolanaError|0xbc4|AnchorError/);
  });
});

describe('codes match what the chain actually reports', () => {
  /**
   * The exact message a gateway operator saw expediting a protected
   * min-stake exit vault. `ProtectedVault` is 6082, which the runtime prints
   * as 0x17c2 — it had been written 0x17d2 (6098), so nothing matched and the
   * operator got the raw transaction dump.
   *
   * The old test asserted against 0x17d2 as well, so it mirrored the mistake
   * and passed. These cases are taken from real failures rather than from the
   * table they are meant to check.
   */
  const REAL_FAILURES: Array<[string, RegExp]> = [
    ['custom program error: 0x17c2', /minimum operator stake/i],
    ['custom program error: 0x1784', /has not unlocked yet/i],
    ['custom program error: 0x1786', /below the minimum/i],
    ['custom program error: 0xbc4', /no record of this delegation/i],
  ];

  for (const [raw, expected] of REAL_FAILURES) {
    it(`maps ${raw}`, () => {
      expect(getGarErrorMessage(raw)).toMatch(expected);
    });
  }

  it('does not match a code one digit off, which is how this broke', () => {
    // 0x17d2 is 6098 and belongs to nothing.
    expect(getGarErrorMessage('custom program error: 0x17d2')).toBeUndefined();
  });
});
