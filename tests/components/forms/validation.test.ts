import {
  validateARIOAmount,
  validateDelegateStakeAmount,
  validateDomainName,
  validateNumberRange,
  validateString,
  validateTransactionId,
  validateWalletAddress,
  validateWithdrawAmount,
} from '@src/components/forms/validation';

describe('Form Validation Functions', () => {
  describe('validateString', () => {
    const validator = validateString('Test Property', 3, 10);

    it('should fail for empty string', () => {
      expect(validator('')).toEqual(
        'Test Property is required and must be 3-10 characters in length.',
      );
    });

    it('should pass for valid string length', () => {
      expect(validator('valid')).toBeUndefined();
    });

    it('should fail for invalid string length', () => {
      expect(validator('no')).toEqual(
        'Test Property is required and must be 3-10 characters in length.',
      );
    });
  });

  describe('validateDomainName', () => {
    const validator = validateDomainName('Domain');

    it('should fail for empty string', () => {
      expect(validator('')).toEqual(
        'Domain is required and must be a valid domain name.',
      );
    });

    it('should pass for valid domain', () => {
      expect(validator('example.com')).toBeUndefined();
    });

    it('should fail for invalid domain', () => {
      expect(validator('example')).toEqual(
        'Domain is required and must be a valid domain name.',
      );
    });
  });

  describe('validateWalletAddress', () => {
    const validator = validateWalletAddress('Wallet Address');

    it('should fail for empty string', () => {
      expect(validator('')).toEqual(
        'Wallet Address is required and must be a valid Solana wallet address.',
      );
    });

    it('should pass for valid wallet address', () => {
      expect(
        validator('So11111111111111111111111111111111111111112'),
      ).toBeUndefined();
    });

    it('should fail for invalid wallet address', () => {
      expect(validator('_NctcA2sRy1-J4OmIQZbYFPM17piNcbdBPH2ncX2RL8')).toEqual(
        'Wallet Address is required and must be a valid Solana wallet address.',
      );
      expect(validator('invalid_address')).toEqual(
        'Wallet Address is required and must be a valid Solana wallet address.',
      );
    });
  });

  describe('validateTransactionId', () => {
    const validator = validateTransactionId('Transaction ID');

    it('should fail for empty string', () => {
      expect(validator('')).toEqual(
        'Transaction ID is required and must be a valid Arweave transaction ID.',
      );
    });

    it('should pass for valid transaction ID', () => {
      expect(
        validator('rYa7PKX0KBAkpRtIAhNButvNsK9qIhkKyJVkQ0os8C8'),
      ).toBeUndefined();
    });

    it('should fail for invalid transaction ID', () => {
      expect(validator('invalid_txid')).toEqual(
        'Transaction ID is required and must be a valid Arweave transaction ID.',
      );
    });
  });

  describe('validateARIOAmount', () => {
    const validator = validateARIOAmount('ARIO Amount', 'ARIO', 10, 100);

    it('should fail for empty string', () => {
      expect(validator('')).toEqual(
        `ARIO Amount must be a number from 10 to 100 ARIO.`,
      );
    });

    it('should pass for valid number within range', () => {
      expect(validator('50')).toBeUndefined();
    });

    it('should fail for invalid number string', () => {
      expect(validator('true')).toEqual(`ARIO Amount must be a number.`);
      expect(validator('10 ARIO')).toEqual(`ARIO Amount must be a number.`);
    });
  });

  describe('validateNumberRange', () => {
    const validator = validateNumberRange('Number Range', 1, 100);

    it('should fail for empty string', () => {
      expect(validator('')).toEqual(
        'Number Range must be a number from 1 to 100.',
      );
    });

    it('should pass for valid number within range', () => {
      expect(validator('50')).toBeUndefined();
    });

    it('should fail for invalid number string', () => {
      expect(validator('true')).toEqual(
        'Number Range must be a number from 1 to 100.',
      );
      expect(validator('1000')).toEqual(
        'Number Range must be a number from 1 to 100.',
      );
    });
  });

  describe('validateUnstakeAmount', () => {
    const validator = validateWithdrawAmount('Unstake Amount', 'ARIO', 100, 10);

    it('should fail for empty string', () => {
      expect(validator('')).toEqual('Unstake Amount must be a number.');
    });

    it('should pass for valid unstake amount', () => {
      expect(validator('50')).toBeUndefined();
    });

    it('should fail for invalid unstake amount', () => {
      expect(validator('true')).toEqual('Unstake Amount must be a number.');
      expect(validator('1000')).toEqual(
        `Unstake Amount cannot be greater than your current stake of 100 ARIO.`,
      );
    });
  });

  describe('validateDelegateStakeAmount', () => {
    // The reported case: 3,773.899792 ARIO already delegated to a gateway
    // whose minimum is 500, topping up by 250.
    const EXISTING = 3773.899792;
    const MIN = 500;
    const BALANCE = 20750;

    it('explains the per-deposit minimum to an existing delegator', () => {
      const validator = validateDelegateStakeAmount(
        'Stake Amount',
        'ARIO',
        MIN,
        BALANCE,
        EXISTING,
      );
      const message = validator('250') ?? '';

      // The bare range is what made this read as a portal bug: it never says
      // the minimum applies per deposit rather than to the total.
      expect(message).not.toMatch(/must be a number from/);
      expect(message).toMatch(/per deposit/);
      expect(message).toContain('500');
      expect(message).toContain('3,773.899792');
    });

    it('still accepts a top-up at or above the minimum', () => {
      const validator = validateDelegateStakeAmount(
        'Stake Amount',
        'ARIO',
        MIN,
        BALANCE,
        EXISTING,
      );
      expect(validator('500')).toBeUndefined();
      expect(validator('750')).toBeUndefined();
    });

    it('does not claim an existing stake when there is none', () => {
      const validator = validateDelegateStakeAmount(
        'Stake Amount',
        'ARIO',
        MIN,
        BALANCE,
        0,
      );
      const message = validator('250') ?? '';

      expect(message).not.toMatch(/per deposit/);
      expect(message).not.toMatch(/already have/);
      expect(message).toMatch(/must be a number from/);
    });

    it('leaves an over-balance amount to the range message', () => {
      const validator = validateDelegateStakeAmount(
        'Stake Amount',
        'ARIO',
        MIN,
        BALANCE,
        EXISTING,
      );
      const message = validator('999999') ?? '';

      // Above the balance is a different problem and must not be described
      // as a minimum.
      expect(message).not.toMatch(/per deposit/);
      expect(message).toMatch(/must be a number from/);
    });

    it('does not fire on an empty or non-numeric input', () => {
      const validator = validateDelegateStakeAmount(
        'Stake Amount',
        'ARIO',
        MIN,
        BALANCE,
        EXISTING,
      );
      expect(validator('')).not.toMatch(/per deposit/);
      expect(validator('abc')).not.toMatch(/per deposit/);
    });
  });
});
