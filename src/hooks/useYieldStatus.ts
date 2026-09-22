import { useGlobalState } from '@src/store';
import usePerGatewayReward from './usePerGatewayReward';

/**
 * Why a yield can or cannot be shown, as one value every table agrees on.
 *
 * "No per-gateway reward" has three different causes, and they need three
 * different treatments. Collapsing them is how a table ended up telling users
 * the epoch "could not be read" during the second or two it was still loading.
 *
 * - `loading`: the epoch read is in flight. Show a placeholder, say nothing.
 * - `pending`: the epoch was read but has not been prescribed, and no earlier
 *   epoch's reward is available to stand in. Rare and brief; see
 *   `referencePerGatewayReward`.
 * - `failed`: the epoch read failed. Say so once, above the table.
 * - `available`: a yield can be computed.
 */
export type YieldStatus = 'loading' | 'pending' | 'failed' | 'available';

const useYieldStatus = (): YieldStatus => {
  const perGatewayReward = usePerGatewayReward();
  const epochLoadFailed = useGlobalState((state) => state.epochLoadFailed);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  if (perGatewayReward) return 'available';
  if (epochLoadFailed) return 'failed';
  if (currentEpoch === undefined) return 'loading';
  return 'pending';
};

export default useYieldStatus;
