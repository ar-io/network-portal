import { createThrottledRpc } from '@src/utils/solanaRpc';
import { vi } from 'vitest';

/**
 * These drive the real kit transport with a stubbed `fetch`, so the 429 →
 * `SolanaError { context: { statusCode, headers } }` conversion under test is
 * the genuine one.
 *
 * They assert on the *steady-state* rate in the final second rather than on
 * totals: one second's worth of burst tokens is allowed by design and would
 * otherwise swamp the signal.
 */

type Call = { url: string; at: number };

const PRIMARY = 'https://primary.test/rpc';
const FALLBACK = 'https://fallback.test/rpc';

const json429 = (headers: Record<string, string> = {}) =>
  new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32005, message: 'Too many requests' },
    }),
    {
      status: 429,
      headers: { 'content-type': 'application/json', ...headers },
    },
  );

const json200 = () =>
  new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: 1 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

/** Install a fetch stub and return the call log it appends to. */
function stubFetch(
  respond: (url: string, init?: any) => Response | Promise<Response>,
) {
  const calls: Call[] = [];
  vi.stubGlobal('fetch', async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push({ url, at: Date.now() });
    return respond(url, init);
  });
  return calls;
}

/** Drive `rpc` with `workers` concurrent callers until `durationMs` elapses. */
async function drive(rpc: any, durationMs: number, workers = 4) {
  const deadline = Date.now() + durationMs;
  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (Date.now() < deadline) {
        try {
          await rpc.getSlot().send();
        } catch {
          // Failures are the point of most of these tests.
        }
      }
    }),
  );
  return deadline;
}

/** Calls to `url` in the second before `deadline` — the settled rate. */
const rateAtEnd = (calls: Call[], url: string, deadline: number) =>
  calls.filter(
    (c) => c.url === url && c.at > deadline - 1000 && c.at <= deadline,
  ).length;

describe('createThrottledRpc', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('backs off when a 429 advertises a rate limit above the ceiling', async () => {
    // The regression this exists for: deriving the next rate from
    // `min(ceiling, advertised * 0.9)` means any advertised limit at or above
    // the ceiling resolves straight back to the ceiling and no backoff happens.
    // Public mainnet-beta advertises 250.
    const calls = stubFetch(() => json429({ 'x-ratelimit-rps-limit': '250' }));
    const rpc = createThrottledRpc({ primaryUrl: PRIMARY });

    const deadline = await drive(rpc, 4000);

    expect(calls.length).toBeGreaterThan(0);
    expect(rateAtEnd(calls, PRIMARY, deadline)).toBeLessThanOrEqual(3);
  }, 30_000);

  it('backs off on a 429 with no rate-limit headers (AIMD)', async () => {
    const calls = stubFetch(() => json429());
    const rpc = createThrottledRpc({ primaryUrl: PRIMARY });

    const deadline = await drive(rpc, 4000);

    expect(rateAtEnd(calls, PRIMARY, deadline)).toBeLessThanOrEqual(3);
  }, 30_000);

  it('throttles the fallback too when the primary is down', async () => {
    // The headline fix. The SDK's breaker emits `reject` (not `failure`) once
    // its circuit is open, so 429s from the fallback never reached its backoff
    // and it held a flat 10 req/s for as long as the primary stayed down.
    const calls = stubFetch((url) => {
      if (url === PRIMARY) throw new TypeError('fetch failed');
      return json429({ 'x-ratelimit-rps-limit': '250' });
    });
    const rpc = createThrottledRpc({
      primaryUrl: PRIMARY,
      fallbackUrl: FALLBACK,
    });

    const deadline = await drive(rpc, 5000);

    const fallbackCalls = calls.filter((c) => c.url === FALLBACK);
    expect(fallbackCalls.length).toBeGreaterThan(0); // failover happened
    expect(rateAtEnd(calls, FALLBACK, deadline)).toBeLessThanOrEqual(3);
  }, 30_000);

  it('never contacts a second endpoint when no fallback is configured', async () => {
    const calls = stubFetch((url) => {
      if (url === PRIMARY) throw new TypeError('fetch failed');
      return json200();
    });
    const rpc = createThrottledRpc({ primaryUrl: PRIMARY });

    await drive(rpc, 1500, 2);

    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((c) => c.url === PRIMARY)).toBe(true);
  }, 30_000);

  it('does not fail over when the caller cancels the request', async () => {
    // React Query aborts in-flight queries on unmount. Those cancellations used
    // to increment the primary's failure counter, so a handful of navigations
    // could divert a healthy primary's traffic to the fallback for 30s.
    //
    // The abort has to land while the request is genuinely in flight: aborting
    // synchronously after send() lets it complete, which would make this pass
    // whether or not the guard exists.
    const calls = stubFetch(
      (_url, init) =>
        new Promise<Response>((resolve, reject) => {
          const abort = () => reject(new DOMException('aborted', 'AbortError'));
          // Real fetch rejects immediately on an already-aborted signal.
          if (init?.signal?.aborted) return abort();
          const timer = setTimeout(() => resolve(json200()), 200);
          init?.signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              abort();
            },
            { once: true },
          );
        }),
    );
    const rpc = createThrottledRpc({
      primaryUrl: PRIMARY,
      fallbackUrl: FALLBACK,
    });

    // Comfortably more cancellations than it takes to trip failover.
    for (let i = 0; i < 8; i++) {
      const controller = new AbortController();
      const pending = rpc
        .getBlockTime(BigInt(i))
        .send({ abortSignal: controller.signal })
        .catch(() => undefined);
      await new Promise((r) => setTimeout(r, 20)); // let it reach the transport
      controller.abort();
      await pending;
    }

    calls.length = 0;
    await rpc.getSlot().send();

    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((c) => c.url === PRIMARY)).toBe(true);
  }, 30_000);

  it('smooths a burst of successful requests to the configured ceiling', async () => {
    const calls = stubFetch(() => json200());
    const rpc = createThrottledRpc({
      primaryUrl: PRIMARY,
      maxRequestsPerSecond: 5,
    });

    const started = Date.now();
    // Distinct params on purpose: `createDefaultRpcTransport` coalesces
    // identical concurrent payloads, which would hide the queueing behaviour.
    await Promise.all(
      Array.from({ length: 20 }, (_, i) => rpc.getBlockTime(BigInt(i)).send()),
    );

    // 20 requests at 5/s with a 5-token burst allowance: ~3s of queueing.
    expect(Date.now() - started).toBeGreaterThan(2000);
    expect(calls).toHaveLength(20);
    // A 5-token burst plus one second of refill at 5/s is ~10; unthrottled
    // this would be all 20 at once.
    const firstSecond = calls.filter((c) => c.at < started + 1000).length;
    expect(firstSecond).toBeLessThanOrEqual(12);
  }, 30_000);
});
