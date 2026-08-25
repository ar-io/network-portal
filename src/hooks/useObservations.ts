import { EpochData } from '@ar.io/sdk/web';
import { log } from '@src/constants';
import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useGlobalState, useSettings } from '@src/store';
import {
  type AnalyzerEpochDocument,
  type AnalyzerFinding,
  type GatewayResultTotals,
  countGatewayResults,
  fetchAnalyzerDocument,
} from '@src/utils/analyzerApi';
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
   * epoch, and the archive publishes only a digest of that ordering, not the
   * ordering itself. Mapping historical bits against today's registry would
   * name the wrong gateways, so attribution is refused instead.
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
 * `failureSummaries` is not, and is deliberately left empty with
 * `hasGatewayAttribution: false`; see {@link ObservationData}.
 */
export async function fetchObservationsFromArchive(
  epochIndex: number,
): Promise<ObservationData | null> {
  const doc = await fetchAnalyzerDocument<AnalyzerEpochDocument>(
    'epoch',
    epochIndex,
  );
  if (!doc?.observations?.length) return null;

  // The portal documents are stamped with a network and program ids and are
  // refused on mismatch; an epoch document carries no such stamp, so the one
  // identity claim it does make is worth checking. A host serving the wrong
  // epoch would otherwise render as this epoch's results.
  if (doc.epochIndex !== undefined && doc.epochIndex !== epochIndex) {
    log.warn(
      `[useObservations] archive returned epoch ${doc.epochIndex} for ${epochIndex} — ignoring`,
    );
    return null;
  }

  const reports: Record<string, string> = {};
  const totalsByObserver: Record<string, GatewayResultTotals> = {};

  for (const observation of doc.observations) {
    if (!observation?.observer) continue;
    reports[observation.observer] = observation.reportTxId;
    const totals = countGatewayResults(observation);
    if (totals) totalsByObserver[observation.observer] = totals;
  }

  return {
    reports,
    failureSummaries: {},
    // Prefer the publisher's own counts, which describe the epoch as captured;
    // fall back to what the rows we received imply.
    observationCount: doc.observationCount ?? Object.keys(reports).length,
    distinctReportTxIds:
      doc.distinctReportTxIds ?? new Set(Object.values(reports)).size,
    findings: doc.findings,
    source: 'archive',
    hasGatewayAttribution: false,
    totalsByObserver,
  };
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
  const garProgram = (arIOReadSDK as any)?.garProgram as string | undefined;

  const queryResults = useQuery({
    queryKey: [
      'observations',
      solanaRpcUrl,
      epoch?.epochIndex ?? -1,
      portalApiUrl,
      archiveAvailable,
    ],
    queryFn: async (): Promise<ObservationData | null> => {
      if (!rpc || !arIOReadSDK || !garProgram || !epoch) {
        throw new Error('rpc, garProgram, or epoch not available');
      }

      const readLive = () =>
        fetchObservationsDirect(rpc, arIOReadSDK, garProgram, epoch.epochIndex);

      // `close_observation` deletes an epoch's Observation accounts once it
      // distributes, so for any epoch behind the current one the live read is
      // a scan that is known to come back empty. Ask the archive first and
      // keep the live read as the fallback, rather than paying for both.
      const isHistorical =
        currentEpoch !== undefined &&
        epoch.epochIndex < currentEpoch.epochIndex;

      if (isHistorical && archiveAvailable) {
        const archived = await fetchObservationsFromArchive(epoch.epochIndex);
        if (archived) return archived;
        // Not yet published, or outside the retained window — the accounts may
        // still be there if the epoch has not distributed.
        return readLive();
      }

      const live = await readLive();
      if (Object.keys(live.reports).length > 0) return live;

      // Distributed between rendering and reading: fall through to the archive
      // rather than showing an epoch that suddenly has no observations.
      if (!archiveAvailable) return live;
      return (await fetchObservationsFromArchive(epoch.epochIndex)) ?? live;
    },
    enabled: !!rpc && !!arIOReadSDK && !!garProgram && !!epoch,
  });

  return queryResults;
};

export default useObservations;
