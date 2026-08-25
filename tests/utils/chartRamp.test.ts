import { sequentialRamp } from '@src/utils/chartRamp';

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

describe('sequentialRamp', () => {
  it('returns exactly the number of steps asked for', () => {
    for (const n of [1, 2, 5, 21, 40]) {
      expect(sequentialRamp(n)).toHaveLength(n);
    }
  });

  it('emits valid hex', () => {
    for (const c of sequentialRamp(21)) expect(c).toMatch(/^#[0-9a-f]{6}$/);
  });

  // The property that makes this a magnitude encoding rather than decoration:
  // darker must mean further down the order, with no repeats to imply two
  // slices are the same thing.
  it('darkens monotonically', () => {
    const ramp = sequentialRamp(21);
    for (let i = 1; i < ramp.length; i++) {
      expect(luminance(ramp[i])).toBeLessThan(luminance(ramp[i - 1]));
    }
  });

  it('never repeats a colour, so no two slices look identical', () => {
    const ramp = sequentialRamp(21);
    expect(new Set(ramp).size).toBe(ramp.length);
  });

  it('handles degenerate counts without throwing', () => {
    expect(sequentialRamp(0)).toEqual([]);
    expect(sequentialRamp(1)).toHaveLength(1);
  });
});
