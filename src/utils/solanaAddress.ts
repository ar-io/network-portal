import { PublicKey } from '@solana/web3.js';

export const isSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export const getOptionalSolanaAddress = (
  value?: string,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();
  return isSolanaAddress(trimmedValue) ? trimmedValue : undefined;
};
