import { EpochData } from '@ar.io/sdk/web';
import { log } from '@src/constants';
import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useGlobalState, useSettings } from '@src/store';
import {
  type AnalyzerEpochDocument,
  type AnalyzerFinding,
  type AnalyzerRegistryDocument,
  type GatewayResultTotals,
  attributeGatewayResults,
  countGatewayResults,
  fetchAnalyzerDocument,
} from '@src/utils/analyzerApi';
import type { EpochCapture } from '@src/utils/observationCapture';
import { useQuery } from '@tanstack/react-query';

/**
 * Observation discriminator from @ar.io/solana-contracts/gar.
 * Hardcoded here so the portal can make its own getProgramAccounts call
 * with base64 encoding, bypassing the SDK's base58 memcmp filters which
 * silently return empty in Vite's dev server (the pre-bundled SDK ignores
 * node_modules updates). Production builds via `yarn build` use the
 * fixed SDK directly, but for dev we need this workaround.
 */
const OBSERVATION_DISCRIMINATOR = new Uint8Array([
  0x6d, 0xbe, 0xbe, 0x5f, 0x1c, 0xac, 0xf3, 0x4a,
]);

export interface ObservationData {
  /** Observer address -> Arweave report transaction id. */
  reports: Record<string, string>;
  /** Gateway address -> observers that failed it. Empty when unattributable. */
  failureSummaries: Record<string, string[]>;
  /**
   * Where this came from. `rpc` reads the live `Observation` accounts; those
   * are deleted by the permissionless `close_observation` once an epoch
   * distributes, so a closed epoch is served from the published archive.
   */
  source: 'rpc' | 'archive';
  /**
   * Whether `failureSummaries` could be built at all.
   *
   * The results bitmap indexes into the gateway registry's slot order for that
   * epoch. The live path has that order in hand; the archive path needs the
   * published `registry/<n>.json`, and refuses attribution whenever it is
   * absent, unpaired, captured after the epoch closed, or disagrees with the
   * protocol's own failure tally — see `attributeGatewayResults`.
   *
   * Consumers MUST branch on this rather than reading an empty
   * `failureSummaries` as "this observer reported no failures".
   */
  hasGatewayAttribution: boolean;
  /**
   * Per-observer pass/fail totals. Available from both sources, because a
   * population count does not depend on which gateway sits in which slot.
   */
  totalsByObserver: Record<string, GatewayResultTotals>;
  /** Observers that submitted for this epoch. */
  observationCount: number;
  /**
   * Distinct report transactions across those observers.
   *
   * Fewer than `observationCount` means observers cited the same report — the
   * single clearest independence signal in the data, and free to compute from
   * either source.
   */
  distinctReportTxIds: number;
  /** Detector output for this epoch. Only the archive carries it. */
  findings?: AnalyzerFinding[];
  /**
   * Whether `observationCount` is the whole truth, or only what survived.
   *
   * Consumers that state a count, a rate or an absence MUST branch on this.
   * An epoch the archive missed reads as zero observations from every source
   * — the accounts are gone, so the live scan agrees — and presenting that as
   * "nobody reported" is the one error no later read can correct.
   *
   * Absent on the live path, where the accounts themselves are the truth.
   */
  capture?: EpochCapture;
  /**
   * The chain's own tally, when the archive carries it. Exceeds
   * `observationCount` exactly when observations were lost.
   */
  chainObservationsSubmitted?: number;
}

