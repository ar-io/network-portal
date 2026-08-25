import {
  formatDurationDays,
  formatPpmPercent,
} from '@src/utils/protocolSettings';

describe('formatPpmPercent', () => {
  // The whole point of this helper: the on-chain scale is parts-per-million,
  // so reading a rate as a percentage would overstate it 10,000x.
  it('reads the live mainnet rates at their real magnitude', () => {
    expect(formatPpmPercent(600_000)).toBe('60%');
    expect(formatPpmPercent(100_000)).toBe('10%');
    expect(formatPpmPercent(500_000)).toBe('50%');
    expect(formatPpmPercent(0)).toBe('0%');
  });

  it('renders a full rate as 100%, not 1,000,000%', () => {
    expect(formatPpmPercent(1_000_000)).toBe('100%');
  });

  it('keeps fractional rates readable instead of showing float noise', () => {
    expect(formatPpmPercent(12_345)).toBe('1.23%');
    expect(formatPpmPercent(1)).toBe('0%');
  });
});

describe('formatDurationDays', () => {
  it('renders the durations the protocol currently uses', () => {
    expect(formatDurationDays(2_592_000_000)).toBe('30 days');
    expect(formatDurationDays(604_800_000)).toBe('7 days');
    expect(formatDurationDays(15_552_000_000)).toBe('180 days');
  });

  it('singularises one day', () => {
    expect(formatDurationDays(86_400_000)).toBe('1 day');
  });

  // Governance can set any millisecond value; a sub-day duration must not
  // collapse to "0 days".
  it('falls back to hours below a day', () => {
    expect(formatDurationDays(3_600_000)).toBe('1 hour');
    expect(formatDurationDays(21_600_000)).toBe('6 hours');
    expect(formatDurationDays(0)).toBe('0 hours');
  });

  it('shows one decimal for a partial day rather than rounding it away', () => {
    expect(formatDurationDays(129_600_000)).toBe('1.5 days');
  });
});
