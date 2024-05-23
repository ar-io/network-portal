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
  min: number,
  max?: number,
): FormValidationFunction => {
  return (v: string) => {
    const value = parseFloat(v);

    if(max) {
      return value < min || value > max || isNaN(v as unknown as number)
        ? `${propertyName} must be a number from ${min} to ${max} IO.`
        : undefined;
    }
    return value < min || isNaN(v as unknown as number)
      ? `${propertyName} must be a number >= ${min} IO.`
      : undefined;
  };
};

export const validateNumberRange = (
  propertyName: string,
  min: number,
  max: number,
): FormValidationFunction => {
  return (v: string) => {
    const value = parseFloat(v);

    // because parseFloat parses initial valid numbers then discards any remaining invalid text, 
    // need to use isNan(v as unknown as number) to check for invalid text like "3adsfwe". 
    return value < min || value > max || isNaN(v as unknown as number)
      ? `${propertyName} must be a number from ${min} to ${max}.`
      : undefined;
  };
};
