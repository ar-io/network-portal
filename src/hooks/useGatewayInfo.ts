import { JoinNetworkParams } from '@ar.io/sdk';
import { useGlobalState } from '@src/store';
import { KEY_PENDING_JOIN_NETWORK_PARAMS } from '@src/store/persistent';
import { formatWalletAddress, formatWithCommas, mioToIo } from '@src/utils';
import { useEffect } from 'react';

export enum GatewayStatus {
  PENDING,
  FOUND,
  NOT_FOUND,
}

export const useGatewayInfo = () => {
  const gateway = useGlobalState((state) => state.gateway);
  const pendingGateway = localStorage.getItem(KEY_PENDING_JOIN_NETWORK_PARAMS);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const setGateway = useGlobalState((state) => state.setGateway);

  let gatewayInfo: Array<[string, string | number]>;

  useEffect(() => {
    if (!gateway && walletAddress && pendingGateway) {
      const pollGateway = async () => {
        const gateway = await arIOReadSDK.getGateway({
          address: walletAddress.toString(),
        });
        setGateway(gateway);
      };
      pollGateway();

      // check every 15 seconds
      const intervalId = setInterval(pollGateway, 15000);

      return () => clearInterval(intervalId);
    }
  }, [arIOReadSDK, gateway, pendingGateway, setGateway, walletAddress]);

  if (gateway) {
    if (pendingGateway) {
      localStorage.removeItem(KEY_PENDING_JOIN_NETWORK_PARAMS);
    }

    gatewayInfo = [
      ['Label', gateway.settings.label],
      [
        'Address',
        `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}`,
      ],
      ['Observer Wallet', formatWalletAddress(gateway.observerWallet)],
      ['Joined at', gateway.start],
      ['Stake (IO)', formatWithCommas(mioToIo(gateway.operatorStake))],
      ['Status', gateway.status],
      ['Reward Ratio', gateway.settings.delegateRewardShareRatio],
    ];
  } else if (pendingGateway) {
    const pendingJoinNetworkParams: JoinNetworkParams =
      JSON.parse(pendingGateway);

    const {
      label,
      protocol,
      fqdn,
      port,
      observerWallet,
      qty: operatorStake,
      delegateRewardShareRatio,
    } = pendingJoinNetworkParams;

    gatewayInfo = [
      ['Label', label],
      ['Address', `${protocol}://${fqdn}:${port}`],
      [
        'Observer Wallet',
        observerWallet ? formatWalletAddress(observerWallet) : '',
      ],
      ['Joined at', 'PENDING'],
      ['Stake (IO)', formatWithCommas(mioToIo(operatorStake))],
      ['Status', 'PENDING'],
      ['Reward Ratio', delegateRewardShareRatio],
    ];
  } else {
    gatewayInfo = [];
  }

  const gatewayStatus = gateway
    ? GatewayStatus.FOUND
    : pendingGateway
      ? GatewayStatus.PENDING
      : GatewayStatus.NOT_FOUND;

  return { gatewayInfo, gatewayStatus };
};
