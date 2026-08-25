/**
 * Client for the analyzer's archive API — a different service contract from
 * the portal snapshot documents in `portalApi.ts`, served by the same host.
 *
 * Three differences make it worth a separate client rather than another entry
 * in `PortalDocumentName`:
 *
 * 1. **No network or programIds stamp.** The portal documents carry both and
 *    `fetchPortalDocument` refuses a mismatch. These carry neither, so that
 *    guard has nothing to check and cannot be reused.
 * 2. **Cadence varies by document.** The portal republishes every ~10 minutes
 *    and its client applies one 30-minute freshness window. `network.json` and
 *    the gateway roster are rebuilt DAILY — the same window would reject every
 *    one of them, silently, forever. Freshness is therefore per document.
 * 3. **Epoch documents are history, not state.** A closed epoch does not go
 *    stale; refusing an old one would defeat the point of reading it.
 *
 * What carries over unchanged is the contract that matters: this is never a
 * hard dependency. Anything unavailable, malformed or stale returns null and
 * the caller renders without it.
 */

import { log } from '@src/constants';
import { useSettings } from '@src/store/settings';

/** A slow API must never be slower than doing without it. */
const REQUEST_TIMEOUT_MS = 8_000;

/**
 * How old each document may be before it is treated as absent.
 *
 * The daily documents get two days: one missed run is a late crank, two is the
 * analysis having stopped. `null` means age is not a criterion.
 */
const MAX_AGE_MS = {
  network: 48 * 60 * 60 * 1000,
  gateways: 48 * 60 * 60 * 1000,
  observers: 48 * 60 * 60 * 1000,
  findings: 48 * 60 * 60 * 1000,
  epoch: null,
} as const;

export type AnalyzerDocument = keyof typeof MAX_AGE_MS;

const analyzerBaseUrl = (): string => {
  const configured = useSettings.getState()?.portalApiUrl;
  return (typeof configured === 'string' ? configured : '').trim();
};

const pathFor = (doc: AnalyzerDocument, epochIndex?: number): string =>
  doc === 'epoch' ? `/api/v1/epochs/${epochIndex}.json` : `/api/v1/${doc}.json`;

/**
 * Fetch one analyzer document, or null if it cannot be trusted.
 *
 * Never throws: callers treat absence as "render without this section", and an
 * exception would turn a missing panel into a broken page.
 */
/**
 * Transient-failure retries.
 *
 * Deliberately narrow. A non-ok HTTP response is an ANSWER — a 404 means the
 * epoch is outside the retained window, and retrying it just burns time before
 * reaching the same conclusion. Only a thrown fetch (timeout, DNS, connection
 * reset) is retried, because that is the case where the document probably
 * exists and we simply failed to reach it.
 *
 * Two retries, backing off: enough to ride out a blip, bounded so a genuinely
 * unreachable host does not hold a page hostage. Note this sits on plain
 * `fetch`, not on an SDK call that already retries — the multiplication problem
 * documented in App.tsx's React Query defaults does not apply here.
 */
const TRANSIENT_RETRY_DELAYS_MS = [400, 1200];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchAnalyzerDocument<T>(
  doc: AnalyzerDocument,
  epochIndex?: number,
): Promise<T | null> {
  const base = analyzerBaseUrl();
  if (base.length === 0) return null;

  const url = `${base.replace(/\/+$/, '')}${pathFor(doc, epochIndex)}`;

  for (let attempt = 0; ; attempt++) {
    const result = await attemptAnalyzerFetch<T>(doc, url);
    if (result.kind === 'ok') return result.body;
    if (result.kind === 'refused') return null;

    // kind === 'unreachable'
    const delay = TRANSIENT_RETRY_DELAYS_MS[attempt];
    if (delay === undefined) {
      log.debug(`[analyzerApi] ${doc}: unreachable after retries`);
      return null;
    }
    await sleep(delay);
  }
}

