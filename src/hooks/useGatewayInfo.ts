import { mIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { formatDateTime, formatWalletAddress, formatWithCommas } from '@src/utils';
import useGateway from './useGateway';

export enum GatewayStatus {
  LOADING,
  FOUND,
  NOT_FOUND,
}

export const useGatewayInfo = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const { isLoading, data: gateway } = useGateway({
    ownerWalletAddress: walletAddress?.toString(),
  });

  let gatewayInfo: Array<[string, string | number]>;

  if (gateway) {
    gatewayInfo = [
      ['Label', gateway.settings.label],
      [
        'Address',
        `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`,
      ],
      ['Observer Wallet', formatWalletAddress(gateway.observerAddress)],
      ['Joined at', formatDateTime(new Date(gateway.startTimestamp))],
      [
        `Stake (${ticker})`,
        formatWithCommas(new mIOToken(gateway.operatorStake).toIO().valueOf()),
      ],
      ['Status', gateway.status],
      ['Reward Ratio', gateway.settings.delegateRewardShareRatio],
    ];
  } else {
    gatewayInfo = [];
  }

  const gatewayStatus = gateway
    ? GatewayStatus.FOUND
    : isLoading
      ? GatewayStatus.LOADING
      : GatewayStatus.NOT_FOUND;

  return { gatewayInfo, gateway, gatewayStatus };
};
