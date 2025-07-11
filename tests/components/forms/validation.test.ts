import {
  validateARIOAmount,
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
        'Wallet Address is required and must be a wallet address.',
      );
    });

    it('should pass for valid wallet address', () => {
      expect(
        validator('_NctcA2sRy1-J4OmIQZbYFPM17piNcbdBPH2ncX2RL8'),
      ).toBeUndefined();
    });

    it('should fail for invalid wallet address', () => {
      expect(validator('_NctcA2sRy1-J4OmIQZbYFPM17piNcbdBPH2ncX2RL')).toEqual(
        'Wallet Address is required and must be a wallet address.',
      );
      expect(validator('invalid_address')).toEqual(
        'Wallet Address is required and must be a wallet address.',
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

  describe('validateIOAmount', () => {
    const validator = validateARIOAmount('tIO Amount', 'tIO', 10, 100);

    it('should fail for empty string', () => {
      expect(validator('')).toEqual(
        `tIO Amount must be a number from 10 to 100 tIO.`,
      );
    });

    it('should pass for valid number within range', () => {
      expect(validator('50')).toBeUndefined();
    });

    it('should fail for invalid number string', () => {
      expect(validator('true')).toEqual(`tIO Amount must be a number.`);
      expect(validator('10 IO')).toEqual(`tIO Amount must be a number.`);
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
    const validator = validateWithdrawAmount('Unstake Amount', 'tIO', 100, 10);

    it('should fail for empty string', () => {
      expect(validator('')).toEqual('Unstake Amount must be a number.');
    });

    it('should pass for valid unstake amount', () => {
      expect(validator('50')).toBeUndefined();
    });

    it('should fail for invalid unstake amount', () => {
      expect(validator('true')).toEqual('Unstake Amount must be a number.');
      expect(validator('1000')).toEqual(
        `Unstake Amount cannot be greater than your current stake of 100 tIO.`,
      );
    });
  });
});
