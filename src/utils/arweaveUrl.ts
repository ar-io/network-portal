import { DEFAULT_ARWEAVE_HOST, DEFAULT_ARWEAVE_PROTOCOL } from '@src/constants';

/**
 * Cached result of the ar.io gateway check. Defaults to false (use
 * turbo-gateway.com) until the async probe completes.
 */
let _isGateway: boolean | null = null;

/**
 * Probe whether the app is being served from an ar.io gateway by
 * hitting /ar-io/info. Called once on app load; the result is cached
 * for the session lifetime.
 */
export async function probeArIOGateway(): Promise<boolean> {
  if (_isGateway !== null) return _isGateway;

  try {
    const res = await fetch('/ar-io/info', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      // Real ar.io gateways return JSON with a "wallet" field
      _isGateway = typeof data?.wallet === 'string';
    } else {
      _isGateway = false;
    }
  } catch {
    _isGateway = false;
  }
  return _isGateway;
}

/**
 * Returns the cached result of the gateway probe. If the probe hasn't
 * completed yet, returns false (safe default — uses turbo-gateway.com).
 */
export function isOnArIOGateway(): boolean {
  return _isGateway === true;
}

/**
 * Build a URL for an Arweave transaction ID. Uses a relative path when
 * the app is served from an ar.io gateway (so the serving gateway
 * fetches the data), otherwise falls back to the configured gateway
 * host (default: turbo-gateway.com).
 */
export function arweaveTxUrl(txId: string): string {
  if (_isGateway) {
    return `/${txId}`;
  }
  return `${DEFAULT_ARWEAVE_PROTOCOL}://${DEFAULT_ARWEAVE_HOST}/${txId}`;
}
