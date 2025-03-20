import { AoGateway } from '@ar.io/sdk/web';
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
  const arweaveGqlUrl = useGlobalState((state) => state.arweaveGqlUrl);

  const observerAddress = gateway?.observerAddress;
  const gatewayStart = gateway?.startTimestamp;

  const { data: epochs } = useEpochs();

  const queryResults = useQuery({
    queryKey: ['reports', ownerId, arIOReadSDK, arweaveGqlUrl],
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

      const reportTransactionData = epochs.reduce(
        (acc, epoch) => {
          if (epoch) {
            const observations = epoch.observations;
            const txid = observations.reports[observerAddress];

            if(!txid) {
              // did not submit a report this epoch
              return acc;
            }

            const failedGateways = Object.values(
              observations.failureSummaries,
            ).reduce((acc, summary) => {
              return summary.includes(observerAddress) ? acc + 1 : acc;
            }, 0);

            const record = { txid, failedGateways };

            return { ...acc, [txid]: record };
          } else {
            return acc;
          }
        },
        {} as Record<string, { txid: string; failedGateways: number }>,
      );

      const keys = Object.keys(reportTransactionData);

      if (keys.length > 0) {
        // Epoch pruning on contract means we have at most 14 reports. Retrieve as a batch here.
        const transactions = await arweaveGraphql(
          arweaveGqlUrl,
        ).getTransactions({
          ids: keys,
        });

        const recordData = transactions.transactions.edges.map(
          (transaction) => {
            const txData = reportTransactionData[transaction.node.id];

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
    enabled:
      !!arweaveGqlUrl &&
      !!arIOReadSDK &&
      !!epochs &&
      gatewayStart !== undefined &&
      !!observerAddress,
  });

  return queryResults;
};

export default useReports;