export async function fetchObservationsDirect(
  rpc: any,
  arIOReadSDK: any,
  garProgram: string,
  epochIndex: number,
): Promise<ObservationData> {
  const discBytes = btoa(String.fromCharCode(...OBSERVATION_DISCRIMINATOR));

  const epochBuf = new Uint8Array(8);
  new DataView(epochBuf.buffer).setBigUint64(0, BigInt(epochIndex), true);
  const epochBytes = btoa(String.fromCharCode(...epochBuf));

  const accounts = await rpc
    .getProgramAccounts(garProgram as any, {
      encoding: 'base64',
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: discBytes,
            encoding: 'base64',
          },
        },
        {
          memcmp: {
            offset: 8n,
            bytes: epochBytes,
            encoding: 'base64',
          },
        },
      ],
    })
    .send();

  const reports: Record<string, string> = {};
  const failureSummaries: Record<string, string[]> = {};
  const totalsByObserver: Record<string, GatewayResultTotals> = {};

  let gatewayAddresses: string[] = [];
  try {
    gatewayAddresses = await arIOReadSDK.getRegistryGatewayAddresses();
  } catch {
    // Fall back to empty
  }

  const { getObservationDecoder } = await import('@ar.io/solana-contracts/gar');
  const decoder = getObservationDecoder();

  for (const entry of accounts) {
    try {
      const raw =
        typeof entry.account.data === 'string'
          ? entry.account.data
          : entry.account.data[0];
      const data = Buffer.from(raw, 'base64');

      const d = decoder.decode(new Uint8Array(data));
      const observer = d.observer as string;
      const reportB64 = Buffer.from(d.reportTxId as any).toString('base64');
      const reportTxId = reportB64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      reports[observer] = reportTxId;

      const gatewayResults = new Uint8Array(d.gatewayResults as any);
      const gatewayCount = d.gatewayCount as number;

      // Counted over the full bitmap rather than inside the attribution loop
      // below, which stops at `gatewayAddresses.length` — if the registry
      // lookup came back short or empty, the totals must still be right.
      let passed = 0;
      for (let i = 0; i < gatewayCount; i++) {
        passed += (gatewayResults[i >> 3] >> (i & 7)) & 1;
      }
      if (gatewayCount > 0) {
        totalsByObserver[observer] = {
          passed,
          failed: gatewayCount - passed,
          total: gatewayCount,
          passRate: passed / gatewayCount,
        };
      }

      for (let i = 0; i < gatewayCount && i < gatewayAddresses.length; i++) {
        const byteIdx = Math.floor(i / 8);
        const bitIdx = i % 8;
        const passed = (gatewayResults[byteIdx] >> bitIdx) & 1;
        if (!passed) {
          const gwAddr = gatewayAddresses[i];
          if (!failureSummaries[gwAddr]) {
            failureSummaries[gwAddr] = [];
          }
          failureSummaries[gwAddr].push(observer);
        }
      }
    } catch (e) {
      log.error('[useObservations] deserialize error:', e);
    }
  }

  return {
    reports,
    failureSummaries,
    observationCount: Object.keys(reports).length,
    distinctReportTxIds: new Set(Object.values(reports)).size,
    source: 'rpc',
    // The live accounts are indexed against the registry we just read, so the
    // bits and the addresses come from the same moment.
    hasGatewayAttribution: gatewayAddresses.length > 0,
    totalsByObserver,
  };
}

/**
 * Rebuild an epoch's observations from the published archive.
 *
 * Used for epochs whose `Observation` accounts have already been swept by
 * `close_observation`, where the live read returns nothing at all.
 *
 * `reports` is fully recoverable — it is a plain observer-to-transaction map.
 * `failureSummaries` needs the epoch's registry slot order too, so it is
 * filled only when that document pairs and verifies; otherwise it stays empty
 * with `hasGatewayAttribution: false`. See {@link ObservationData}.
 *
 * Returns a result for a document holding **no** observations, where it once
 * returned null. An empty list is an answer — `capture` says which answer —
 * and discarding it sent the caller to a live scan of accounts
 * `close_observation` has already deleted, which reports zero for an epoch
 * that was observed. Null is now reserved for having no document at all.
 */
export async function fetchObservationsFromArchive(
  epochIndex: number,
  { registryAvailable = true }: { registryAvailable?: boolean } = {},
): Promise<ObservationData | null> {
  // The registry is fetched alongside rather than after: it is the smaller of
  // the two and only useful paired with this exact epoch document, so a second
  // round trip would buy nothing. A miss costs one 404 and falls back to
  // counting, which is what the whole archive path did before it existed.
  const [doc, registry] = await Promise.all([
    fetchAnalyzerDocument<AnalyzerEpochDocument>('epoch', epochIndex),
    registryAvailable
      ? fetchAnalyzerDocument<AnalyzerRegistryDocument>('registry', epochIndex)
      : null,
  ]);
  if (!doc) return null;

  // The portal documents are stamped with a network and program ids and are
  // refused on mismatch; an epoch document carries no such stamp, so the one
  // identity claim it does make is worth checking. A host serving the wrong
  // epoch would otherwise render as this epoch's results.
  // An absent `epochIndex` is refused too: it is the document's only identity
  // claim, and a document that makes none cannot be shown as this epoch.
  if (doc.epochIndex !== epochIndex) {
    log.warn(
      `[useObservations] archive returned epoch ${doc.epochIndex ?? '(none)'} for ${epochIndex} — ignoring`,
    );
    return null;
  }

  const reports: Record<string, string> = {};
  const totalsByObserver: Record<string, GatewayResultTotals> = {};

  for (const observation of doc.observations ?? []) {
    if (!observation?.observer) continue;
    reports[observation.observer] = observation.reportTxId;
    const totals = countGatewayResults(observation);
    if (totals) totalsByObserver[observation.observer] = totals;
  }

  // The registry document must be for the epoch it is being paired with. Like
  // the epoch document above, its own index is the only identity claim it
  // makes, and pairing the wrong one would attribute this epoch's results to
  // another epoch's slot order.
  const pairedRegistry =
    registry && registry.epochIndex === epochIndex ? registry : null;
  const failureSummaries = attributeGatewayResults(doc, pairedRegistry);

  return {
    reports,
    failureSummaries: failureSummaries ?? {},
    // Prefer the publisher's own counts, which describe the epoch as captured;
    // fall back to what the rows we received imply.
    observationCount: doc.observationCount ?? Object.keys(reports).length,
    distinctReportTxIds:
      doc.distinctReportTxIds ?? new Set(Object.values(reports)).size,
    findings: doc.findings,
    source: 'archive',
    hasGatewayAttribution: failureSummaries !== null,
    totalsByObserver,
    capture: doc.capture,
    chainObservationsSubmitted:
      typeof doc.chain?.observationsSubmitted === 'number'
        ? doc.chain.observationsSubmitted
        : undefined,
  };
}

