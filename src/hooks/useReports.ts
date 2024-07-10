import { AoGateway } from '@ar.io/sdk';
import { DEFAULT_ARWEAVE_HOST } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useInfiniteQuery } from '@tanstack/react-query';
import arweaveGraphql from 'arweave-graphql';

export interface ReportTransactionData {
  txid: string;
  failedGateways: number;
  timestamp: number;
  size: number;
  version: string;
  // results: string
}

const useReports = (ownerId?: string, gateway?: AoGateway) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const startEpoch = useGlobalState((state) => state.currentEpoch);

  const observerAddress = gateway?.observerAddress;
  const gatewayStart = gateway?.startTimestamp;

  const queryResults = useInfiniteQuery({
    queryKey: ['reports', ownerId],
    queryFn: async ({ pageParam }) => {
      console.log("Epoch index to start page load from: ", pageParam);
      if (
        !arIOReadSDK ||
        !startEpoch ||
        !gatewayStart ||
        !observerAddress ||
        !pageParam
      ) {
        throw new Error(
          'arIOReadSDK, startEpoch, ownerId, observerAddress, or gatewayStart not available',
        );
      }

      let epochIndexToFetch = pageParam;

      let data: ReportTransactionData[] = [];
      let completed = false;

      const windowSize = 10;

      // 10 epochs at a time and at least 10 data points, up until gateway start time
      while (data.length < windowSize) {
        // load ten epochs at a time
        const batchedEpochIndicies = Array.from(
          { length: windowSize },
          (_, i) => epochIndexToFetch - i,
        );
        epochIndexToFetch -= windowSize;

        const epochs = await Promise.all(
          batchedEpochIndicies.map((epochIndex) =>
            arIOReadSDK.getEpoch({ epochIndex }),
          ),
        );

        const filtered = epochs.filter(
          (epoch) => epoch.endTimestamp >= gatewayStart,
        );

        const reportTransactionData = await Promise.all(
          filtered.map((epoch) =>
            arIOReadSDK.getObservations(epoch).then((observations) => {
              const txid = observations.reports[observerAddress];

              return txid
                ? {
                    txid,
                    failedGateways: Object.values(
                      observations.failureSummaries,
                    ).reduce((acc, summary) => {
                      return summary.includes(observerAddress) ? acc + 1 : acc;
                    }, 0),
                  }
                : undefined;
            }),
          ),
        );

        const filteredTransactionData = reportTransactionData.reduce(
          (acc, txData) =>
            txData !== undefined ? { ...acc, [txData.txid]: txData } : acc,
          {} as Record<string, { txid: string; failedGateways: number }>,
        );

        const keys = Object.keys(filteredTransactionData);

        if (keys.length > 0) {
          const transactions = await arweaveGraphql(
            `${DEFAULT_ARWEAVE_HOST}/graphql`,
          ).getTransactions({
            ids: keys,
          });

          const recordData = transactions.transactions.edges.map(
            (transaction) => {
              const txData = filteredTransactionData[transaction.node.id];

              const tags = transaction.node.tags;

              return {
                txid: txData.txid,
                failedGateways: txData.failedGateways,
                timestamp: parseInt(
                  tags.find((tag) => tag.name === 'AR-IO-Epoch-Start-Timestamp')
                    ?.value || '0',
                ),
                size: parseInt(transaction.node.data.size),
                version:
                  tags.find((tag) => tag.name === 'App-Version')?.value || '',
              };
            },
          );

          data = data.concat(recordData);
        }

        if (filtered.length < windowSize) {
          completed = true;
          break;
        }
      }
      // setEpochIndex(epochIndexToFetch);

      return {
        data,
        nextEpochIndex: completed ? undefined : epochIndexToFetch,
      };
    },
    initialPageParam: startEpoch?.epochIndex,
    getNextPageParam: (lastPage) => lastPage?.nextEpochIndex,
  });

  return queryResults;
};

export default useReports;
