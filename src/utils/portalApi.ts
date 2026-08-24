/**
 * Client for the portal snapshot API.
 *
 * Every whole-program scan this app makes — gateways, vaults, balances,
 * delegations — is identical for every visitor, so running them per browser
 * made RPC cost scale with traffic. A publisher runs them on a cadence and
 * serves static JSON; this reads that.
 *
 * Three rules, in order of importance:
 *
 * 1. **The API is never a hard dependency.** Any failure — unset, unreachable,
 *    malformed, stale, wrong network — returns null and the caller falls back
 *    to direct RPC. The production build is published immutably to Arweave, so
 *    a hard dependency on a host that lapses would brick a permanent deploy.
 * 2. **Stale data is refused, not rendered.** A snapshot older than
 *    `MAX_SNAPSHOT_AGE_MS` is treated as absent. Serving hours-old stake
 *    figures silently is worse than spending the RPC call.
 * 3. **The network must match.** A mainnet snapshot rendered while the app
 *    points at devnet would look like corrupted data rather than a
 *    misconfiguration.
 *
 * Unset `VITE_PORTAL_API_URL` disables all of this and the app behaves exactly
 * as it did before.
 */

import { PORTAL_API_URL, log } from '@src/constants';

/** Documents the publisher writes. */
export type PortalDocumentName =
  | 'gateways'
  | 'vaults'
  | 'balances'
  | 'delegates'
  | 'summary';

/**
 * How old a snapshot may be before we prefer a live read.
 *
 * The publisher runs every 10 minutes, so this tolerates two missed cycles
 * plus slack. Beyond that the data is stale enough that paying for the scan is
 * the better trade.
 */
const MAX_SNAPSHOT_AGE_MS = 30 * 60 * 1000;

/** A slow API must never be slower than just doing the RPC call. */
const REQUEST_TIMEOUT_MS = 8_000;

interface PortalEnvelope<T> {
  schemaVersion?: string;
  generatedAt?: string;
  network?: string;
  count?: number;
  items?: T[];
}

/** True when a portal API is configured for this build. */
export const isPortalApiEnabled = (): boolean => PORTAL_API_URL.length > 0;

/**
 * Which network the app is currently pointed at, in the vocabulary the
 * publisher stamps on documents. Mirrors the inference used elsewhere.
 */
export const networkTierFromRpcUrl = (rpcUrl: string): string => {
  const probe = (value: string): string => {
    const lower = value.toLowerCase();
    if (lower.includes('localhost') || lower.includes('127.0.0.1'))
      return 'localnet';
    if (lower.includes('devnet')) return 'devnet';
    if (lower.includes('testnet')) return 'testnet';
    return 'mainnet';
  };

  try {
    const url = new URL(rpcUrl);
    return probe(`${url.hostname}${url.pathname}`);
  } catch {
    return probe(rpcUrl);
  }
};

/**
 * Fetch one document, or null if it cannot be trusted for any reason.
 *
 * Never throws: a caller is expected to write `(await fetchPortalDocument(…))
 * ?? (await rpcScan())`, and an exception here would defeat that.
 */
export async function fetchPortalDocument<T>(
  name: PortalDocumentName,
  expectedNetwork: string,
): Promise<T[] | null> {
  if (!isPortalApiEnabled()) return null;

  const url = `${PORTAL_API_URL.replace(/\/+$/, '')}/api/v1/portal/${name}.json`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      log.debug(
        `[portalApi] ${name}: HTTP ${response.status}, falling back to RPC`,
      );
      return null;
    }

    const body = (await response.json()) as PortalEnvelope<T>;

    if (!Array.isArray(body.items)) {
      log.warn(`[portalApi] ${name}: no items array, falling back to RPC`);
      return null;
    }

    if (body.network && body.network !== expectedNetwork) {
      // Rendering another network's data would look like corruption.
      log.warn(
        `[portalApi] ${name}: snapshot is for ${body.network}, app is on ${expectedNetwork} — falling back to RPC`,
      );
      return null;
    }

    const ageMs = body.generatedAt
      ? Date.now() - Date.parse(body.generatedAt)
      : Number.NaN;
    if (!Number.isFinite(ageMs) || ageMs > MAX_SNAPSHOT_AGE_MS) {
      log.warn(
        `[portalApi] ${name}: snapshot is ${Math.round(ageMs / 60000)}m old, falling back to RPC`,
      );
      return null;
    }

    log.debug(`[portalApi] ${name}: ${body.items.length} items from snapshot`);
    return body.items;
  } catch (error) {
    // Timeout, DNS failure, CORS, offline — all the same answer.
    log.debug(
      `[portalApi] ${name}: unavailable (${error}), falling back to RPC`,
    );
    return null;
  }
}

/**
 * Read from the snapshot, else run the live scan.
 *
 * The shape both sides return is identical because the publisher stores the
 * SDK's decoded objects verbatim rather than a projection.
 */
export async function snapshotOrRpc<T>(
  name: PortalDocumentName,
  expectedNetwork: string,
  rpcScan: () => Promise<T[]>,
): Promise<T[]> {
  const snapshot = await fetchPortalDocument<T>(name, expectedNetwork);
  return snapshot ?? (await rpcScan());
}