type AttemptResult<T> =
  | { kind: 'ok'; body: T | null }
  | { kind: 'refused' }
  | { kind: 'unreachable' };

async function attemptAnalyzerFetch<T>(
  doc: AnalyzerDocument,
  url: string,
): Promise<AttemptResult<T>> {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      // Only ever a plain GET with a safelisted header: this stays a CORS
      // "simple request" and never triggers a preflight, which the host
      // answers with 405.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      // A 404 is ordinary here — an epoch older than the retained window.
      log.debug(`[analyzerApi] ${doc}: HTTP ${response.status}`);
      return { kind: 'refused' };
    }

    const body = (await response.json()) as T & { generatedAt?: string };

    const maxAgeMs = MAX_AGE_MS[doc];
    if (maxAgeMs !== null) {
      const ageMs = body.generatedAt
        ? Date.now() - Date.parse(body.generatedAt)
        : Number.NaN;
      if (!Number.isFinite(ageMs) || ageMs > maxAgeMs) {
        log.warn(
          `[analyzerApi] ${doc}: ${Math.round(ageMs / 3600000)}h old, ignoring`,
        );
        // Stale is a verdict, not a blip — retrying returns the same document.
        return { kind: 'refused' };
      }
    }

    return { kind: 'ok', body };
  } catch (error) {
    log.debug(`[analyzerApi] ${doc}: unreachable (${error})`);
    return { kind: 'unreachable' };
  }
}

/* -------------------------------------------------------------------------
 * Document shapes. Only the fields the portal renders are declared; the
 * documents carry more, and everything here is optional because a degraded
 * analysis run publishes partial data rather than failing.
 * ---------------------------------------------------------------------- */

export interface AnalyzerVersionDistribution {
  version: string;
  count: number;
  percentage: number;
}

export interface AnalyzerNetworkSummary {
  generatedAt?: string;
  totals?: {
    gatewaysInNetwork?: number;
    gatewaysAnalyzed?: number;
    resolved?: number;
    failedDns?: number;
    clustered?: number;
    highCentralization?: number;
  };
  infrastructure?: {
    totalDatacenterHosted?: number;
    datacenterPercentage?: number;
    topProviders?: Array<{ name: string; count: number; percentage: number }>;
    countryDistribution?: Array<{
      country: string;
      countryCode: string;
      count: number;
      percentage: number;
    }>;
    uniqueIsps?: number;
    uniqueCountries?: number;
    uniqueAsns?: number;
  };
  versions?: {
    distribution?: AnalyzerVersionDistribution[];
    topVersion?: string;
    topVersionCount?: number;
    topVersionPercentage?: number;
    totalGateways?: number;
    totalReporting?: number;
  } | null;
  observers?: {
    epochRange?: { from: number; to: number; count: number };
    observerCount?: number;
    findingCount?: number;
    bySeverity?: Record<string, number>;
    byKind?: Record<string, number>;
    calibrated?: boolean;
  };
}

export interface AnalyzerObserverRollup {
  observer: string;
  fqdn?: string | null;
  epochsObserved: number;
  firstEpochIndex: number;
  lastEpochIndex: number;
  distinctReportTxIds: number;
  /** Epochs where this observer cited a report another observer also cited. */
  sharedReportEpochs: number;
  findingCount: number;
  maxSeverity?: string | null;
  kinds?: string[];
}

export interface AnalyzerObserversDocument {
  generatedAt?: string;
  observers?: AnalyzerObserverRollup[];
}

/** One row of the per-gateway analysis roster. */
export interface AnalyzerGatewayRow {
  fqdn?: string;
  wallet?: string;
  observer?: string;
  status?: string;
  stake?: number;
  arIoRelease?: string | number | null;
  arIoVersion?: string | null;
  dnsResolved?: boolean;
  ipAddress?: string | null;
  asn?: number | string | null;
  asnOrg?: string | null;
  isp?: string | null;
  hosting?: boolean | null;
  city?: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  baseDomain?: string | null;
  clusterId?: string | number | null;
  clusterSize?: number | null;
  clusterRole?: string | null;
  clusterKind?: string | null;
  scores?: Record<string, number> | null;
  suspicionNotes?: string[] | null;
}

