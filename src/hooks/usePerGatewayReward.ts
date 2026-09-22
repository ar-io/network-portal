import { ARIOToken, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';

/**
 * This epoch's reward for one eligible gateway, in ARIO, or undefined when it
 * is not known yet.
 *
 * Every yield in the app divides this number, so it is read from the Epoch
 * account rather than reconstructed from the protocol balance. See
 * `EpochDataWithCounters.perGatewayReward` for why reconstruction is not
 * possible: the divisor the protocol uses is never published.
 *
 * Before the current epoch is prescribed it carries zero, and the previous
 * epoch's reward (`referencePerGatewayReward`) stands in, so yields do not blank
 * out for the first minutes of every epoch. Undefined means neither is known:
 * the epoch is still loading, its read failed, or the SDK fallback path returned
 * a plain `EpochData` without the field. `useYieldStatus` tells those apart.
 */
const usePerGatewayReward = (): ARIOToken | undefined => {
  const current = useGlobalState(
    (state) => state.currentEpoch?.perGatewayReward,
  );
  // Only consulted before the current epoch is prescribed; see
  // `referencePerGatewayReward` in global state.
  const reference = useGlobalState((state) => state.referencePerGatewayReward);

  const perGatewayReward =
    current !== undefined && current > 0 ? current : reference;

  if (perGatewayReward === undefined || perGatewayReward <= 0) {
    return undefined;
  }

  return new mARIOToken(perGatewayReward).toARIO();
};

export default usePerGatewayReward;
