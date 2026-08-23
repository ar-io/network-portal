import {
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
} from '@solana/kit';
import { log } from '@src/constants';

type RpcTransport = ReturnType<typeof createDefaultRpcTransport>;

/**
 * Solana RPC client for the portal.
 *
 * This replaces the SDK's `createCircuitBreakerRpc`, which cannot express what
 * the app needs. Two measured problems, both against the live breaker:
 *
 * 1. `fallbackUrl` is a required string and `defaultFallbackUrl()` resolves to a
 *    public endpoint (`api.mainnet-beta.solana.com`). Once the circuit opens,
 *    100% of the app's traffic — whole-program scans included — is routed there
 *    for the full 60s reset window.
 * 2. The adaptive throttle only ever observes the *primary*. opossum emits
 *    `reject` (not `failure`) while the circuit is open, and only `failure` is
 *    wired to the backoff, so 429s from the fallback are invisible. Measured
 *    with a dead primary and an always-429 fallback: 209 requests in 20.7s at a
 *    dead-flat 10.1 req/s that never slowed down.
 *
 * There is a third bug on the primary path that this also fixes — see
 * `applyRateLimit` below.
 *
 * The default here is a single endpoint with no fallback: if the configured RPC
 * is down the app surfaces an error and the user can switch endpoints in
 * Settings, which is strictly better than silently flooding a public good. A
 * second endpoint can be opted into via `VITE_SOLANA_FALLBACK_RPC_URL`; it
 * shares this module's rate gate, so failing over can never multiply load.
 */

/** Ceiling on requests/second. The bucket only ever moves *down* from here. */
const DEFAULT_MAX_RPS = 10;
/** Never throttle below this many requests/second. */
const MIN_RATE = 1;
/** Multiply the current rate by this on a 429 (AIMD decrease). */
const AIMD_DECREASE = 0.5;
/** Consecutive successes before nudging the rate up by 1 (additive recovery). */
const RECOVERY_SUCCESSES = 20;
/** Fraction of a provider-advertised limit to actually use (safety margin). */
const RATE_SAFETY_FACTOR = 0.9;
/** Cooldown applied on a 429 that carries no `Retry-After`. */
const DEFAULT_COOLDOWN_MS = 1_000;
/**
 * Per-request ceiling. Deliberately generous: a whole-program scan legitimately
 * takes seconds, and the SDK's 10s opossum timeout counted those as failures,
 * which is one of the ways the circuit tripped under normal load.
 */
const REQUEST_TIMEOUT_MS = 30_000;
/** Consecutive primary failures before we start using a configured fallback. */
const FAILURES_BEFORE_FAILOVER = 5;
/** How long to stay on the fallback before probing the primary again. */
const PRIMARY_RECHECK_MS = 30_000;

/**
 * Token-bucket throttle whose rate can be retuned at runtime and which can be
 * paused on demand. Tokens refill continuously at the current rate, capped at
 * one second's worth (the burst allowance); waiters are released FIFO.
 */
function createRateGate(initialRate: number) {
  let rate = Math.max(MIN_RATE, initialRate);
  let capacity = Math.max(1, rate);
  let tokens = capacity;
  let lastRefill = Date.now();
  let pausedUntil = 0;
  const queue: Array<() => void> = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const schedule = (ms: number) => {
    if (timer !== null) return;
    timer = setTimeout(
      () => {
        timer = null;
        pump();
      },
      Math.max(ms, 1),
    );
  };

  const refill = () => {
    const now = Date.now();
    const elapsed = (now - lastRefill) / 1000;
    if (elapsed > 0) {
      tokens = Math.min(capacity, tokens + elapsed * rate);
      lastRefill = now;
    }
  };

  const pump = () => {
    const now = Date.now();
    if (pausedUntil > now) {
      schedule(pausedUntil - now);
      return;
    }
    refill();
    while (tokens >= 1) {
      const release = queue.shift();
      if (!release) break;
      tokens -= 1;
      release();
    }
    if (queue.length > 0) {
      // Wake when the next whole token will have accrued.
      schedule(Math.ceil(((1 - tokens) / rate) * 1000));
    }
  };

  return {
    acquire: () =>
      new Promise<void>((resolve) => {
        queue.push(resolve);
        pump();
      }),
    setRate: (ratePerSecond: number) => {
      rate = Math.max(MIN_RATE, ratePerSecond);
      capacity = Math.max(1, rate);
      tokens = Math.min(tokens, capacity);
      lastRefill = Date.now();
      pump();
    },
    pauseFor: (ms: number) => {
      const until = Date.now() + Math.max(0, ms);
      if (until > pausedUntil) pausedUntil = until;
      schedule(ms);
    },
  };
}

/**
 * If `err` is a transport HTTP 429, return its response `Headers`; else null.
 * Duck-typed against the `@solana/errors` HTTP-error context
 * (`{ statusCode, headers }`) so we avoid a hard dependency on the error code.
 */
function http429Headers(err: unknown): Headers | null {
  const ctx = (err as { context?: { statusCode?: number; headers?: unknown } })
    ?.context;
  if (ctx?.statusCode === 429 && ctx.headers instanceof Headers) {
    return ctx.headers;
  }
  return null;
}

/** Parse `Retry-After` (delta-seconds or HTTP-date) into ms, or null. */
function parseRetryAfterMs(headers: Headers): number | null {
  const value = headers.get('retry-after');
  if (value === null || value === '') return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const when = Date.parse(value);
  return Number.isNaN(when) ? null : Math.max(0, when - Date.now());
}

