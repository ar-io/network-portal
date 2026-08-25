import { describe, expect, it, vi } from 'vitest';

vi.mock('@src/constants', () => ({
  log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('@src/store/settings', () => ({
  useSettings: {
    getState: () => ({ portalApiUrl: 'https://analyzer.example' }),
  },
}));

import { fetchAnalyzerDocument } from '@src/utils/analyzerApi';

const okOnce = (body: unknown) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

describe('analyzer transient retry', () => {
  it('retries a thrown fetch and succeeds on a later attempt', async () => {
    // A timeout or reset is a blip: the document probably exists and we simply
    // failed to reach it. Losing an epoch to one dropped connection is what
    // makes a report list quietly incomplete.
    let calls = 0;
    global.fetch = vi.fn(async () => {
      calls++;
      if (calls < 3) throw new Error('network down');
      return okOnce({ epochIndex: 522 });
    }) as unknown as typeof fetch;

    const result = await fetchAnalyzerDocument<{ epochIndex: number }>(
      'epoch',
      522,
    );
    expect(result).toEqual({ epochIndex: 522 });
    expect(calls).toBe(3);
  });

  it('does NOT retry a 404, which is an answer rather than a failure', async () => {
    // An epoch outside the retained window is genuinely absent. Retrying it
    // burns two backoffs before reaching the same conclusion, on every epoch
    // of every report list.
    let calls = 0;
    global.fetch = vi.fn(async () => {
      calls++;
      return { ok: false, status: 404, json: async () => ({}) };
    }) as unknown as typeof fetch;

    expect(await fetchAnalyzerDocument('epoch', 1)).toBeNull();
    expect(calls).toBe(1);
  });

  it('gives up after a bounded number of attempts', async () => {
    // An unreachable host must not hold the page open indefinitely.
    let calls = 0;
    global.fetch = vi.fn(async () => {
      calls++;
      throw new Error('unreachable');
    }) as unknown as typeof fetch;

    expect(await fetchAnalyzerDocument('epoch', 522)).toBeNull();
    expect(calls).toBe(3);
  });

  it('does not retry a document refused for being stale', async () => {
    // Stale is a verdict about the content: the same document comes back.
    let calls = 0;
    global.fetch = vi.fn(async () => {
      calls++;
      return okOnce({ generatedAt: new Date(0).toISOString() });
    }) as unknown as typeof fetch;

    expect(await fetchAnalyzerDocument('network')).toBeNull();
    expect(calls).toBe(1);
  });
});
