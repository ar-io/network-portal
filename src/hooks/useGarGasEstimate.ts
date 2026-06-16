import {
  GarGasWorkflow,
  GasEstimate,
  SolanaARIOReadable,
} from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

export type GarGasEstimateParams = {
  workflow: GarGasWorkflow;
  /** Acting wallet (operator or delegator) — enables live account checks. */
  fromAddress?: string;
  /** Target gateway for delegate/redelegate delegation-exists checks. */
  gatewayAddress?: string;
  /** Vault id for withdrawal-closing workflows (exact reclaim quote). */
  vaultId?: string | number;
  /** Expedited decrease: a second transaction closes the vault again. */
  instant?: boolean;
};

/**
 * Quote the Solana network cost (transaction fees + rent for accounts the
 * workflow creates, and rent reclaimed by closes) for a GAR action. Pairs
 * with `useBalances().sol` to gate confirm buttons on holding enough SOL.
 */
const useGarGasEstimate = (params?: GarGasEstimateParams) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  return useQuery<GasEstimate>({
    queryKey: ['garGasEstimate', params, solanaRpcUrl],
    queryFn: async () => {
      if (!arIOReadSDK || !params) {
        throw new Error('arIOReadSDK is not initialized');
      }
      return (arIOReadSDK as SolanaARIOReadable).getGarGasEstimate(params);
    },
    staleTime: 60 * 1000,
    enabled:
      !!params &&
      !!arIOReadSDK &&
      'getGarGasEstimate' in (arIOReadSDK as object),
  });
};

export default useGarGasEstimate;
