import { useGlobalState } from '@src/store';
import type { EpochDataWithCounters } from '@src/utils/epochFetch';

/**
 * Why a yield can or cannot be shown, as one value every table agrees on.
 *
 * "No per-gateway reward" has several causes, and each needs its own
 * treatment. Collapsing them is how a table once told users the epoch "could
 * not be read" during the second or two it was still loading, and how a note
 * promised a yield that was never coming.
 *
 * - `loading`: the epoch read is in flight. Show a placeholder, say nothing.
 * - `available`: the current epoch's own reward is known.
 * - `provisional`: the current epoch is not prescribed yet, so the previous
 *   epoch's reward stands in. Yields show, labelled as provisional.
 * - `pending`: not prescribed yet, and no earlier reward could be read to stand
 *   in. The poll replaces the epoch once it is prescribed.
 * - `unavailable`: prescribed, yet there is no reward to divide: no gateway was
 *   eligible, or the SDK fallback path returned no reward field at all.
 * - `failed`: the epoch read failed.
 */
export type YieldStatus =
  | 'loading'
  | 'available'
  | 'provisional'
  | 'pending'
  | 'unavailable'
  | 'failed';

/** The decision itself, separated from the store so each state can be tested. */
export const resolveYieldStatus = ({
  epochLoadFailed,
  currentEpoch,
  referencePerGatewayReward,
}: {
  epochLoadFailed?: boolean;
  currentEpoch?: Pick<
    EpochDataWithCounters,
    'perGatewayReward' | 'rewardsPrescribed'
  >;
  referencePerGatewayReward?: number;
}): YieldStatus => {
  if ((currentEpoch?.perGatewayReward ?? 0) > 0) return 'available';
  if (epochLoadFailed) return 'failed';
  if (currentEpoch === undefined) return 'loading';
  if (currentEpoch.rewardsPrescribed === false) {
    return (referencePerGatewayReward ?? 0) > 0 ? 'provisional' : 'pending';
  }
  return 'unavailable';
};

const useYieldStatus = (): YieldStatus =>
  resolveYieldStatus({
    epochLoadFailed: useGlobalState((state) => state.epochLoadFailed),
    currentEpoch: useGlobalState((state) => state.currentEpoch),
    referencePerGatewayReward: useGlobalState(
      (state) => state.referencePerGatewayReward,
    ),
  });

export default useYieldStatus;
