import { downloadReport } from '@src/hooks/useReport';
import {
  type AssessmentOutcome,
  summarizeGatewayAssessment,
} from '@src/utils/gatewayAssessment';
import { useQuery } from '@tanstack/react-query';
import { strFromU8 } from 'fflate';

/** One observer's verdict on this gateway, or why we could not read it. */
export type ObserverVerdict = {
  observer: string;
  reportTxId: string;
  /** Undefined when the report could not be read, or omits this gateway. */
  outcome?: AssessmentOutcome;
  /** Set when the report itself could not be fetched or parsed. */
  unreadable?: string;
  /** Set when the report was read but does not mention this gateway. */
  notAssessed?: boolean;
};

export type GatewayObservationReports = {
  verdicts: ObserverVerdict[];
  /** Observers whose report was read, whatever it said. */
  readCount: number;
  /** Observers whose report could not be read at all. */
  unreadableCount: number;
  failedCount: number;
  passedCount: number;
};

/**
 * Reports are large — roughly half a megabyte each — and the gateway serving
 * them rate-limits hard. Measured against a real epoch: four at a time yielded
 * ONE readable report out of thirty-six, while the same requests made one at a
 * time returned 200 every time. The limit is the gateway's patience, not the
 * bandwidth, so this stays low and retries what it drops.
 */
const REPORT_CONCURRENCY = 2;

/** One retry, after a pause, for a report the gateway declined to serve. */
const RETRY_DELAY_MS = 1_200;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  run: (item: T) => Promise<R>,
  signal?: AbortSignal,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      for (;;) {
        // Switching epochs abandons this queue rather than leaving it racing
        // the new one for the gateway's rate limit.
        signal?.throwIfAborted();
        const index = next++;
        if (index >= items.length) return;
        results[index] = await run(items[index]);
      }
    },
  );
  await Promise.all(workers);
  return results;
};

/**
 * What every observer of an epoch said about one gateway.
 *
 * The panel that shows "observations of this gateway" reads the on-chain
 * bitmap, which a closed epoch cannot attribute: its bits index the registry
 * order for that epoch, and only a digest of that ordering is published. The
 * reports those same observers uploaded are keyed by FQDN and carry the
 * reason, so they answer the question the bitmap cannot.
 *
 * **Opt-in**, because answering costs megabytes. Observers routinely submit
 * the same report transaction — 36 observations over 19 distinct reports in a
 * recent epoch — so each one is fetched once and its verdict applied to every
 * observer that submitted it.
 *
 * Partial results are reported as partial. A report that will not load is
 * counted, never silently dropped, so the panel can say "read 12 of 19" rather
 * than implying it read them all.
 */
const useGatewayObservationReports = ({
  epochIndex,
  fqdn,
  reports,
  enabled,
}: {
  epochIndex?: number;
  fqdn?: string;
  /** Observer address → report transaction id, from `useObservations`. */
  reports?: Record<string, string>;
  enabled: boolean;
}) =>
  useQuery<GatewayObservationReports>({
    queryKey: ['gatewayObservationReports', epochIndex, fqdn],
    enabled: enabled && !!fqdn && !!reports && Object.keys(reports).length > 0,
    // Reports are immutable once uploaded, so never refetch within a session.
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60 * 1000,
    queryFn: async ({ signal }) => {
      if (!fqdn || !reports) {
        throw new Error('fqdn and reports are required');
      }

      const observersByTx = new Map<string, string[]>();
      for (const [observer, txId] of Object.entries(reports)) {
        const existing = observersByTx.get(txId);
        if (existing) existing.push(observer);
        else observersByTx.set(txId, [observer]);
      }

      const txIds = [...observersByTx.keys()];
      const perTx = await mapWithConcurrency(
        txIds,
        REPORT_CONCURRENCY,
        async (txId) => {
          const read = async () => {
            // `retry: 0` because the single retry below is this hook's own.
            const bytes = await downloadReport(txId, { signal, retry: 0 });
            const parsed = JSON.parse(strFromU8(bytes)) as {
              gatewayAssessments?: Record<string, unknown>;
            };
            const entry = parsed.gatewayAssessments?.[fqdn];
            return entry === undefined
              ? { txId, notAssessed: true as const }
              : { txId, outcome: summarizeGatewayAssessment(entry) };
          };

          try {
            return await read();
          } catch (first) {
            // A cancelled read is not a refused one: let it end the sweep.
            if (signal.aborted) throw first;
            // A refusal is usually the rate limit rather than a missing
            // report, so pause and ask once more before giving up on it.
            await sleep(RETRY_DELAY_MS);
            signal.throwIfAborted();
            try {
              return await read();
            } catch (error) {
              if (signal.aborted) throw error;
              return {
                txId,
                unreadable:
                  error instanceof Error ? error.message : String(error),
              };
            }
          }
        },
        signal,
      );

      const verdicts: ObserverVerdict[] = [];
      for (const result of perTx) {
        for (const observer of observersByTx.get(result.txId) ?? []) {
          verdicts.push({
            observer,
            reportTxId: result.txId,
            ...('outcome' in result ? { outcome: result.outcome } : {}),
            ...('unreadable' in result
              ? { unreadable: result.unreadable }
              : {}),
            ...('notAssessed' in result ? { notAssessed: true } : {}),
          });
        }
      }

      verdicts.sort((a, b) => {
        const rank = (v: ObserverVerdict) =>
          v.outcome?.pass === false ? 0 : v.outcome?.pass ? 1 : 2;
        return rank(a) - rank(b) || a.observer.localeCompare(b.observer);
      });

      return {
        verdicts,
        readCount: verdicts.filter((v) => v.unreadable === undefined).length,
        unreadableCount: verdicts.filter((v) => v.unreadable !== undefined)
          .length,
        failedCount: verdicts.filter((v) => v.outcome?.pass === false).length,
        passedCount: verdicts.filter((v) => v.outcome?.pass === true).length,
      };
    },
  });

export default useGatewayObservationReports;
