import type { GatewayWithAddress } from '@ar.io/sdk/web';

/**
 * A gateway's streak as a single signed number.
 *
 * The registry keeps consecutive passes and consecutive failures as two
 * separate counters, but the table shows one value: positive for a passing
 * run, negative for a failing one. Sorting has to use the same number the
 * column displays, otherwise ascending order — the direction a user picks to
 * find the worst gateways — reads only `passedConsecutiveEpochs` and buries
 * every failing gateway in an undifferentiated block of zeros.
 *
 * `leaving` sorts below every real streak: the run has ended, so it is not
 * comparable to one still in progress.
 */
export const gatewayStreak = (
  gateway: Pick<GatewayWithAddress, 'status' | 'stats'>,
): number => {
  if (gateway.status === 'leaving') return Number.NEGATIVE_INFINITY;
  if (gateway.stats.failedConsecutiveEpochs > 0) {
    return -gateway.stats.failedConsecutiveEpochs;
  }
  return gateway.stats.passedConsecutiveEpochs;
};

/** Sort key the table maps its streak column to. Not a path into the record. */
export const GATEWAY_STREAK_SORT_KEY = 'streak';
