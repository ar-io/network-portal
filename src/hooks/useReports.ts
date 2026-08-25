import { Gateway } from '@ar.io/sdk/web';
import { log } from '@src/constants';
import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useGlobalState, useSettings } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import useEpochs from './useEpochs';
import { resolveEpochObservations } from './useObservations';

export interface ReportTransactionData {
  txid: string;
  failedGateways: number;
  epochNumber: number;
  timestamp: number;
  size: number;
  version: string;
  /**
   * True when the transaction is known from the observation but the Arweave
   * indexer did not return it, so size/version/timestamp are unknown.
   */
  metadataUnavailable?: boolean;
}

/**
 * How many epochs are resolved at once.
 *
 * Each one is either a small cached JSON read or a memcmp-filtered account
 * read, but there are as many as there are epochs on the selector. Serially
 * they stack into a visible wait; unbounded they arrive as a burst against one
 * endpoint. Four keeps the page responsive without becoming the reason an RPC
 * provider starts refusing.
 */
const EPOCH_CONCURRENCY = 4;

/**
 * The fields this list needs, asked for by hand.
 *
 * `arweave-graphql`'s generated `getTransactions` declares `$block:
 * BlockFilter`, a type the configured endpoint's schema does not define — it
 * has `RangeFilter`. Every call therefore failed validation before reaching
 * the data:
 *
 *   Unknown type "BlockFilter". Did you mean "BlockEdge", "RangeFilter", …?
 *
 * That is why this table's Generated At, Size and Version were never
 * populated. Asking only for what is rendered sidesteps the mismatch, and
 * makes the query independent of a client whose schema assumptions can drift
 * from whichever indexer a user points at in Settings.
 */
const TRANSACTIONS_QUERY = `query($ids: [ID!]!) {
  transactions(ids: $ids, first: 100) {
    edges { node { id data { size } tags { name value } } }
  }
}`;

interface TransactionNode {
  id: string;
  data: { size: string };
  tags: Array<{ name: string; value: string }>;
}

async function fetchTransactionMetadata(
  endpoint: string,
  ids: string[],
): Promise<TransactionNode[]> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: TRANSACTIONS_QUERY, variables: { ids } }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const body = (await response.json()) as {
    data?: { transactions?: { edges?: Array<{ node: TransactionNode }> } };
    errors?: Array<{ message: string }>;
  };

  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join('; '));
  }

  return (body.data?.transactions?.edges ?? []).map((edge) => edge.node);
}

/**
 * Arweave GraphQL caps `transactions(ids:)` at nine ids per query, and answers
 * a longer list with HTTP 400 rather than a truncated result:
 *
 *   "Too many ids in 'ids' argument: 11 provided, maximum 9 allowed."
 *
 * Asking for every report at once therefore failed outright for any gateway
 * with ten or more of them — which is most of them, since the list spans every
 * epoch on the selector. Measured against goldsky: 9 ids returns 9, 10 returns
 * 400. Chunked at this size, coverage across epochs 518-522 is 71 of 72.
 */
export const GQL_MAX_IDS_PER_QUERY = 9;

/** Chunks in flight at once. The cap above turns one query into several. */
const GQL_CONCURRENCY = 3;

const GQL_RETRY_DELAYS_MS = [500, 1500];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Run `worker` over `items`, at most `limit` in flight. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (true) {
        const index = next++;
        if (index >= items.length) return;
        results[index] = await worker(items[index]);
      }
    },
  );

  await Promise.all(runners);
  return results;
}

