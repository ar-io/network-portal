import { ARWEAVE_TX_REGEX, IOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { GatewaySettingsUpdate } from '@src/store/persistent';
import { useQuery } from '@tanstack/react-query';
import usePendingUpdates from './usePendingGatewayUpdates';

const useGateway = ({
  ownerWalletAddress,
}: {
  ownerWalletAddress?: string;
}) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const { pendingGatewayUpdates } = usePendingUpdates();

  const queryResults = useQuery({
    queryKey: ['gateway', ownerWalletAddress || '', arIOReadSDK],
    queryFn: () => {
      if (ownerWalletAddress === undefined) {
        return Promise.reject(
          new Error('Error: Gateway owner wallet address is required'),
        );
      }

      if (!ARWEAVE_TX_REGEX.test(ownerWalletAddress)) {
        return Promise.reject(
          new Error(
            `Error: Unable to find gateway. '${ownerWalletAddress}' is not a valid Arweave wallet address.`,
          ),
        );
      }

      if (arIOReadSDK && ownerWalletAddress) {
        return arIOReadSDK.getGateway({ address: ownerWalletAddress });
      }
    },
  });

  if (queryResults.isFetched && queryResults.data && ownerWalletAddress) {
    const data = { ...queryResults.data };
    const { operatorStakeUpdates, gatewaySettingsUpdates } =
      pendingGatewayUpdates;

    if (operatorStakeUpdates) {
      operatorStakeUpdates.forEach((update) => {
        data.operatorStake =
          update.type === 'increase'
            ? data.operatorStake + new IOToken(update.qty).toMIO().valueOf() 
            : data.operatorStake - new IOToken(update.qty).toMIO().valueOf();
      });
    }
    if (gatewaySettingsUpdates) {
      const settings = data.settings;

      gatewaySettingsUpdates.forEach((update: GatewaySettingsUpdate) => {
        const params = update.params;
        settings.allowDelegatedStaking =
          params.allowDelegatedStaking ?? settings.allowDelegatedStaking;
        settings.autoStake = params.autoStake ?? settings.autoStake;
        settings.delegateRewardShareRatio =
          params.delegateRewardShareRatio ?? settings.delegateRewardShareRatio;
        settings.fqdn = params.fqdn ?? settings.fqdn;
        settings.label = params.label ?? settings.label;
        settings.minDelegatedStake = params.minDelegatedStake
          ? params.minDelegatedStake.valueOf() 
          : settings.minDelegatedStake;
        settings.note = params.note ?? settings.note;
        settings.port = params.port ?? settings.port;
        settings.protocol = params.protocol ?? settings.protocol;
        settings.properties = params.properties ?? settings.properties;
      });
    }

    return { ...queryResults, data };
  }

  return queryResults;
};

export default useGateway;
