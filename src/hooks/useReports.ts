import { AoGateway } from '@ar.io/sdk';
import { DEFAULT_ARWEAVE_HOST } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import arweaveGraphql from 'arweave-graphql';
import useEpochs from './useEpochs';

export interface ReportTransactionData {
  txid: string;
  failedGateways: number;
  epochNumber: number;
  timestamp: number;
  size: number;
  version: string;
}

const useReports = (ownerId?: string, gateway?: AoGateway) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const observerAddress = gateway?.observerAddress;
  const gatewayStart = gateway?.startTimestamp;

  const { data: epochs } = useEpochs();


  const queryResults = useQuery({
    queryKey: ['reports', ownerId],
    queryFn: async () => {
      if (
        !arIOReadSDK ||
        epochs === undefined ||
        !gatewayStart ||
        !observerAddress
      ) {
        throw new Error(
          'arIOReadSDK, startEpoch, ownerId, observerAddress, or gatewayStart not available',
        );
      }

      let data: ReportTransactionData[] = [];

      const reportTransactionData = await Promise.all(
        epochs.map((epoch) =>
        {
          const observations = epoch.observations;
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

        })
      );

      const filteredTransactionData = reportTransactionData.reduce(
        (acc, txData) =>
          txData !== undefined ? { ...acc, [txData.txid]: txData } : acc,
        {} as Record<string, { txid: string; failedGateways: number }>,
      );

      const keys = Object.keys(filteredTransactionData);

      if (keys.length > 0) {
        const transactions = await arweaveGraphql(
          `https://${DEFAULT_ARWEAVE_HOST}/graphql`,
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
              epochNumber: parseInt(
                tags.find((tag) => tag.name === 'AR-IO-Epoch-Index')?.value ||
                  '0',
              ),
              size: parseInt(transaction.node.data.size),
              version:
                tags.find((tag) => tag.name === 'AR-IO-Observer-Report-Version')
                  ?.value || '',
            };
          },
        );

        data = data.concat(recordData);
      }

      return data;
    },
  });

  return queryResults;
};

export default useReports;