const useReports = (ownerId?: string, gateway?: Gateway) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const arweaveGqlUrl = useSettings((state) => state.arweaveGqlUrl);
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const garProgram = (arIOReadSDK as any)?.garProgram as string | undefined;

  const observerAddress = gateway?.observerAddress;
  const gatewayStart = gateway?.startTimestamp;

  const { data: epochs } = useEpochs();
  const availability = useAnalyzerAvailability();
  const archiveAvailable =
    availability.networkMatches && availability.documents.includes('epochs');

  const queryResults = useQuery({
    queryKey: [
      'reports',
      ownerId,
      solanaRpcUrl,
      arweaveGqlUrl,
      portalApiUrl,
      archiveAvailable,
    ],
    queryFn: async () => {
      if (
        !rpc ||
        !arIOReadSDK ||
        !garProgram ||
        epochs === undefined ||
        !gatewayStart ||
        !observerAddress
      ) {
        throw new Error(
          'arIOReadSDK, startEpoch, ownerId, observerAddress, or gatewayStart not available',
        );
      }

      const indexes = epochs
        .filter((epoch) => epoch !== undefined)
        .map((epoch) => epoch.epochIndex);

      // Resolved through the shared resolver so a past epoch is read from the
      // published archive. Reading the chain directly returns nothing once
      // `close_observation` has swept the accounts, which is why this page was
      // emptying out an epoch at a time.
      const perEpoch = await mapWithConcurrency(
        indexes,
        EPOCH_CONCURRENCY,
        async (epochIndex) => {
          try {
            const observations = await resolveEpochObservations({
              rpc,
              arIOReadSDK,
              garProgram,
              epochIndex,
              currentEpochIndex: currentEpoch?.epochIndex,
              archiveAvailable,
            });
            return { epochIndex, observations };
          } catch (error) {
            // One unreachable epoch must not empty the whole list: keep every
            // epoch that did resolve and carry on.
            log.warn(
              `[useReports] epoch ${epochIndex} could not be read: ${error}`,
            );
            return { epochIndex, observations: undefined };
          }
        },
      );

      const found = new Map<
        string,
        { txid: string; failedGateways: number; epochNumber: number }
      >();

      for (const { epochIndex, observations } of perEpoch) {
        const txid = observations?.reports[observerAddress];
        if (!observations || !txid) continue;

        // Read from this observer's own results totals, which both the live
        // and archived paths carry. Counting `failureSummaries` instead would
        // report zero for every archived epoch, where results cannot be
        // attributed to individual gateways.
        const failedGateways =
          observations.totalsByObserver[observerAddress]?.failed ??
          Object.values(observations.failureSummaries).reduce(
            (acc, summary) =>
              summary.includes(observerAddress) ? acc + 1 : acc,
            0,
          );

        found.set(txid, { txid, failedGateways, epochNumber: epochIndex });
      }

      const keys = [...found.keys()];
      if (keys.length === 0) return [] as ReportTransactionData[];

      const chunks: string[][] = [];
      for (let i = 0; i < keys.length; i += GQL_MAX_IDS_PER_QUERY) {
        chunks.push(keys.slice(i, i + GQL_MAX_IDS_PER_QUERY));
      }

      const chunkResults = await mapWithConcurrency(
        chunks,
        GQL_CONCURRENCY,
        async (ids): Promise<TransactionNode[]> => {
          for (let attempt = 0; ; attempt++) {
            try {
              return await fetchTransactionMetadata(arweaveGqlUrl, ids);
            } catch (error) {
              const delay = GQL_RETRY_DELAYS_MS[attempt];
              if (delay === undefined) {
                // One failed chunk costs those rows their size and version,
                // not the whole page — they are still listed below.
                log.warn(
                  `[useReports] metadata unavailable for ${ids.length} transaction(s): ${error}`,
                );
                return [];
              }
              await sleep(delay);
            }
          }
        },
      );

      const nodes: TransactionNode[] = chunkResults.flat();

      const tagOf = (
        tags: Array<{ name: string; value: string }>,
        name: string,
      ) => tags.find((tag) => tag.name === name)?.value;

      const withMetadata = new Set<string>();
      const data: ReportTransactionData[] = nodes.flatMap((node) => {
        const entry = found.get(node.id);
        if (!entry) return [];
        withMetadata.add(node.id);

        const tags = node.tags;
        return [
          {
            txid: entry.txid,
            failedGateways: entry.failedGateways,
            timestamp: Number.parseInt(
              tagOf(tags, 'AR-IO-Epoch-Start-Timestamp') || '0',
            ),
            epochNumber: Number.parseInt(
              tagOf(tags, 'AR-IO-Epoch-Index') || String(entry.epochNumber),
            ),
            size: Number.parseInt(node.data.size),
            version: tagOf(tags, 'AR-IO-Observer-Report-Version') || '',
          },
        ];
      });

      // A transaction the indexer did not return is still a report this
      // gateway submitted, and its id is what opens it. Listing it without its
      // size and version beats dropping the row and implying it never existed.
      for (const [txid, entry] of found) {
        if (withMetadata.has(txid)) continue;
        data.push({
          txid,
          failedGateways: entry.failedGateways,
          epochNumber: entry.epochNumber,
          timestamp: 0,
          size: 0,
          version: '',
          metadataUnavailable: true,
        });
      }

      return data;
    },
    enabled:
      !!arweaveGqlUrl &&
      !!rpc &&
      !!arIOReadSDK &&
      !!garProgram &&
      !!epochs &&
      gatewayStart !== undefined &&
      !!observerAddress,
  });

  return queryResults;
};

export default useReports;
