/**
 * Wallet adapter bridge for @solana/kit compatibility.
 *
 * Bridges a `@solana/wallet-adapter` wallet (`signTransaction` over a web3.js
 * `VersionedTransaction`) into a `@solana/kit` signer the AR.IO SDK can drive.
 *
 * Why a *modifying* signer (not a *partial* signer)?
 * - Phantom (and others) REWRITE the transaction before signing on real
 *   origins — e.g. tightening the compute-unit limit or injecting their own
 *   priority-fee / Lighthouse-guard instructions (observed on prod/ngrok, not
 *   on localhost). A partial signer returns only a signature over the wallet's
 *   REWRITTEN bytes, which kit then attaches to the SDK's ORIGINAL message, so
 *   the bytes sent ≠ the bytes signed → "Transaction did not pass signature
 *   verification" (#7050012) / preflight #-32002. Pinning a non-zero fee or a
 *   tight CU limit does NOT reliably stop the rewrite.
 * - As a modifying signer we return the wallet's *rewritten* message together
 *   with its signature, so the bytes signed == the bytes sent.
 * - Multi-sig flows (e.g. `spawnSolanaANT` + a fresh mint keypair) still work:
 *   kit runs modifying signers FIRST, so the mint-keypair partial signer signs
 *   the already-rewritten message and both signatures verify.
 */

import {
  type Address,
  type Transaction as KitTransaction,
  type SignatureBytes,
  type TransactionModifyingSigner,
  type TransactionWithLifetime,
  type TransactionWithinSizeLimit,
  address,
} from '@solana/kit';
import {
  type PublicKey,
  VersionedMessage,
  VersionedTransaction,
} from '@solana/web3.js';

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
 * Create a kit-compatible `TransactionModifyingSigner` from a wallet adapter.
 *
 * The wallet is always the fee payer (signature slot 0). We deserialize kit's
 * compiled message bytes, let the wallet sign (and possibly rewrite) it, then
 * rebuild a kit `Transaction` from the wallet's RETURNED message bytes +
 * signatures so the bytes signed are the bytes sent.
 *
 * @param wallet - Connected Solana wallet adapter (Phantom, Solflare, etc.)
 * @returns Kit-compatible modifying TransactionSigner
 */
export function createWalletAdapterSigner(
  wallet: ReadyWalletAdapterSigner,
): TransactionModifyingSigner {
  const signerAddress = address(wallet.publicKey.toBase58()) as Address;
  const signTransaction = wallet.signTransaction.bind(wallet);

  return {
    address: signerAddress,
    async modifyAndSignTransactions(
      transactions: readonly KitTransaction[],
    ): Promise<
      readonly (KitTransaction &
        TransactionWithinSizeLimit &
        TransactionWithLifetime)[]
    > {
      return Promise.all(
        transactions.map(async (tx) => {
          // kit's Transaction stores the *compiled* message bytes (the exact
          // payload that goes on the wire). Rebuild a web3.js
          // VersionedTransaction off those bytes, hand it to the wallet, and
          // lift the wallet's resulting message + signatures back into kit.
          //
          // kit v6 brands `messageBytes` as a nominal `ReadonlyUint8Array`, so
          // the Uint8Array constructor overloads don't accept it directly. The
          // runtime value is a real Uint8Array.
          const messageBytes = new Uint8Array(
            tx.messageBytes as unknown as Uint8Array,
          );
          const message = VersionedMessage.deserialize(messageBytes);
          const v3tx = new VersionedTransaction(message);

          // Preserve any signatures kit may have already attached (e.g. a
          // paired keypair signer). Wallets typically only touch their own
          // slot, but copying first protects against adapters that
          // re-serialize from scratch.
          const staticAccountKeys = message.staticAccountKeys;
          const numRequired = message.header.numRequiredSignatures;
          for (let i = 0; i < numRequired; i++) {
            const accountAddress = staticAccountKeys[i].toBase58();
            const existingSig = (
              tx.signatures as Record<string, Uint8Array | null>
            )[accountAddress];
            if (existingSig) {
              v3tx.signatures[i] = existingSig;
            }
          }

          // DIAGNOSTIC: does web3.js's reserialize round-trip kit's canonical
          // messageBytes? Most v0 messages do, but compact-u16 / account
          // ordering edge cases can diverge — when they do, the wallet signs
          // `web3.serialize(web3.deserialize(X))` while the validator verifies
          // against kit's `X`, producing "did not pass signature verification"
          // even WITHOUT the wallet rewriting. Logging both makes it visible.
          const reserialized = v3tx.message.serialize();
          const matchesKit =
            reserialized.length === messageBytes.length &&
            reserialized.every((b, i) => b === messageBytes[i]);
          if (!matchesKit) {
            console.warn(
              '[wallet-bridge] web3.js reserialize ≠ kit messageBytes — wallet sig will not verify on the wire.',
              {
                kitLen: messageBytes.length,
                web3Len: reserialized.length,
              },
            );
          }

          const signed = await signTransaction(v3tx);

          // DIAGNOSTIC: did the wallet rewrite the transaction (Phantom
          // tightening the CU limit / injecting a priority fee / Lighthouse
          // guard on real origins)? EXPECTED and handled — we forward the
          // wallet's rewritten message + signature below, so signed == sent.
          const signedMessageBytes = signed.message.serialize();
          const walletKeptMessage =
            signedMessageBytes.length === messageBytes.length &&
            signedMessageBytes.every((b, i) => b === messageBytes[i]);
          if (!walletKeptMessage) {
            console.debug(
              '[wallet-bridge] wallet rewrote the transaction; forwarding its rewritten message.',
              {
                originalLen: messageBytes.length,
                signedLen: signedMessageBytes.length,
              },
            );
          }

          const sig = signed.signatures[0];
          if (!sig || sig.every((b) => b === 0)) {
            throw new Error(
              'Wallet adapter returned an unsigned transaction (signature slot 0 is empty).',
            );
          }

          // Collect every non-empty signer slot from the wallet's resulting
          // message (slot 0 is this wallet; other slots are left for kit's
          // remaining partial signers, e.g. a spawn mint keypair, which sign
          // over this same rewritten message).
          const signedKeys = signed.message.staticAccountKeys;
          const numSigners = signed.message.header.numRequiredSignatures;
          const signatures: Record<string, SignatureBytes> = {};
          for (let i = 0; i < numSigners; i++) {
            const s = signed.signatures[i];
            if (s && !s.every((b) => b === 0)) {
              signatures[signedKeys[i].toBase58()] = s as SignatureBytes;
            }
          }

          // Carry the original lifetime (blockhash + lastValidBlockHeight) onto
          // the rewritten tx. The wallet only adds/edits instructions; it keeps
          // the blockhash, and kit's confirmation step requires this constraint.
          const lifetimeConstraint = (
            tx as KitTransaction & Partial<TransactionWithLifetime>
          ).lifetimeConstraint;

          return {
            messageBytes:
              signed.message.serialize() as unknown as KitTransaction['messageBytes'],
            signatures: signatures as unknown as KitTransaction['signatures'],
            ...(lifetimeConstraint ? { lifetimeConstraint } : {}),
          } as unknown as KitTransaction &
            TransactionWithinSizeLimit &
            TransactionWithLifetime;
        }),
      );
    },
  };
}
