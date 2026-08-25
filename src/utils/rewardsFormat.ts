import { formatWithCommas } from '@src/utils';

export type RewardUnit = 'ario' | 'usd';

/**
 * Render a reward amount in the unit the axis is showing.
 *
 * This exists because the two halves came apart once: selecting USD converted
 * the plotted values while the tooltip kept its hardcoded `ARIO` suffix, so it
 * displayed dollar figures under a token label — a wrong number rather than a
 * stale one. Both the axis and the tooltip format through here so they cannot
 * disagree again.
 */
export const formatRewardAmount = (
  value: number,
  unit: RewardUnit,
  ticker?: string,
): string =>
  unit === 'usd'
    ? `$${formatWithCommas(Math.round(value))}`
    : `${formatWithCommas(value)} ${ticker || 'ARIO'}`;

/** Compact axis label; the tooltip carries the precise figure. */
export const formatRewardTick = (value: number, unit: RewardUnit): string =>
  unit === 'usd'
    ? `$${formatWithCommas(Math.round(value))}`
    : formatWithCommas(value);
