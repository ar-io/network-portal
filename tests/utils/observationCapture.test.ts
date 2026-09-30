import {
  describeCaptureShortfall,
  summarizeCapture,
} from '@src/utils/observationCapture';

/**
 * The numbers here are real: they are what
 * `https://network.services.ar.io/api/v1/epochs/<n>.json` served on
 * 2026-09-30. Epochs 508 and 509 are the reason this module exists.
 */
describe('summarizeCapture', () => {
  it('treats a complete epoch as authoritative, including a real zero', () => {
    // Epoch 550: nobody observed it, and the chain agrees. Saying "0 reports"
    // here is correct and must not be hedged.
    expect(
      summarizeCapture({
        capture: 'complete',
        held: 0,
        chainObservationsSubmitted: 0,
      }),
    ).toEqual({ kind: 'authoritative' });
  });

  it('reports a shortfall when the chain counted reports the archive lost', () => {
    // Epoch 509: eight observers reported, none captured.
    expect(
      summarizeCapture({
        capture: 'missing',
        held: 0,
        chainObservationsSubmitted: 8,
      }),
    ).toEqual({ kind: 'shortfall', held: 0, submitted: 8 });
  });

  it('reports a partial capture as a shortfall', () => {
    // Epoch 520: 16 of 18.
    expect(
      summarizeCapture({
        capture: 'partial',
        held: 16,
        chainObservationsSubmitted: 18,
      }),
    ).toEqual({ kind: 'shortfall', held: 16, submitted: 18 });
  });

  it('is indeterminate for a running epoch, which starts empty legitimately', () => {
    // The current epoch is always `unknown`: nobody has reported yet, which is
    // not the same as nobody having reported.
    expect(
      summarizeCapture({
        capture: 'unknown',
        held: 0,
        chainObservationsSubmitted: 0,
      }),
    ).toEqual({ kind: 'indeterminate' });
  });

  it('does not treat an absent capture as complete', () => {
    expect(summarizeCapture({ held: 12 })).toEqual({ kind: 'indeterminate' });
  });

  it('falls back to indeterminate when the shortfall cannot be quantified', () => {
    // Short, but by an unknown amount: "N of ?" states less than saying
    // nothing, so this must not claim a shortfall it cannot size.
    expect(summarizeCapture({ capture: 'missing', held: 0 })).toEqual({
      kind: 'indeterminate',
    });
    expect(
      summarizeCapture({
        capture: 'partial',
        held: 5,
        chainObservationsSubmitted: 5,
      }),
    ).toEqual({ kind: 'indeterminate' });
  });
});

describe('describeCaptureShortfall', () => {
  it('says nothing when the count needs no qualification', () => {
    expect(describeCaptureShortfall({ kind: 'authoritative' })).toBeNull();
    expect(describeCaptureShortfall({ kind: 'indeterminate' })).toBeNull();
  });

  it('never renders a lost epoch as a count of zero', () => {
    const line = describeCaptureShortfall({
      kind: 'shortfall',
      held: 0,
      submitted: 10,
    });
    expect(line).toBe('10 reports submitted, none captured');
    expect(line).not.toMatch(/^0 /);
  });

  it('names both halves of a partial capture', () => {
    expect(
      describeCaptureShortfall({ kind: 'shortfall', held: 16, submitted: 18 }),
    ).toBe('16 of 18 reports captured');
  });

  it('singularises a lone lost report', () => {
    expect(
      describeCaptureShortfall({ kind: 'shortfall', held: 0, submitted: 1 }),
    ).toBe('1 report submitted, none captured');
  });
});
