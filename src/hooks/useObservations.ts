import { EpochData } from '@ar.io/sdk/web';
import { log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

/**
 * Observation discriminator from @ar.io/solana-contracts/gar.
 * Hardcoded here so the portal can make its own getProgramAccounts call
 * with base64 encoding, bypassing the SDK's base58 memcmp filters which
 * silently return empty in browser-bundled environments.
 */
const OBSERVATION_DISCRIMINATOR = new Uint8Array([
  0x6d, 0xbe, 0xbe, 0x5f, 0x1c, 0xac, 0xf3, 0x4a,
]);

interface ObservationData {
  reports: Record<string, string>;
  failureSummaries: Record<string, string[]>;
}

/**
 * Fetch observations for an epoch directly via getProgramAccounts with
 * base64-encoded memcmp filters, then deserialize using the SDK's own
 * deserializeObservation. The SDK's getObservations uses base58 encoding
 * for memcmp filters which breaks in browser environments when multiple
 * filters are combined.
 */
async function fetchObservationsDirect(
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

  // Fetch gateway registry address list for bitmap→address mapping
  let gatewayAddresses: string[] = [];
  try {
    gatewayAddresses = await arIOReadSDK.getRegistryGatewayAddresses();
  } catch {
    // Fall back to empty — failure summaries won't be populated
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
      // d.observer is already a decoded Address string
      const observer = d.observer as string;
      // base64url from raw bytes without Buffer.toString('base64url')
      const reportB64 = Buffer.from(d.reportTxId as any).toString('base64');
      const reportTxId = reportB64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      reports[observer] = reportTxId;

      // Parse gateway_results bitmap: bit set (1) = passed, clear (0) = failed
      const gatewayResults = new Uint8Array(d.gatewayResults as any);
      const gatewayCount = d.gatewayCount as number;
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
      console.error('[useObservations] deserialize error:', e);
    }
  }

  log.info(
    `[useObservations] epoch=${epochIndex}: ${Object.keys(reports).length} reports via direct getProgramAccounts`,
  );

  return { reports, failureSummaries };
}

const useObservations = (epoch?: EpochData) => {
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  // Read the GAR program ID from the SDK instance to stay in sync with settings
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const garProgram = (arIOReadSDK as any)?.garProgram as string | undefined;

  const queryResults = useQuery({
    queryKey: ['observations', solanaRpcUrl, epoch?.epochIndex ?? -1],
    queryFn: () => {
      if (!rpc || !arIOReadSDK || !garProgram || !epoch) {
        throw new Error('rpc, garProgram, or epoch not available');
      }
      return fetchObservationsDirect(
        rpc,
        arIOReadSDK,
        garProgram,
        epoch.epochIndex,
      );
    },
    enabled: !!rpc && !!arIOReadSDK && !!garProgram && !!epoch,
  });

  return queryResults;
};

export default useObservations;