export interface AnalyzerGatewaysDocument {
  generatedAt?: string;
  gateways?: AnalyzerGatewayRow[];
}

export interface AnalyzerObservation {
  observer: string;
  reportTxId: string;
  gatewayCount: number;
  submittedAt?: string;
  submittedAtUnix?: number;
  suspectTimestamp?: boolean;
  gatewayResultsBase64?: string;
  gatewayResultsEncoding?: string;
}

/** One detector output. Summaries state what the data shows, not what it means. */
export interface AnalyzerFinding {
  id?: string;
  kind?: string;
  epochIndex?: number | null;
  severity?: string;
  /** Capped at 0.5 by the publisher while the similarity threshold is uncalibrated. */
  confidence?: number;
  observerCount?: number;
  summary?: string;
}

/**
 * The rolling cross-epoch findings document.
 *
 * `counts` is the publisher's own tally over `findings`, which is itself capped
 * to `window.epochs`. Read the counts rather than re-deriving them from the
 * array: when `window.truncated` is set the array is the shorter of the two.
 */
export interface AnalyzerFindingsDocument {
  generatedAt?: string;
  detectorVersion?: number;
  /**
   * False while the publisher's similarity threshold has not been calibrated
   * against known-independent observers. Every consumer must say so — an
   * uncalibrated detector produces leads, not verdicts.
   */
  calibrated?: boolean;
  thresholdSimilarity?: number;
  epochRange?: { from?: number; to?: number; count?: number };
  window?: { epochs?: number; from?: number; truncated?: boolean };
  counts?: {
    total?: number;
    bySeverity?: Record<string, number>;
    byKind?: Record<string, number>;
  };
  findings?: AnalyzerFinding[];
}

export interface AnalyzerEpochDocument {
  epochIndex: number;
  generatedAt?: string;
  observationCount?: number;
  distinctReportTxIds?: number;
  /**
   * Whether the gateway registry slot order was captured. Without it the
   * results bitmap cannot be mapped back to individual gateways — see
   * {@link countGatewayResults}.
   */
  registryCaptured?: boolean;
  registryApproximate?: boolean;
  registryDigest?: string | null;
  firstSubmittedAtUnix?: number | null;
  lastSubmittedAtUnix?: number | null;
  observations?: AnalyzerObservation[];
  findings?: AnalyzerFinding[];
}

/** The only bitmap encoding this decoder is correct for. */
const SUPPORTED_BITMAP_ENCODING = 'gar-bitmap-v1-lsb';

export interface GatewayResultTotals {
  passed: number;
  failed: number;
  total: number;
  passRate: number;
}

/**
 * Count passes and failures in an observation's results bitmap.
 *
 * **Counting is safe; attributing is not.** The bitmap's bit `i` refers to
 * slot `i` of the gateway registry as it stood in that epoch, and the archive
 * publishes only a digest of that ordering, not the ordering itself. So a
 * total is exact — population count does not depend on which gateway sits in
 * which slot — while naming *which* gateway failed would be a guess against
 * today's registry, and a wrong name is worse than no name.
 *
 * Returns null rather than a zeroed total when the bitmap is absent, short, or
 * in an encoding this has not been checked against, so a caller can tell
 * "nothing to show" from "everything failed".
 */