/** Provider-advertised requests/second limit (`x-ratelimit-rps-limit`), or null. */
function parseRpsLimit(headers: Headers): number | null {
  const value = Number(headers.get('x-ratelimit-rps-limit'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Combine an optional caller signal with a timeout, without relying on
 * `AbortSignal.any` (Safari <17.4, Firefox <124).
 */
function withTimeout(signal: AbortSignal | undefined, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error(`RPC request timed out after ${ms}ms`)),
    ms,
  );
  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

export type ThrottledRpcConfig = {
  primaryUrl: string;
  /** Optional second endpoint. Omit for no failover — never a public RPC. */
  fallbackUrl?: string;
  /** Ceiling on requests/second across *all* endpoints. */
  maxRequestsPerSecond?: number;
};

/**
 * Build a Solana RPC whose transport is rate-gated and backs off on 429 from
 * whichever endpoint produced it.
 */
export function createThrottledRpc({
  primaryUrl,
  fallbackUrl,
  maxRequestsPerSecond = DEFAULT_MAX_RPS,
}: ThrottledRpcConfig) {
  const ceilingRate =
    maxRequestsPerSecond > 0 ? maxRequestsPerSecond : DEFAULT_MAX_RPS;

  const primaryTransport = createDefaultRpcTransport({ url: primaryUrl });
  const fallbackTransport = fallbackUrl
    ? createDefaultRpcTransport({ url: fallbackUrl })
    : null;

  const gate = createRateGate(ceilingRate);
  let currentRate = ceilingRate;
  let successStreak = 0;
  let consecutiveFailures = 0;
  let primaryUnhealthyUntil = 0;

  /**
   * A 429 always means "slow down". The SDK computed the next rate as
   * `min(ceiling, advertised * 0.9)`, so any advertised limit at or above the
   * ceiling resolved straight back to the ceiling and the backoff never
   * happened — and public mainnet-beta advertises 250. Measured against a
   * server returning `x-ratelimit-rps-limit: 250` with every 429: 151 requests
   * in 15.7s, pinned at 10 req/s. Without the header the same test backed off
   * to 1 req/s and issued 24. So an advertised limit may only *lower* the rate
   * here; it can never hold it up.
   */
  const applyRateLimit = (headers: Headers) => {
    successStreak = 0;
    const advertised = parseRpsLimit(headers);
    const fromHeader =
      advertised !== null
        ? advertised * RATE_SAFETY_FACTOR
        : Number.POSITIVE_INFINITY;
    const next = Math.max(
      MIN_RATE,
      Math.min(fromHeader, currentRate * AIMD_DECREASE),
    );
    if (next !== currentRate) {
      currentRate = next;
      gate.setRate(currentRate);
    }
    const retryAfter = parseRetryAfterMs(headers);
    gate.pauseFor(retryAfter ?? DEFAULT_COOLDOWN_MS);
    log.warn(
      `[solanaRpc] 429 — throttling to ${currentRate.toFixed(1)} req/s, cooling down ${
        retryAfter ?? DEFAULT_COOLDOWN_MS
      }ms`,
    );
  };

  const onSuccess = () => {
    consecutiveFailures = 0;
    if (currentRate >= ceilingRate) return;
    if (++successStreak >= RECOVERY_SUCCESSES) {
      successStreak = 0;
      currentRate = Math.min(ceilingRate, currentRate + 1);
      gate.setRate(currentRate);
    }
  };

  const onFailure = (error: unknown, usedFallback: boolean) => {
    // Adapt to rate limits from *either* endpoint — the blind spot that let the
    // old fallback path run flat out.
    const headers = http429Headers(error);
    if (headers) applyRateLimit(headers);

    if (usedFallback || !fallbackTransport) return;
    if (++consecutiveFailures >= FAILURES_BEFORE_FAILOVER) {
      primaryUnhealthyUntil = Date.now() + PRIMARY_RECHECK_MS;
      consecutiveFailures = 0;
      log.warn(
        `[solanaRpc] primary RPC unhealthy — using configured fallback for ${PRIMARY_RECHECK_MS}ms`,
      );
    }
  };

  const transport = (async (config: {
    payload: unknown;
    signal?: AbortSignal;
  }) => {
    // Queue outside the request so the wait never counts against the timeout.
    await gate.acquire();

    const usedFallback =
      fallbackTransport !== null && Date.now() < primaryUnhealthyUntil;
    const active = usedFallback
      ? (fallbackTransport as RpcTransport)
      : primaryTransport;

    const { signal, cleanup } = withTimeout(config.signal, REQUEST_TIMEOUT_MS);
    try {
      const response = await active({ ...config, signal });
      onSuccess();
      return response;
    } catch (error) {
      // A caller cancelling says nothing about endpoint health. React Query
      // aborts in-flight queries on unmount, so counting those would let a few
      // navigations mark a perfectly healthy primary unhealthy and divert
      // traffic to the fallback. The internal timeout above is a genuine health
      // signal and still counts -- it aborts our own controller, not this one.
      if (!config.signal?.aborted) {
        onFailure(error, usedFallback);
      }
      throw error;
    } finally {
      cleanup();
    }
  }) as RpcTransport;

  return createSolanaRpcFromTransport(transport);
}
