import { FQDN_REGEX } from '@ar.io/sdk/web';
import {
  formatARIOExact,
  isArweaveTransactionID,
  isValidSolanaAddress,
} from '@src/utils';

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
    return v.trim() === '' || !isValidSolanaAddress(v)
      ? `${propertyName} is required and must be a valid Solana wallet address.`
      : undefined;
  };
};

export const validateTransactionId = (
  propertyName: string,
): FormValidationFunction => {
  return (v: string) => {
    return v.trim() === '' || !isArweaveTransactionID(v)
      ? `${propertyName} is required and must be a valid Arweave transaction ID.`
      : undefined;
  };
};

export const validateARIOAmount = (
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
        return `${propertyName} must be a number >= ${formatARIOExact(min)} ${ticker}.`;
      }

      return value < min || value > max
        ? `${propertyName} must be a number from ${formatARIOExact(min)} to ${formatARIOExact(max)} ${ticker}.`
        : undefined;
    }
    return value < min || isNaN(value)
      ? `${propertyName} must be a number >= ${formatARIOExact(min)} ${ticker}.`
      : undefined;
  };
};

/**
 * A delegate stake amount, where the gateway's minimum applies to the amount
 * being added rather than to the resulting total.
 *
 * `delegate_stake` checks `amount >= min_delegation_amount` before it reads
 * the existing delegation, so a delegator already holding far above the
 * minimum still cannot add less than it. A wallet with 3,773 ARIO staked at a
 * gateway whose minimum is 500 cannot add 250.
 *
 * That is a divergence from the Lua reference, which drops the floor to
 * 1 mARIO once `existingDelegate.delegatedStake ~= 0` precisely so an
 * operator raising the minimum cannot strand existing delegators, and from
 * the Solana program's own `redelegate_stake`, which guards the identical
 * check with `target_delegation.amount == 0`.
 *
 * Until the program is fixed the form has to enforce the stricter rule —
 * offering an amount the program rejects with `DelegationBelowMinimum` is
 * worse than refusing it here — so this says why instead of printing a bare
 * range the delegator cannot make sense of. When the program is fixed, the
 * minimum for an existing delegator becomes 1 and this message stops being
 * reachable.
 */
export const validateDelegateStakeAmount = (
  propertyName: string,
  ticker: string,
  min: number,
  max: number | undefined,
  currentStake: number,
): FormValidationFunction => {
  const base = validateARIOAmount(propertyName, ticker, min, max);

  return (v: string) => {
    const error = base(v);
    if (error === undefined) {
      return undefined;
    }

    const value = +v;
    if (currentStake > 0 && v.length > 0 && !isNaN(value) && value < min) {
      return `This gateway requires at least ${formatARIOExact(min)} ${ticker} per deposit, even though you already have ${formatARIOExact(currentStake)} ${ticker} staked here. Add ${formatARIOExact(min)} ${ticker} or more.`;
    }

    return error;
  };
};

export const validateNumberRange = (
  propertyName: string,
  min: number,
  max: number,
): FormValidationFunction => {
  return (v: string) => {
    const value = +v;

    return v.length === 0 || value < min || value > max || isNaN(value)
      ? `${propertyName} must be a number from ${min} to ${max}.`
      : undefined;
  };
};

export const validateOperatorWithdrawAmount = (
  propertyName: string,
  ticker: string,
  currentStake: number,
): FormValidationFunction => {
  return (v: string) => {
    const value = +v;

    if (isNaN(value) || v.length === 0) {
      return `${propertyName} must be a number.`;
    }

    if (value < 1) {
      return `${propertyName} must be at least 1 ${ticker}.`;
    }

    if (value > currentStake - 10000) {
      return `${propertyName} cannot be greater than your current stake of ${currentStake} ${ticker} minus the base stake (10000 ${ticker}) required for gateways.`;
    }

    return undefined;
  };
};

export const validateWithdrawAmount = (
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
      value !== minDelegatedStake &&
      value !== currentStake
    ) {
      return `Withdrawing this amount will put you below the gateway's minimum stake of ${minDelegatedStake} ${ticker}. You can either: withdraw a smaller amount so your remaining stake is above the minimum - or - withdraw your full delegated stake.`;
    }

    return undefined;
  };
};
