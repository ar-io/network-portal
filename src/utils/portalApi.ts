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
import { useSettings } from '@src/store/settings';
import { shouldReadLive } from './snapshotFreshness';

/**
 * The endpoint to read, which the user can change in Settings.
 *
 * Read per call rather than captured at module load so a change in Settings
 * takes effect on the next fetch. Falls back to the build's
 * `VITE_PORTAL_API_URL` if the setting is somehow absent, which keeps an unset
 * variable meaning "off".
 */
const resolvePortalApiUrl = (): string => {
  const configured = useSettings.getState()?.portalApiUrl;
  return (typeof configured === 'string' ? configured : PORTAL_API_URL).trim();
};

/** Documents the publisher writes. */
/**
 * Documents reachable through {@link fetchPortalDocument}.
 *
 * Only the ones this app actually reads. `summary.json` is deliberately absent:
 * it carries scalars rather than an `items` array, so naming it here would
 * invite a call that fetches successfully and is then discarded for having no
 * items — see {@link fetchPortalSummary} instead.
 */
export type PortalDocumentName =
  | 'gateways'
  | 'vaults'
  | 'balances'
  | 'delegates'
  | 'primaryNames';

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

/**
 * The Solana programs a document was derived from (schema >= 1.2).
 *
 * `network` alone is not enough to trust a document: program ids are
 * per-cluster and a redeploy moves them, and decoding accounts from the wrong
 * program yields plausible nonsense rather than an error.
 */
export interface PortalProgramIds {
  core?: string;
  gar?: string;
  arns?: string;
  ant?: string;
}

interface PortalEnvelope<T> {
  schemaVersion?: string;
  generatedAt?: string;
  network?: string;
  programIds?: PortalProgramIds;
  count?: number;
  items?: T[];
}

/** `summary.json` — scalars and counts, with no `items` array. */
export interface PortalSummary {
  schemaVersion?: string;
  generatedAt?: string;
  network?: string;
  programIds?: PortalProgramIds;
  counts?: {
    gateways?: number;
    vaults?: number;
    balances?: number;
    delegates?: number;
    withdrawals?: number;
    primaryNames?: number;
    arnsRecords?: number;
  };
  tokenSupply?: unknown;
  demandFactor?: number | null;
  gatewayRegistrySettings?: unknown;
}

/**
 * Compare a document's program ids against the ones this app is configured
 * with, and refuse a mismatch.
 *
 * Deliberately conservative: only ids the user has explicitly overridden in
 * settings are compared. When a setting is unset the SDK is on its defaults
 * for the network, and the `network` check already covers a cross-cluster
 * mixup — so an unset id is not evidence of a mismatch and must not cause a
 * needless fallback to RPC.
 */
function programIdsDisagree(
  documentIds: PortalProgramIds | undefined,
  configured: PortalProgramIds,
): string | null {
  if (!documentIds) return null; // schema < 1.2 — nothing to compare
  const keys: (keyof PortalProgramIds)[] = ['core', 'gar', 'arns', 'ant'];
  for (const key of keys) {
    const mine = configured[key];
    const theirs = documentIds[key];
    if (mine && theirs && mine !== theirs) {
      return `${key} program is ${theirs} in the snapshot but ${mine} here`;
    }
  }
  return null;
}

/** True when a portal API is configured for this build. */
export const isPortalApiEnabled = (): boolean =>
  resolvePortalApiUrl().length > 0;

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
  expectedProgramIds: PortalProgramIds = {},
): Promise<T[] | null> {
  if (!isPortalApiEnabled()) return null;

  const url = `${resolvePortalApiUrl().replace(/\/+$/, '')}/api/v1/portal/${name}.json`;

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

    const idMismatch = programIdsDisagree(body.programIds, expectedProgramIds);
    if (idMismatch) {
      // Same reasoning as the network check, one level finer: a redeploy moves
      // program ids within a network, and decoding the wrong program's
      // accounts produces plausible nonsense rather than an error.
      log.warn(`[portalApi] ${name}: ${idMismatch} — falling back to RPC`);
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

    // Lay any rows read from chain after a write over the published document.
    // Without this a refetch triggered by that very write re-downloads the
    // pre-write state; the overlay drops itself once a newer snapshot lands.
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
  expectedProgramIds: PortalProgramIds = {},
): Promise<T[]> {
  // A write this session lands here before the publisher has republished, and
  // the snapshot cannot say whether it contains that write — see
  // `@src/utils/snapshotFreshness`. Read from chain until the window closes.
  //
  // Still falling back to the snapshot if that read fails: the API is never a
  // hard dependency in this client, and the reverse has to hold too. Bypassing
  // it outright would mean a throttled or unreachable RPC surfaces an error
  // where, before this window existed, the user would have seen data — stale
  // by a publish interval, but data.
  let liveError: unknown;
  if (shouldReadLive(name)) {
    log.debug(`[portalApi] ${name}: recent write, reading live`);
    try {
      return await rpcScan();
    } catch (error) {
      liveError = error;
      log.debug(
        `[portalApi] ${name}: live read failed (${error}), falling back to the snapshot`,
      );
    }
  }

  const snapshot = await fetchPortalDocument<T>(
    name,
    expectedNetwork,
    expectedProgramIds,
  );
  if (snapshot) {
    return snapshot;
  }

  // The scan already failed once; running it again would double the load on an
  // endpoint that is evidently struggling, and the throttle halves its own rate
  // on every 429.
  if (liveError !== undefined) {
    throw liveError;
  }

  return rpcScan();
}

/**
 * Read `summary.json`, which carries scalars and counts rather than an `items`
 * array, so `fetchPortalDocument` cannot be used for it.
 *
 * Same contract: unset, unreachable, malformed, stale, wrong network or wrong
 * programs all return null and the caller falls back to RPC.
 */
export async function fetchPortalSummary(
  expectedNetwork: string,
  expectedProgramIds: PortalProgramIds = {},
): Promise<PortalSummary | null> {
  if (!isPortalApiEnabled()) return null;

  const url = `${resolvePortalApiUrl().replace(/\/+$/, '')}/api/v1/portal/summary.json`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      log.debug(
        `[portalApi] summary: HTTP ${response.status}, falling back to RPC`,
      );
      return null;
    }

    const body = (await response.json()) as PortalSummary;

    if (body.network && body.network !== expectedNetwork) {
      log.warn(
        `[portalApi] summary: snapshot is for ${body.network}, app is on ${expectedNetwork} — falling back to RPC`,
      );
      return null;
    }

    const idMismatch = programIdsDisagree(body.programIds, expectedProgramIds);
    if (idMismatch) {
      log.warn(`[portalApi] summary: ${idMismatch} — falling back to RPC`);
      return null;
    }

    const ageMs = body.generatedAt
      ? Date.now() - Date.parse(body.generatedAt)
      : Number.NaN;
    if (!Number.isFinite(ageMs) || ageMs > MAX_SNAPSHOT_AGE_MS) {
      log.warn(
        `[portalApi] summary: snapshot is ${Math.round(ageMs / 60000)}m old, falling back to RPC`,
      );
      return null;
    }

    return body;
  } catch (error) {
    log.debug(
      `[portalApi] summary: unavailable (${error}), falling back to RPC`,
    );
    return null;
  }
}
