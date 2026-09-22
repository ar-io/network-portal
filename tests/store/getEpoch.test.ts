/**
 * `getEpoch` returns a cached row before reading the chain, and rows outlive
 * releases. So a row written under an older reward formula must be upgraded on
 * the way out, or returning visitors see the old figures beside new ones.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('@src/utils/epochFetch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@src/utils/epochFetch')>();
  return {
    ...actual,
    // A cached read must never reach the chain.
    fetchEpochLightweight: vi.fn(async () => {
      throw new Error('should not be called for a cached epoch');
    }),
  };
});

import { getEpoch } from '@src/store/db';
import { REWARD_TOTALS_VERSION } from '@src/utils/epochFetch';

/** Just enough of the Dexie table for `getEpoch`. */
const fakeDb = (row: any) => {
  let stored = row;
  const put = vi.fn(async (value: any) => {
    stored = value;
  });
  return {
    db: {
      epochs: {
        where: () => ({ equals: () => ({ first: async () => stored }) }),
        put,
        add: vi.fn(),
      },
    } as any,
    put,
    stored: () => stored,
  };
};

const V1_ROW = {
  epochIndex: 546,
  rewardsDistributed: 1,
  distributions: {
    totalEligibleGateways: 620,
    totalEligibleRewards: 60_592_913_037,
    totalEligibleObserverReward: 242_371_652 * 50,
    totalEligibleGatewayReward: 158_412_844 * 620,
  },
};

describe('getEpoch', () => {
  it('upgrades a cached row from an older release without reading the chain', async () => {
    const { db } = fakeDb(V1_ROW);

    const epoch = await getEpoch(db, {}, 'gar', 546);

    expect(epoch?.distributions.totalEligibleGatewayReward).toEqual(
      60_592_913_037 - 242_371_652 * 50,
    );
    expect(epoch?.distributions.totalEligibleGateways).toEqual(306);
  });

  it('writes the upgrade back so it happens once', async () => {
    const { db, put, stored } = fakeDb(V1_ROW);

    await getEpoch(db, {}, 'gar', 546);

    expect(put).toHaveBeenCalledTimes(1);
    expect(stored().rewardTotalsVersion).toEqual(REWARD_TOTALS_VERSION);
  });

  it('does not rewrite a row that is already current', async () => {
    const { db, put } = fakeDb(V1_ROW);
    await getEpoch(db, {}, 'gar', 546);
    put.mockClear();

    await getEpoch(db, {}, 'gar', 546);

    expect(put).not.toHaveBeenCalled();
  });

  it('still serves the upgraded row when the write-back fails', async () => {
    const { db, put } = fakeDb(V1_ROW);
    put.mockRejectedValueOnce(new Error('quota'));

    const epoch = await getEpoch(db, {}, 'gar', 546);

    expect(epoch?.distributions.totalEligibleGateways).toEqual(306);
  });
});
