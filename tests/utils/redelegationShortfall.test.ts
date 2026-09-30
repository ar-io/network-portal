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

    expect(r?.suggestion).toEqual(11.12);
    expect(
      redelegationShortfall({
        ...base,
        amount: r!.suggestion!,
        feeRatePct: 10,
      }),
    ).toBeNull();
  });

  it('holds at the 60% maximum fee', () => {
    const r = redelegationShortfall({ ...base, amount: 20, feeRatePct: 60 });

    expect(r?.suggestion).toEqual(25);
    expect(
      redelegationShortfall({ ...base, amount: 25, feeRatePct: 60 }),
    ).toBeNull();
  });

  /** A suggestion above what the user holds could never be submitted. */
  it('suggests moving everything when the smallest partial amount exceeds the stake but the whole clears', () => {
    const r = redelegationShortfall({
      ...base,
      amount: 10,
      feeRatePct: 10,
      maxAmount: 11.5,
      sourceMinimum: 5,
    });

    // 11.12 would leave 0.38 behind, under the source minimum of 5.
    expect(r?.suggestion).toEqual(11.5);
    expect(r?.suggestionIsFullAmount).toBe(true);
  });

  it('offers no amount when even the whole position does not clear', () => {
    const r = redelegationShortfall({
      ...base,
      amount: 10,
      feeRatePct: 10,
      maxAmount: 11,
    });

    expect(r?.suggestion).toBeUndefined();
    expect(r?.suggestionIsFullAmount).toBe(false);
  });

  it('keeps a partial suggestion that leaves the source minimum behind', () => {
    const r = redelegationShortfall({
      ...base,
      amount: 10,
      feeRatePct: 10,
      maxAmount: 100,
      sourceMinimum: 50,
    });

    expect(r?.suggestion).toEqual(11.12);
    expect(r?.suggestionIsFullAmount).toBe(false);
  });

  /** A vault is withdrawn whole or in part with no minimum left behind. */
  it('ignores the source minimum when moving from a vault', () => {
    const r = redelegationShortfall({
      ...base,
      amount: 10,
      feeRatePct: 10,
      maxAmount: 11.5,
      sourceMinimum: 5,
      fromVault: true,
    });

    expect(r?.suggestion).toEqual(11.12);
    expect(r?.suggestionIsFullAmount).toBe(false);
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
