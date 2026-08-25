import { formatRewardAmount, formatRewardTick } from '@src/utils/rewardsFormat';

describe('formatRewardAmount', () => {
  // The regression this guards: USD-converted values were rendered with an
  // ARIO suffix, so the tooltip showed dollars labelled as tokens.
  it('never labels a USD figure with the token ticker', () => {
    const usd = formatRewardAmount(1234, 'usd', 'ARIO');
    expect(usd).toBe('$1,234');
    expect(usd).not.toContain('ARIO');
  });

  it('labels ARIO figures with the ticker', () => {
    expect(formatRewardAmount(1234, 'ario', 'ARIO')).toBe('1,234 ARIO');
  });

  it('falls back to ARIO before the ticker loads', () => {
    expect(formatRewardAmount(5, 'ario', '')).toBe('5 ARIO');
    expect(formatRewardAmount(5, 'ario', undefined)).toBe('5 ARIO');
  });

  it('does not put a currency symbol on a token amount', () => {
    expect(formatRewardAmount(10, 'ario', 'ARIO')).not.toContain('$');
  });

  it('handles zero and negative values without losing the unit', () => {
    expect(formatRewardAmount(0, 'usd', 'ARIO')).toBe('$0');
    expect(formatRewardAmount(0, 'ario', 'ARIO')).toBe('0 ARIO');
  });
});

describe('formatRewardTick', () => {
  it('matches the unit the tooltip will use', () => {
    expect(formatRewardTick(2500, 'usd')).toBe('$2,500');
    expect(formatRewardTick(2500, 'ario')).toBe('2,500');
  });
});
