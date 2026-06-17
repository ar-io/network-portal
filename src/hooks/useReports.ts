import { Gateway } from '@ar.io/sdk/web';
import { useGlobalState, useSettings } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import arweaveGraphql from 'arweave-graphql';
import useEpochs from './useEpochs';
import { fetchObservationsDirect } from './useObservations';

export interface ReportTransactionData {
  txid: string;
  failedGateways: number;
  epochNumber: number;
  timestamp: number;
  size: number;
  version: string;
}

const useReports = (ownerId?: string, gateway?: Gateway) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const arweaveGqlUrl = useSettings((state) => state.arweaveGqlUrl);
  const garProgram = (arIOReadSDK as any)?.garProgram as string | undefined;

  const observerAddress = gateway?.observerAddress;
  const gatewayStart = gateway?.startTimestamp;

  const { data: epochs } = useEpochs();

  const queryResults = useQuery({
    queryKey: ['reports', ownerId, solanaRpcUrl, arweaveGqlUrl],
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

      let data: ReportTransactionData[] = [];

      // Fetch observations for each epoch using direct base64 RPC calls
      const reportTransactionData: Record<
        string,
        { txid: string; failedGateways: number }
      > = {};

      for (const epoch of epochs) {
        if (!epoch) continue;

        const observations = await fetchObservationsDirect(
          rpc,
          arIOReadSDK,
          garProgram,
          epoch.epochIndex,
        );
        const txid = observations.reports[observerAddress];

        if (!txid) continue;

        const failedGateways = Object.values(
          observations.failureSummaries,
        ).reduce((acc, summary) => {
          return summary.includes(observerAddress) ? acc + 1 : acc;
        }, 0);

        reportTransactionData[txid] = { txid, failedGateways };
      }

      const keys = Object.keys(reportTransactionData);

      if (keys.length > 0) {
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