export const countGatewayResults = (
  observation: AnalyzerObservation,
): GatewayResultTotals | null => {
  const { gatewayResultsBase64, gatewayCount, gatewayResultsEncoding } =
    observation;

  if (!gatewayResultsBase64 || !gatewayCount || gatewayCount <= 0) return null;

  // An omitted encoding is refused, not assumed. Guessing `lsb` on an
  // unversioned document would produce confident totals from bits that may be
  // laid out the other way round, and a wrong pass count is worse than none.
  if (gatewayResultsEncoding !== SUPPORTED_BITMAP_ENCODING) {
    log.warn(
      `[analyzerApi] bitmap encoding ${gatewayResultsEncoding ?? '(absent)'} is not ${SUPPORTED_BITMAP_ENCODING}, refusing to decode`,
    );
    return null;
  }

  let bytes: Uint8Array;
  try {
    const binary = atob(gatewayResultsBase64);
    bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }

  // A bitmap shorter than the count it claims would silently read failures
  // where there is no data at all.
  if (bytes.length * 8 < gatewayCount) return null;

  let passed = 0;
  for (let i = 0; i < gatewayCount; i++) {
    // LSB-first within each byte, matching `gar-bitmap-v1-lsb` and the live
    // decoding in useObservations.
    passed += (bytes[i >> 3] >> (i & 7)) & 1;
  }

  return {
    passed,
    failed: gatewayCount - passed,
    total: gatewayCount,
    passRate: passed / gatewayCount,
  };
};

/* -------------------------------------------------------------------------
 * Endpoint identity and capability.
 * ---------------------------------------------------------------------- */

/**
 * The archive's root manifest, `/api/v1/index.json`.
 *
 * `documents` is a MAP keyed by document name, not a list of names — and its
 * `epochs` entry is an array with one record per archived epoch rather than a
 * single document. Both matter: reading it as a list yields nothing, which
 * silently gates every panel off.
 */
interface AnalyzerRootManifest {
  schemaVersion?: string;
  generatedAt?: string;
  documents?: Record<string, unknown>;
  archive?: Array<{ date: string; path: string }>;
}

/** Just enough of `/api/v1/portal/index.json` to identify the endpoint. */
interface PortalManifest {
  network?: string;
}

/**
 * What this endpoint is, and what it can answer.
 *
 * Two problems solved by one pair of small reads:
 *
 * 1. **Identity.** The archive documents carry no `network` or `programIds`
 *    stamp, so unlike the portal documents there is nothing on them to refuse.
 *    Pointed at another network's host they would render that network's
 *    analysis as this one's. The portal half of the same host *is* stamped, so
 *    it is used to identify the host before any archive document is trusted.
 * 2. **Capability.** Not every deployment publishes the archive — devnet
 *    serves the portal documents and nothing else. Without this, every
 *    historical epoch pays a doomed round trip before falling back to the live
 *    read: thirteen of them across one session on the epoch selector.
 *
 * Unverifiable is treated as unavailable. A host whose portal manifest cannot
 * be read is one whose identity cannot be established, and the analysis panels
 * are additive enough that refusing is cheaper than being wrong.
 */
export interface AnalyzerAvailability {
  /** The endpoint is for the network this app is pointed at. */
  networkMatches: boolean;
  /** Which archive documents the endpoint publishes. */
  documents: string[];
  /**
   * Exactly which epochs are archived.
   *
   * The manifest lists them, so an epoch outside the retained window can be
   * skipped without spending a request to be told 404.
   */
  archivedEpochs: number[];
  /** Endpoint identity, for logging. */
  network?: string;
}

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const fetchAnalyzerAvailability = async (
  expectedNetwork: string,
): Promise<AnalyzerAvailability> => {
  const base = analyzerBaseUrl().replace(/\/+$/, '');
  const unavailable: AnalyzerAvailability = {
    networkMatches: false,
    documents: [],
    archivedEpochs: [],
  };
  if (base.length === 0) return unavailable;

  const [root, portal] = await Promise.all([
    fetchJson<AnalyzerRootManifest>(`${base}/api/v1/index.json`),
    fetchJson<PortalManifest>(`${base}/api/v1/portal/index.json`),
  ]);

  // The portal manifest is the only stamped thing this host serves. No stamp,
  // no identity, no trust.
  if (!portal?.network) {
    log.debug('[analyzerApi] endpoint publishes no network stamp — ignoring');
    return unavailable;
  }

  if (portal.network !== expectedNetwork) {
    log.warn(
      `[analyzerApi] endpoint is for ${portal.network}, app is on ${expectedNetwork} — ignoring its analysis`,
    );
    return { ...unavailable, network: portal.network };
  }

  const documentMap = root?.documents;
  const documents =
    documentMap && typeof documentMap === 'object'
      ? Object.keys(documentMap)
      : [];

  const epochEntries = documentMap?.epochs;
  const archivedEpochs = Array.isArray(epochEntries)
    ? epochEntries
        .map((entry) => (entry as { epochIndex?: number })?.epochIndex)
        .filter((index): index is number => typeof index === 'number')
    : [];

  return {
    networkMatches: true,
    documents,
    archivedEpochs,
    network: portal.network,
  };
};

