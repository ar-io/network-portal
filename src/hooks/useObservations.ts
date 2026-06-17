import { EpochData } from '@ar.io/sdk/web';
import { log } from '@src/constants';
import { useGlobalState } from '@src/store';
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

interface ObservationData {
  reports: Record<string, string>;
  failureSummaries: Record<string, string[]>;
}

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

  return { reports, failureSummaries };
}

const useObservations = (epoch?: EpochData) => {
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
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
