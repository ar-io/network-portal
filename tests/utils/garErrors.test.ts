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
    expect(getGarErrorMessage('custom program error: 0x17d2')).toMatch(
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
