import {
  ZERO_ADDRESS,
  baselineAfterSettings,
  effectiveOperationsAddress,
  isDelegated,
  operationsAddressUpdate,
  validateOperationsAddress,
} from '@src/utils/operationsAddress';

// Well-formed public keys with no meaning on any cluster.
const OWNER = 'SysvarC1ock11111111111111111111111111111111';
const DELEGATE = 'SysvarRent111111111111111111111111111111111';

describe('effectiveOperationsAddress', () => {
  it('is undefined while the gateway or its owner is loading', () => {
    expect(effectiveOperationsAddress(undefined, OWNER)).toBeUndefined();
    expect(effectiveOperationsAddress(null, OWNER)).toBeUndefined();
    expect(
      effectiveOperationsAddress({ operationsAddress: DELEGATE }, undefined),
    ).toBeUndefined();
  });

  it('falls back to the owner for a gateway with no operations address', () => {
    // The SDK omits the field for a gateway not migrated to the layout that
    // holds it, and the program lets only the operator act for such a gateway.
    expect(effectiveOperationsAddress({}, OWNER)).toBe(OWNER);
  });

  it('returns the delegated address when there is one', () => {
    expect(
      effectiveOperationsAddress({ operationsAddress: DELEGATE }, OWNER),
    ).toBe(DELEGATE);
  });
});

describe('isDelegated', () => {
  it('is false when the operations address is the owner', () => {
    expect(isDelegated(OWNER, OWNER)).toBe(false);
  });

  it('is true when the operations address differs from the owner', () => {
    expect(isDelegated(DELEGATE, OWNER)).toBe(true);
  });

  it('is false while either side is unknown', () => {
    expect(isDelegated(undefined, OWNER)).toBe(false);
    expect(isDelegated(DELEGATE, undefined)).toBe(false);
  });
});

describe('validateOperationsAddress', () => {
  const validate = validateOperationsAddress('Operations Address');

  it('accepts a valid address, including the owner (a revoke)', () => {
    expect(validate(DELEGATE)).toBeUndefined();
    expect(validate(OWNER)).toBeUndefined();
    expect(validate(`  ${DELEGATE}  `)).toBeUndefined();
  });

  it('rejects an empty or malformed address', () => {
    expect(validate('')).toMatch(/must be a valid Solana wallet address/);
    expect(validate('   ')).toMatch(/must be a valid Solana wallet address/);
    expect(validate('not-an-address')).toMatch(
      /must be a valid Solana wallet address/,
    );
  });

  it('rejects the zero address, which the program refuses', () => {
    expect(validate(ZERO_ADDRESS)).toMatch(/can't be the zero address/);
  });
});

describe('operationsAddressUpdate', () => {
  it('produces no call when the value did not change', () => {
    // The program refuses a value equal to the current one, so an unchanged
    // field must not turn into a failing transaction.
    expect(operationsAddressUpdate(OWNER, OWNER)).toBeUndefined();
    expect(operationsAddressUpdate(OWNER, `  ${OWNER} `)).toBeUndefined();
  });

  it('produces no call for an empty value', () => {
    expect(operationsAddressUpdate(OWNER, '')).toBeUndefined();
    expect(operationsAddressUpdate(OWNER, undefined)).toBeUndefined();
  });

  it('produces a trimmed call when the value changed', () => {
    expect(operationsAddressUpdate(OWNER, ` ${DELEGATE} `)).toEqual({
      operationsAddress: DELEGATE,
    });
  });

  it('produces a call when revoking back to the owner', () => {
    expect(operationsAddressUpdate(DELEGATE, OWNER)).toEqual({
      operationsAddress: OWNER,
    });
  });
});

describe('baselineAfterSettings', () => {
  const initial = { label: 'old', note: 'old note', operationsAddress: OWNER };
  const submitted = {
    label: 'new',
    note: 'new note',
    operationsAddress: DELEGATE,
  };

  it('moves every submitted setting into the baseline', () => {
    const next = baselineAfterSettings(initial, submitted);
    expect(next.label).toBe('new');
    expect(next.note).toBe('new note');
  });

  it('keeps the old operations address until its own transaction succeeds', () => {
    // If the operations address transaction fails, the retry must still see
    // it as changed, while the settings already on chain must not be resent.
    const next = baselineAfterSettings(initial, submitted);
    expect(next.operationsAddress).toBe(OWNER);
    expect(operationsAddressUpdate(next.operationsAddress, DELEGATE)).toEqual({
      operationsAddress: DELEGATE,
    });
  });
});
