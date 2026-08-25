/**
 * The brand accent expressed as a sequential ramp.
 *
 * Anchors, light to dark — the same hue family the token supply chart uses, so
 * two magnitude breakdowns in the app do not read as unrelated palettes.
 */
const ANCHORS = [
  [0xe4, 0xb1, 0xe7],
  [0xd6, 0x8b, 0xda],
  [0xc9, 0x64, 0xce],
  [0xbb, 0x3d, 0xc2],
  [0x96, 0x31, 0x9b],
] as const;

const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/**
 * `steps` colours spanning the ramp, light to dark.
 *
 * For a breakdown of one quantity into many parts, cycling a fixed palette
 * would make colour mean "position in a repeating list" — two slices of very
 * different size sharing a colour. Interpolating keeps the encoding monotonic,
 * so darker really does mean smaller once slices are ordered by size.
 */
export const sequentialRamp = (steps: number): string[] => {
  if (steps <= 0) return [];
  if (steps === 1) return [`#${ANCHORS[0].map(hex).join('')}`];

  return Array.from({ length: steps }, (_, i) => {
    const t = (i / (steps - 1)) * (ANCHORS.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(ANCHORS.length - 1, lo + 1);
    const f = t - lo;
    const c = [0, 1, 2].map(
      (k) => ANCHORS[lo][k] + (ANCHORS[hi][k] - ANCHORS[lo][k]) * f,
    );
    return `#${c.map(hex).join('')}`;
  });
};