/**
 * Resolve one epoch's observations from whichever source can answer.
 *
 * Shared deliberately. This decision used to be inlined in the hook while
 * `useReports` called `fetchObservationsDirect` straight through — so the
 * Reports page kept asking the chain for accounts `close_observation` had
 * already deleted, and silently listed nothing. Two callers asking the same
 * question must not each decide how to answer it.
 */
export async function resolveEpochObservations({
  rpc,
  arIOReadSDK,
  garProgram,
  epochIndex,
  currentEpochIndex,
  archiveAvailable,
  registryAvailable = true,
}: {
  rpc: any;
  arIOReadSDK: any;
  garProgram?: string;
  epochIndex?: number;
  currentEpochIndex?: number;
  archiveAvailable: boolean;
  registryAvailable?: boolean;
}): Promise<ObservationData> {
  if (!rpc || !arIOReadSDK || !garProgram || epochIndex === undefined) {
    throw new Error('rpc, garProgram, or epoch not available');
  }

  const readLive = () =>
    fetchObservationsDirect(rpc, arIOReadSDK, garProgram, epochIndex);

  // `close_observation` deletes an epoch's Observation accounts once it
  // distributes, so for any epoch behind the current one the live read is a
  // scan that is known to come back empty. Ask the archive first and keep the
  // live read as the fallback, rather than paying for both.
  const isHistorical =
    currentEpochIndex !== undefined && epochIndex < currentEpochIndex;

  if (isHistorical && archiveAvailable) {
    const archived = await fetchObservationsFromArchive(epochIndex, {
      registryAvailable,
    });
    // Rows in hand, or a document that vouches for holding everything: either
    // way the archive has answered and there is nothing for a scan to add.
    if (
      archived &&
      (Object.keys(archived.reports).length > 0 ||
        archived.capture === 'complete')
    ) {
      return archived;
    }

    // Not yet published, or outside the retained window — the accounts may
    // still be there if the epoch has not distributed.
    const live = await readLive();
    if (Object.keys(live.reports).length > 0) return live;

    // Both empty. Prefer the archive: a live read of a swept epoch cannot
    // distinguish "nobody observed" from "we did not capture it", and the
    // archive's `capture` is the only thing that can.
    return archived ?? live;
  }

  const live = await readLive();
  if (Object.keys(live.reports).length > 0) return live;

  // Distributed between rendering and reading: fall through to the archive
  // rather than showing an epoch that suddenly has no observations.
  if (!archiveAvailable) return live;
  return (
    (await fetchObservationsFromArchive(epochIndex, { registryAvailable })) ??
    live
  );
}

const useObservations = (epoch?: EpochData) => {
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const availability = useAnalyzerAvailability();
  // Not every deployment publishes the archive. Without this every historical
  // epoch pays a doomed round trip before falling back to the live read.
  // The manifest lists exactly which epochs are archived, so an epoch outside
  // the retained window costs no request at all.
  const archiveAvailable =
    availability.networkMatches &&
    availability.documents.includes('epochs') &&
    (epoch === undefined ||
      availability.archivedEpochs.includes(epoch.epochIndex));
  // A strict subset: six mainnet epochs are archived without one. Asking for a
  // registry that is not published costs a 404 on every view of that epoch.
  const registryAvailable =
    availability.networkMatches &&
    availability.documents.includes('registry') &&
    epoch !== undefined &&
    availability.registryEpochs.includes(epoch.epochIndex);
  const garProgram = (arIOReadSDK as any)?.garProgram as string | undefined;

  const queryResults = useQuery({
    queryKey: [
      'observations',
      solanaRpcUrl,
      epoch?.epochIndex ?? -1,
      portalApiUrl,
      archiveAvailable,
      registryAvailable,
    ],
    queryFn: () =>
      resolveEpochObservations({
        rpc,
        arIOReadSDK,
        garProgram,
        epochIndex: epoch?.epochIndex,
        currentEpochIndex: currentEpoch?.epochIndex,
        archiveAvailable,
        registryAvailable,
      }),
    enabled: !!rpc && !!arIOReadSDK && !!garProgram && !!epoch,
  });

  return queryResults;
};

export default useObservations;
