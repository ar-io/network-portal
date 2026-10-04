import { getErrorMessage } from './getErrorMessage';

/**
 * Turn an `ario-gar` failure into something a user can act on.
 *
 * The sibling of `vaultErrors`, for the gateway registry program rather than
 * core. Anchor surfaces these as `custom program error: 0x1784` or, when the
 * simulation logs come through, as `Error Code: WithdrawalNotReady`, so both
 * spellings are matched.
 *
 * Codes are `6000 + index` from `@ar.io/solana-contracts` `gar/errors/arioGar`,
 * which ADR-0035 makes an append-only published ABI — so a code here cannot be
 * reused for something else later.
 *
 * One entry is NOT from that range: `AccountNotInitialized` is 3012, an
 * **Anchor framework** error rather than a program one. Anchor reserves
 * 2000-3999 for its own constraint failures, so it cannot collide with the
 * 6000+ block, but it is a different contract and worth knowing when adding
 * to this list.
 */
const GAR_ERRORS: ReadonlyArray<{
  code: number;
  name: string;
  message: string;
}> = [
  {
    code: 0x1784, // 6020
    name: 'WithdrawalNotReady',
    message:
      'This withdrawal has not unlocked yet according to the network clock. It is only moments away — try again shortly.',
  },
  {
    code: 0x17d2, // 6082
    name: 'ProtectedVault',
    message:
      'This vault holds a gateway’s minimum operator stake, which cannot be released early. It unlocks at the end of the leave period.',
  },
  {
    code: 0xbc4, // 3012 — Anchor, not arioGar
    name: 'AccountNotInitialized',
    /**
     * Says only what the code establishes: the delegation account is not
     * there. It does NOT establish that a withdrawal exists, or where the
     * tokens are — an earlier draft claimed both, which is the same mistake
     * as rendering an unknown as a number. Nor can it promise the list was
     * refreshed: `ClaimWithdrawalModal` invalidates on success only, so that
     * promise would be false in one of this module's three callers.
     */
    message:
      'The network has no record of this delegation, so there is nothing here to withdraw. It may already have been withdrawn — check your stakes.',
  },
  {
    code: 0x1786, // 6022
    name: 'InvalidWithdrawalAmount',
    message:
      'This withdrawal is below the minimum an expedited withdrawal accepts. Wait for it to unlock and claim it in full instead.',
  },
];

/**
 * Map a GAR write failure to user-facing copy, or undefined when it is not one
 * this module recognises (callers fall back to the raw message).
 */
export const getGarErrorMessage = (error: unknown): string | undefined => {
  const raw = getErrorMessage(error);
  const lower = raw.toLowerCase();

  for (const { code, name, message } of GAR_ERRORS) {
    if (
      lower.includes(`0x${code.toString(16)}`) ||
      lower.includes(name.toLowerCase())
    ) {
      return message;
    }
  }

  return undefined;
};

/** The message to show the user for a failed gateway-registry write. */
export const describeGarError = (error: unknown): string =>
  getGarErrorMessage(error) ?? getErrorMessage(error);
