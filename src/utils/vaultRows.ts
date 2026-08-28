import type { WalletVault } from '@ar.io/sdk/web';
import { mARIOToken } from '@ar.io/sdk/web';
import dayjs from 'dayjs';

/**
 * How a vault relates to the address whose page is being viewed: `owned` means
 * the tokens are theirs and land when it unlocks, `sent` means they locked the
 * tokens for someone else and can revoke until then.
 *
 * A vault is never both — the program rejects a locked transfer to yourself
 * (`SelfTransfer`) — so the owner check decides it.
 */
export type VaultRole = 'owned' | 'sent';

export interface VaultRow {
  startTimestamp: number;
  endTimestamp: number;
  /** The other party: who locked it for you, or who you locked it for. */
  counterparty: string;
  /**
   * The vault's controller, or '' if it has none. Kept separate from
   * `counterparty` because the action gating needs the literal controller —
   * on a sent row the counterparty is the recipient, not the revoker.
   */
  controller: string;
  role: VaultRole;
  daysRemaining: number;
  balance: number;
  vaultId: string;
  /** The vault's OWNER. `revokeVault` derives the vault PDA from this. */
  vaultAddress: string;
}

/**
 * The vault rows to show on `pageAddress`'s page: the ones it owns and the ones
 * it controls.
 *
 * Extracted from the table component so the predicate is reachable from a test.
 * It matters here specifically: `controller` is `undefined` on every
 * non-revocable vault, so an absent `pageAddress` compared straight against it
 * is `undefined === undefined` — true — which would list every such vault on
 * the network. `vault.address` is always set, which is why the owner-only
 * filter this replaced never needed the guard.
 */
export const vaultRowsFor = (
  vaults: WalletVault[] | undefined,
  pageAddress: string | undefined,
  now: number = Date.now(),
): VaultRow[] => {
  if (!pageAddress || !vaults) {
    return [];
  }

  return vaults
    .filter(
      (vault) =>
        vault.address === pageAddress || vault.controller === pageAddress,
    )
    .map((vault) => {
      const role: VaultRole = vault.address === pageAddress ? 'owned' : 'sent';

      return {
        startTimestamp: vault.startTimestamp,
        endTimestamp: vault.endTimestamp,
        // On an owned row the counterparty is whoever locked it — only set for
        // a revocable vault. On a sent row it is the recipient, which the
        // controller column could never show: there it is the viewer's own
        // address, and two vaults sent to different people looked identical.
        counterparty:
          role === 'owned' ? (vault.controller ?? '') : vault.address,
        controller: vault.controller ?? '',
        role,
        daysRemaining: dayjs(vault.endTimestamp).diff(dayjs(now), 'days'),
        balance: new mARIOToken(vault.balance).toARIO().valueOf(),
        vaultId: vault.vaultId,
        vaultAddress: vault.address,
      };
    });
};
