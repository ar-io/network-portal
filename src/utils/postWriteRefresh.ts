import {
  deserializeVault,
  getVaultCounterPDA,
  getVaultPDA,
  withRetry,
} from '@ar.io/sdk/solana';
import type { ARIORead } from '@ar.io/sdk/web';
import type { Commitment } from '@solana/kit';
import { address, fetchEncodedAccount } from '@solana/kit';
import { log } from '@src/constants';
import { isPortalApiEnabled } from './portalApi';
import { overlayGeneration, recordOverlay } from './snapshotOverlay';
import { getOptionalSolanaAddress } from './solanaAddress';

/**
 * The writes resolve at `confirmed`, but `fetchEncodedAccount` defaults to the
 * node's `finalized`, which is slots behind. Reading the vault counter at
 * `finalized` returns its PRE-write value, and `nextId - 1` then derives the
 * *previous* vault — pinning a stale row while the new vault stays invisible.
 */
const COMMITMENT: Commitment = 'confirmed';

/**
 * Re-read from chain the rows a write just changed, and lay them over the
 * published snapshot (see `@src/utils/snapshotOverlay` for why an overlay
 * rather than a computed delta or a live scan).
 *
 * Everything here is best-effort: the write has already landed, so a failure
 * to refresh the view must never surface as a failed transaction. The snapshot
 * corrects itself at the next publish regardless.
 */

/**
 * Refresh the balance rows for the addresses a transfer touched.
 *
 * `getBalance` is a single account read — derive the ATA, fetch it — where
 * `getBalances` is a whole-program scan, so this costs two reads rather than
 * a sweep of every token account on the network.
 */
export const refreshBalancesAfterWrite = async (
  sdk: ARIORead | undefined,
  addresses: Array<string | undefined>,
): Promise<void> => {
  // With the snapshot off, `fetchPortalDocument` returns null before
  // `applyOverlay` is reached, so every read here would populate a map nothing
  // consumes. The live scan is already current in that mode.
  if (!isPortalApiEnabled()) {
    return;
  }

  const targets = [...new Set(addresses.filter((a): a is string => !!a))];
  if (!sdk || targets.length === 0) {
    return;
  }

  // Captured before the reads: if Settings switches networks while they are in
  // flight, these rows belong to an endpoint we are no longer showing.
  const generation = overlayGeneration();

  try {
    // allSettled, not all: the RPC client is a 10 req/s bucket that halves on
    // a 429, so one address 429ing must not discard the other's good read.
    const settled = await Promise.allSettled(
      targets.map(async (address) => ({
        id: address,
        row: { address, balance: await sdk.getBalance({ address }) },
      })),
    );
    const rows = settled
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);
    if (rows.length) {
      recordOverlay('balances', rows, Date.now(), generation);
    }
    if (rows.length < targets.length) {
      log.debug('[postWriteRefresh] balances: some reads failed');
    }
  } catch (error) {
    log.debug(`[postWriteRefresh] balances: ${error}`);
  }
};

/**
 * Hide a vault the write closed, and refresh the balance that received it.
 *
 * Release and revoke both delete the Vault PDA, so there is no row to re-read
 * — the overlay records a removal instead.
 */
export const refreshAfterVaultClosed = async (
  sdk: ARIORead | undefined,
  {
    owner,
    vaultId,
    creditedTo,
  }: { owner: string; vaultId: string; creditedTo?: string },
): Promise<void> =>
  refreshAfterVaultsClosed(sdk, [{ owner, vaultId }], creditedTo);

/**
 * The batch form. A claim run closes several vaults in one pass, so the
 * credited balance is re-read once rather than once per vault.
 */
export const refreshAfterVaultsClosed = async (
  sdk: ARIORead | undefined,
  vaults: Array<{ owner: string; vaultId: string }>,
  creditedTo?: string,
): Promise<void> => {
  if (!isPortalApiEnabled()) {
    return;
  }
  const generation = overlayGeneration();

  if (vaults.length > 0) {
    recordOverlay(
      'vaults',
      vaults.map(({ owner, vaultId }) => ({
        id: `${owner}:${vaultId}`,
        row: null,
      })),
      Date.now(),
      generation,
    );
  }
  await refreshBalancesAfterWrite(sdk, [creditedTo]);
};

/** The programs store unix seconds; everything above the SDK is milliseconds. */
const secToMs = (seconds: number): number => seconds * 1000;

/**
 * Add the vault a locked transfer just created, read from its own account.
 *
 * Worth the two reads rather than constructing the row from what the form
 * knew: the vault id comes from the recipient's counter, which the SDK does
 * not return, and the end timestamp is `clock.unix_timestamp + duration`
 * evaluated when the transaction landed — so the form's date is approximate
 * and this one is exact. A wrong vault id here would point Revoke and Release
 * at the wrong vault.
 */
export const refreshVaultAfterCreate = async (
  rpc: any,
  coreProgramId: string | undefined,
  { recipient, sender }: { recipient: string; sender?: string },
  sdk?: ARIORead,
): Promise<void> => {
  const validRecipient = getOptionalSolanaAddress(recipient);
  const validCoreProgram = getOptionalSolanaAddress(coreProgramId);

  if (!isPortalApiEnabled()) {
    return;
  }

  const generation = overlayGeneration();

  // Independent of the vault lookup below, so run them together rather than
  // adding a round trip to a window gated by a 10 req/s bucket.
  const balances = refreshBalancesAfterWrite(sdk, [sender]);

  if (!rpc || !validRecipient || !validCoreProgram) {
    await balances;
    return;
  }

  try {
    const [counterPda] = await getVaultCounterPDA(
      address(validRecipient),
      address(validCoreProgram),
    );
    // `withRetry` because these are raw kit reads outside React Query, which
    // is configured with `retry: 0` — see epochFetch for the same reasoning.
    const counter = await withRetry(() =>
      fetchEncodedAccount(rpc, counterPda, { commitment: COMMITMENT }),
    );
    if (!counter.exists) return;

    // VaultCounter.next_id is a u64 at offset 40; the vault just created is the
    // one before it.
    const nextId = Buffer.from(counter.data).readBigUInt64LE(40);
    if (nextId === 0n) return;
    const vaultId = nextId - 1n;

    const [vaultPda] = await getVaultPDA(
      address(validRecipient),
      vaultId,
      address(validCoreProgram),
    );
    const vaultAccount = await withRetry(() =>
      fetchEncodedAccount(rpc, vaultPda, { commitment: COMMITMENT }),
    );
    if (!vaultAccount.exists) return;

    const vault = deserializeVault(Buffer.from(vaultAccount.data));

    recordOverlay(
      'vaults',
      [
        {
          // Keyed on `vault.owner`, the value DOCUMENT_ROW_ID.vaults reads —
          // keying on `recipient` would duplicate the row if they ever differ.
          id: `${vault.owner}:${vault.vaultId}`,
          row: {
            address: vault.owner,
            cursorId: vaultPda,
            vaultId: vault.vaultId,
            balance: vault.balance,
            // `deserializeVault` does not convert; `getVaults` applies secToMs,
            // so a raw row spliced in unconverted would render as 1970.
            startTimestamp: secToMs(vault.startTimestamp),
            endTimestamp: secToMs(vault.endTimestamp),
            controller: vault.controller,
          },
        },
      ],
      Date.now(),
      generation,
    );
  } catch (error) {
    log.debug(`[postWriteRefresh] vault: ${error}`);
  } finally {
    await balances;
  }
};
