const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Protocol rate limits are stored in parts-per-million, not percent:
 * 600_000 is 60%, not 600%. Every rate field on GatewayRegistrySettings
 * (`*PenaltyRate`, `failedGatewaySlashRate`) uses this scale, so reading one as
 * a percentage overstates it by 10,000x.
 */
export const PPM_PER_PERCENT = 10_000;

/**
 * Render a duration the protocol stores in milliseconds.
 *
 * Every current value is a whole number of days, but governance can set any
 * millisecond count, so sub-day durations fall back to hours rather than
 * rounding to "0 days".
 */
export const formatDurationDays = (ms: number): string => {
  const days = ms / MS_PER_DAY;

  if (days >= 1) {
    const rounded = Number(days.toFixed(days % 1 === 0 ? 0 : 1));
    return `${rounded} ${rounded === 1 ? 'day' : 'days'}`;
  }

  const hours = Number((ms / MS_PER_HOUR).toFixed(1));
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
};

/** Render a parts-per-million rate as a percentage. */
export const formatPpmPercent = (ppm: number): string =>
  `${Number((ppm / PPM_PER_PERCENT).toFixed(2))}%`;
