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
 * Undefined has two causes and callers treat them the same way, by showing no
 * yield rather than a guess: the SDK fallback path returns a plain `EpochData`
 * without the field, and a freshly created epoch carries zero until
 * `prescribe_epoch` runs.
 */
const usePerGatewayReward = (): ARIOToken | undefined => {
  const perGatewayReward = useGlobalState(
    (state) => state.currentEpoch?.perGatewayReward,
  );

  if (perGatewayReward === undefined || perGatewayReward <= 0) {
    return undefined;
  }

  return new mARIOToken(perGatewayReward).toARIO();
};

export default usePerGatewayReward;
