import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import useEpochs from './useEpochs';

export type GatewayEpochCount = {
  epochIndex: number;
  totalEligibleGateways: number;
};

const useGatewaysPerEpoch = () => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const { data: epochs } = useEpochs();

  const res = useQuery<Array<GatewayEpochCount>>({
    queryKey: ['gatewaysPerEpoch', epochs, arioReadSDK],
    queryFn: () => {
      if (!arioReadSDK || !epochs) {
        throw new Error('arIOReadSDK not initialized or epochs not available');
      }

      return epochs
        .filter((epoch) => epoch !== undefined)
        .sort((a, b) => a!.epochIndex - b!.epochIndex)
        .map((epoch) => {
          if (!epoch) throw new Error('Epoch not available');
          return {
            epochIndex: epoch.epochIndex,
            totalEligibleGateways: epoch.distributions.totalEligibleGateways,
          };
        });
    },
    enabled: !!arioReadSDK && !!epochs,
  });
  return res;
};
export default useGatewaysPerEpoch;
