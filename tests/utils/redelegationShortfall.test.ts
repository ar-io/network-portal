import { redelegationShortfall } from '@src/utils/stake';

const base = { minDelegatedStake: 10, targetHasPosition: false };

describe('redelegationShortfall', () => {
  it('passes an amount that still clears the minimum after the fee', () => {
    expect(
      redelegationShortfall({ ...base, amount: 12, feeRatePct: 10 }),
    ).toBeNull();
  });

  /** Exactly the minimum gross passes the form and fails on chain. */
  it('flags an amount that clears the minimum only before the fee', () => {
    const r = redelegationShortfall({ ...base, amount: 10, feeRatePct: 10 });

    expect(r?.net).toBeCloseTo(9, 9);
  });

  /**
   * The exact answer is 11.1111..., and shown to one decimal it read "11.1",
   * which nets 9.99 and is rejected again. The suggestion must round up.
   */
  it('suggests an amount that actually clears, rounded up', () => {
    const r = redelegationShortfall({ ...base, amount: 10, feeRatePct: 10 });

    expect(r?.smallestGross).toEqual(11.12);
    expect(
      redelegationShortfall({
        ...base,
        amount: r!.smallestGross,
        feeRatePct: 10,
      }),
    ).toBeNull();
  });

  it('holds at the 60% maximum fee', () => {
    const r = redelegationShortfall({ ...base, amount: 20, feeRatePct: 60 });

    expect(r?.smallestGross).toEqual(25);
    expect(
      redelegationShortfall({ ...base, amount: 25, feeRatePct: 60 }),
    ).toBeNull();
  });

  it('does not apply when the wallet already delegates to the target', () => {
    expect(
      redelegationShortfall({
        ...base,
        amount: 1,
        feeRatePct: 60,
        targetHasPosition: true,
      }),
    ).toBeNull();
  });

  it('does not apply to a free redelegation', () => {
    expect(
      redelegationShortfall({ ...base, amount: 10, feeRatePct: 0 }),
    ).toBeNull();
  });
});