/** Roster indexed for lookup, as {@link useGatewayRoster} returns it. */
export interface AnalyzerRosterIndex {
  rows: AnalyzerGatewayRow[];
  byWallet: Map<string, AnalyzerGatewayRow>;
  byFqdn: Map<string, AnalyzerGatewayRow>;
  /**
   * FQDNs claimed by more than one row.
   *
   * A hostname can be shared or re-pointed, so when two rows claim one the
   * name identifies neither. Without this the map would silently keep whichever
   * row was indexed last and the fallback would attribute another operator's
   * provider, location and ASN to this gateway.
   */
  ambiguousFqdns: Set<string>;
}

/**
 * Find a gateway's roster row.
 *
 * Wallet first: an FQDN can be re-pointed or shared between gateways, while
 * the registry wallet is the gateway's identity. The FQDN is only a fallback
 * for rows the roster published without a wallet.
 *
 * Returns undefined for a gateway the roster does not cover — the roster only
 * includes gateways that are joined AND publish an FQDN, roughly half the
 * registry, so absence is ordinary and not an error.
 */
export const matchRosterRow = (
  roster: AnalyzerRosterIndex | null | undefined,
  gateway: { gatewayAddress?: string; fqdn?: string } | null | undefined,
): AnalyzerGatewayRow | undefined => {
  if (!roster || !gateway) return undefined;

  const byWallet = gateway.gatewayAddress
    ? roster.byWallet.get(gateway.gatewayAddress)
    : undefined;
  if (byWallet) return byWallet;

  if (!gateway.fqdn) return undefined;
  const fqdn = gateway.fqdn.toLowerCase();
  // Ambiguous resolves to nothing rather than to a guess.
  if (roster.ambiguousFqdns.has(fqdn)) return undefined;

  return roster.byFqdn.get(fqdn);
};

/**
 * Render a roster `asn` value as a bare autonomous-system number.
 *
 * The field is not a number. It arrives as `"AS214996 netcup GmbH"` — already
 * carrying the `AS` prefix, and trailing the operator name that the Provider
 * row displays anyway. Formatting it as `AS${asn}` produced `ASAS214996 netcup
 * GmbH`, and repeated the provider twice in one card.
 *
 * A plain number is still accepted and prefixed, since the contract types it as
 * either.
 */
export const formatAsn = (
  asn: string | number | null | undefined,
): string | undefined => {
  if (asn === null || asn === undefined) return undefined;
  if (typeof asn === 'number')
    return Number.isFinite(asn) ? `AS${asn}` : undefined;

  const trimmed = asn.trim();
  if (trimmed.length === 0) return undefined;

  const numbered = trimmed.match(/^AS\s*(\d+)/i);
  // Anything that is not recognisably an AS number is shown verbatim rather
  // than mangled into one.
  return numbered ? `AS${numbered[1]}` : trimmed;
};
