import { mIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { formatWalletAddress, formatWithCommas } from '@src/utils';

export enum GatewayStatus {
  PENDING,
  FOUND,
  NOT_FOUND,
}

export const useGatewayInfo = () => {
  const gateway = useGlobalState((state) => state.gateway);

  let gatewayInfo: Array<[string, string | number]>;

  if (gateway) {
    gatewayInfo = [
      ['Label', gateway.settings.label],
      [
        'Address',
        `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`,
      ],
      ['Observer Wallet', formatWalletAddress(gateway.observerAddress)],
      ['Joined at', new Date(gateway.startTimestamp).toLocaleString()],
      [
        'Stake (IO)',
        formatWithCommas(new mIOToken(gateway.operatorStake).toIO().valueOf()),
      ],
      ['Status', gateway.status],
      ['Reward Ratio', gateway.settings.delegateRewardShareRatio],
    ];
  } else {
    gatewayInfo = [];
  }

  const gatewayStatus = gateway ? GatewayStatus.FOUND : GatewayStatus.NOT_FOUND;

  return { gatewayInfo, gatewayStatus };
};
