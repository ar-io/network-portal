import { PublicKey } from '@solana/web3.js';

export const isSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};
