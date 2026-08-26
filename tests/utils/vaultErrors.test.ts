import {
  describeVaultError,
  getVaultErrorMessage,
} from '@src/utils/vaultErrors';

describe('vaultErrors', () => {
  describe('program error codes', () => {
    it('maps the hex code a wallet reports for a below-minimum vault', () => {
      expect(
        getVaultErrorMessage(
          new Error('failed to send transaction: custom program error: 0x177e'),
        ),
      ).toMatch(/at least 100 ARIO/);
    });

    it('maps the named error when simulation logs come through instead', () => {
      expect(
        getVaultErrorMessage(new Error('Error Code: VaultBelowMinimum')),
      ).toMatch(/at least 100 ARIO/);
    });

    it('maps a self-directed locked transfer', () => {
      expect(
        getVaultErrorMessage(new Error('custom program error: 0x1773')),
      ).toMatch(/your own address/);
    });

    it('maps both lock-duration bounds distinctly', () => {
      expect(
        getVaultErrorMessage(new Error('custom program error: 0x1776')),
      ).toMatch(/too short/);
      expect(
        getVaultErrorMessage(new Error('custom program error: 0x1777')),
      ).toMatch(/too long/);
    });

    it('maps a recipient at their vault cap', () => {
      expect(
        getVaultErrorMessage(new Error('custom program error: 0x177d')),
      ).toMatch(/maximum number of vaults/);
    });

    it('is case insensitive about how the wallet spells the code', () => {
      // Wallets differ on casing for both the prefix and the digits, and a
      // missed match here shows the user raw Anchor text instead of the fix.
      for (const message of [
        'custom program error: 0x177e',
        'Custom Program Error: 0x177E',
        'Custom Program Error: 0X177E',
      ]) {
        expect(getVaultErrorMessage(new Error(message))).toMatch(
          /at least 100 ARIO/,
        );
      }
    });
  });

  describe('stale vault address', () => {
    it('explains the counter race rather than leaking Anchor text', () => {
      for (const message of [
        'Allocate: account Address { ... } already in use',
        'AnchorError caused by account: vault. Error Code: ConstraintSeeds',
        'A seeds constraint was violated',
      ]) {
        expect(getVaultErrorMessage(new Error(message))).toMatch(
          /while you were signing/,
        );
      }
    });
  });

  describe('unrecognised failures', () => {
    it('returns undefined so callers can fall back', () => {
      expect(
        getVaultErrorMessage(new Error('User rejected the request')),
      ).toBeUndefined();
    });

    it('describeVaultError falls back to the raw message', () => {
      expect(describeVaultError(new Error('User rejected the request'))).toBe(
        'User rejected the request',
      );
    });

    it('describeVaultError handles non-Error throwables', () => {
      expect(describeVaultError('custom program error: 0x177e')).toMatch(
        /at least 100 ARIO/,
      );
      expect(describeVaultError({ some: 'object' })).toBe('{"some":"object"}');
    });
  });
});
