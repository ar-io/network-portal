/**
 * Wallet adapter bridge for @solana/kit compatibility.
 *
 * Creates a kit-compatible TransactionSigner from Solana wallet-adapter
 * signers by handling the transaction format conversion between kit and web3.js.
 */

import {
  type SignatureDictionary,
  type Transaction,
  type TransactionSigner,
  address,
  getBase64EncodedWireTransaction,
  signatureBytes,
} from '@solana/kit';
import { type PublicKey, VersionedTransaction } from '@solana/web3.js';

export type WalletAdapterSigner = {
  connected: boolean;
  publicKey: PublicKey | null;
  signTransaction?: (
    transaction: VersionedTransaction,
  ) => Promise<VersionedTransaction>;
};

type ReadyWalletAdapterSigner = {
  connected: true;
  publicKey: PublicKey;
  signTransaction: (
    transaction: VersionedTransaction,
  ) => Promise<VersionedTransaction>;
};

/**
 * Check if a wallet adapter is ready for signing operations.
 */
export function isWalletAdapterReady(
  wallet: WalletAdapterSigner,
): wallet is ReadyWalletAdapterSigner {
  return (
    wallet.connected === true &&
    wallet.publicKey !== null &&
    typeof wallet.signTransaction === 'function'
  );
}

/**
 * Create a kit-compatible TransactionSigner from a wallet adapter.
 *
 * This bridges @solana/kit transactions to wallet adapter signing by:
 * 1. Compiling kit transactions to wire format
 * 2. Converting to VersionedTransaction for wallet signing
 * 3. Converting signed result back to kit format
 *
 * @param wallet - Connected Solana wallet adapter (Phantom, Solflare, etc.)
 * @returns Kit-compatible TransactionSigner
 */
export function createWalletAdapterSigner(
  wallet: ReadyWalletAdapterSigner,
): TransactionSigner {
  const signerAddress = address(wallet.publicKey.toBase58());

  const decodeBase64 = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const extractSignatureDictionary = (
    signedTx: VersionedTransaction,
  ): SignatureDictionary => {
    const signerIndex = signedTx.message.staticAccountKeys.findIndex(
      (key, index) =>
        index < signedTx.message.header.numRequiredSignatures &&
        key.equals(wallet.publicKey!),
    );

    if (signerIndex < 0) {
      throw new Error(
        'Wallet signer address is not a required signer on this transaction',
      );
    }

    const signature = signedTx.signatures[signerIndex];
    if (!signature || signature.every((byte) => byte === 0)) {
      throw new Error(
        'Wallet did not produce a signature for this transaction',
      );
    }

    return Object.freeze({ [signerAddress]: signatureBytes(signature) });
  };

  return {
    address: signerAddress,

    async signTransactions(transactions) {
      try {
        // Kit passes compiled transactions here. Convert to web3 VersionedTransaction,
        // sign, then return signature dictionaries keyed by signer address.
        const signatureDictionaries: SignatureDictionary[] = [];

        for (const tx of transactions as readonly Transaction[]) {
          const wireBase64 = getBase64EncodedWireTransaction(tx);
          const wireBytes = decodeBase64(wireBase64);
          const versionedTx = VersionedTransaction.deserialize(wireBytes);

          const signedTx = await wallet.signTransaction(versionedTx);
          signatureDictionaries.push(extractSignatureDictionary(signedTx));
        }

        return signatureDictionaries;
      } catch (error) {
        console.error('Failed to sign transactions:', error);
        throw new Error(
          `Transaction signing failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
}
