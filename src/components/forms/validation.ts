import { ARWEAVE_TX_REGEX, FQDN_REGEX } from '@ar.io/sdk/web';

/* Higher-order functions that return a FormValidationFunction for use with FormRowDefs */

export type FormValidationFunction = (v: string) => string | undefined;

export const validateString = (
  propertyName: string,
  min: number,
  max: number,
): FormValidationFunction => {
  return (v: string) => {
    return v.trim().length < min || v.trim().length > max
      ? `${propertyName} is required and must be ${min}-${max} characters in length.`
      : undefined;
  };
};

export const validateDomainName = (
  propertyName: string,
): FormValidationFunction => {
  return (v: string) => {
    return v.trim() === '' || !FQDN_REGEX.test(v)
      ? `${propertyName} is required and must be a valid domain name.`
      : undefined;
  };
};

export const validateWalletAddress = (
  propertyName: string,
): FormValidationFunction => {
  return (v: string) => {
    return v.trim() === '' || !ARWEAVE_TX_REGEX.test(v)
      ? `${propertyName} is required and must be a wallet address.`
      : undefined;
  };
};

export const validateTransactionId = (
  propertyName: string,
): FormValidationFunction => {
  return (v: string) => {
    return v.trim() === '' || !ARWEAVE_TX_REGEX.test(v)
      ? `${propertyName} is required and must be a valid Arweave transaction ID.`
      : undefined;
  };
};

export const validateIOAmount = (
  propertyName: string,
  ticker: string,
  min: number,
  max?: number,
): FormValidationFunction => {
  return (v: string) => {
    const value = +v;

    if (max) {
      if (isNaN(value)) {
        return `${propertyName} must be a number.`;
      } else if (max <= min && value < min) {
        return `${propertyName} must be a number >= ${min} ${ticker}.`;
      }

      return value < min || value > max
        ? `${propertyName} must be a number from ${min} to ${max} ${ticker}.`
        : undefined;
    }
    return value < min || isNaN(value)
      ? `${propertyName} must be a number >= ${min} ${ticker}.`
      : undefined;
  };
};

export const validateNumberRange = (
  propertyName: string,
  min: number,
  max: number,
): FormValidationFunction => {
  return (v: string) => {
    const value = +v;

    return v.length == 0 || value < min || value > max || isNaN(value)
      ? `${propertyName} must be a number from ${min} to ${max}.`
      : undefined;
  };
};

export const validateUnstakeAmount = (
  propertyName: string,
  ticker: string,
  currentStake: number,
  minDelegatedStake: number,
): FormValidationFunction => {
  return (v: string) => {
    const value = +v;

    if (isNaN(value) || v.length === 0) {
      return `${propertyName} must be a number.`;
    }

    if (value < 1) {
      return `${propertyName} must be at least 1 ${ticker}.`;
    }

    if (value > currentStake) {
      return `${propertyName} cannot be greater than your current stake of ${currentStake} ${ticker}.`;
    }

    if (
      currentStake - value < minDelegatedStake &&
      value != minDelegatedStake &&
      value != currentStake
    ) {
      return `Withdrawing this amount will put you below the gateway's minimum stake of ${minDelegatedStake} ${ticker}. You can either: withdraw a smaller amount so your remaining stake is above the minimum - or - withdraw your full delegated stake.`;
    }

    return undefined;
  };
};
