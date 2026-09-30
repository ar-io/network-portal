import type { GatewayWithAddress } from '@ar.io/sdk/web';

import { isSolanaAddress } from './solanaAddress';

/** The all-zero public key. The program refuses it as an operations address. */
export const ZERO_ADDRESS = '11111111111111111111111111111111';

/** Shown instead of an address when the operator has not delegated. */
export const NOT_DELEGATED_LABEL = 'Not delegated (owner wallet)';

/**
 * The address that can act as the gateway's operations address.
 *
 * A gateway always has one: the operator, until the operator delegates. The
 * SDK omits `operationsAddress` for a gateway not yet migrated to the layout
 * that holds it, and for such a gateway the program lets only the operator
 * act, so the operator is the correct answer there too.
 *
 * Returns `undefined` while the gateway or its owner is still loading.
 */
export const effectiveOperationsAddress = (
  gateway: Pick<GatewayWithAddress, 'operationsAddress'> | undefined | null,
  ownerId: string | undefined,
): string | undefined => {
  if (!gateway || !ownerId) return undefined;
  return gateway.operationsAddress ?? ownerId;
};

/** Checks whether the operator has delegated to a different address. */
export const isDelegated = (
  operationsAddress: string | undefined,
  ownerId: string | undefined,
): boolean =>
  operationsAddress !== undefined &&
  ownerId !== undefined &&
  operationsAddress !== ownerId;

/**
 * Validates a new operations address against the rules the program enforces,
 * so the form reports them instead of a failed transaction.
 */
export const validateOperationsAddress =
  (propertyName: string) =>
  (v: string): string | undefined => {
    const value = v.trim();
    if (value === '' || !isSolanaAddress(value)) {
      return `${propertyName} is required and must be a valid Solana wallet address. To revoke a delegation, enter the owner wallet.`;
    }
    if (value === ZERO_ADDRESS) {
      return `${propertyName} can't be the zero address. To revoke a delegation, enter the owner wallet.`;
    }
    return undefined;
  };

/**
 * The `updateOperationsAddress` call a form submission needs, or `undefined`
 * when the operations address did not change. The program refuses a value
 * equal to the current one, so an unchanged field must not produce a call.
 */
export const operationsAddressUpdate = (
  initial: string | undefined,
  next: string | undefined,
): { operationsAddress: string } | undefined => {
  const value = next?.trim();
  if (!value || value === initial) return undefined;
  return { operationsAddress: value };
};

/**
 * The form baseline once the settings transaction has succeeded but before
 * the operations address transaction has.
 *
 * The two are separate transactions. If the second fails, the settings are
 * already on chain, so a retry must not send them again: every submitted
 * field moves into the baseline except `operationsAddress`, which stays at its
 * old value until its own transaction succeeds.
 */
export const baselineAfterSettings = <T extends Record<string, unknown>>(
  initial: T,
  submitted: T,
): T => ({
  ...submitted,
  operationsAddress: initial.operationsAddress,
});
