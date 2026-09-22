import { resolveYieldStatus } from '@src/hooks/useYieldStatus';
import { vi } from 'vitest';

// The hook reads the store; the decision under test does not. Mocked so the
// module loads without the browser globals the real store needs.
vi.mock('@src/store', () => ({ useGlobalState: vi.fn() }));

const prescribed = { perGatewayReward: 158_412_844, rewardsPrescribed: true };
const unprescribed = { perGatewayReward: 0, rewardsPrescribed: false };

describe('resolveYieldStatus', () => {
  it('is loading before the epoch is read, not a failure', () => {
    expect(resolveYieldStatus({})).toEqual('loading');
  });

  it('is available once the current reward is known', () => {
    expect(resolveYieldStatus({ currentEpoch: prescribed })).toEqual(
      'available',
    );
  });

  /** A later failed refresh must not hide yields that are already known. */
  it('stays available when a later read fails', () => {
    expect(
      resolveYieldStatus({ currentEpoch: prescribed, epochLoadFailed: true }),
    ).toEqual('available');
  });

  it('is failed when the epoch could not be read', () => {
    expect(resolveYieldStatus({ epochLoadFailed: true })).toEqual('failed');
  });

  it('is provisional before prescription when a previous reward stands in', () => {
    expect(
      resolveYieldStatus({
        currentEpoch: unprescribed,
        referencePerGatewayReward: 150_000_000,
      }),
    ).toEqual('provisional');
  });

  it('is pending before prescription with nothing to stand in', () => {
    expect(resolveYieldStatus({ currentEpoch: unprescribed })).toEqual(
      'pending',
    );
  });

  /**
   * Prescribed with a zero reward (nobody eligible), or the SDK fallback path
   * that carries no reward at all: no yield is coming, so none is promised.
   */
  it('is unavailable when prescribed without a reward', () => {
    expect(
      resolveYieldStatus({
        currentEpoch: { perGatewayReward: 0, rewardsPrescribed: true },
        referencePerGatewayReward: 150_000_000,
      }),
    ).toEqual('unavailable');
    expect(resolveYieldStatus({ currentEpoch: {} })).toEqual('unavailable');
  });
});
