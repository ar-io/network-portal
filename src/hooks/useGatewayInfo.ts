import { useGlobalState } from '@src/store';
import {
  getPendingDataCache,
  storePendingDataCache,
} from '@src/store/persistent';
import { formatWalletAddress, formatWithCommas, mioToIo } from '@src/utils';
import { useEffect } from 'react';

export enum GatewayStatus {
  PENDING,
  FOUND,
  NOT_FOUND,
}

const GATEWAY_POLLING_INTERVAL_MS = 15_000 // 15 seconds

export const useGatewayInfo = () => {
  const gateway = useGlobalState((state) => state.gateway);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const pendingDataCache = getPendingDataCache(walletAddress?.toString());
  const pendingJoinNetworkParams = pendingDataCache.pendingJoinNetworkParams;

  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const setGateway = useGlobalState((state) => state.setGateway);

  let gatewayInfo: Array<[string, string | number]>;

  useEffect(() => {
    if (!gateway && walletAddress && pendingJoinNetworkParams) {
      const pollGateway = async () => {
        const gateway = await arIOReadSDK.getGateway({
          address: walletAddress.toString(),
        });
        setGateway(gateway);
      };
      pollGateway();

      // check every 15 seconds
      const intervalId = setInterval(pollGateway, GATEWAY_POLLING_INTERVAL_MS);

      return () => clearInterval(intervalId);
    }
  }, [
    arIOReadSDK,
    gateway,
    pendingJoinNetworkParams,
    setGateway,
    walletAddress,
  ]);

  if (gateway) {
    if (pendingJoinNetworkParams && walletAddress) {
      const updated = { ...pendingDataCache };
      delete updated.pendingJoinNetworkParams;
      storePendingDataCache(walletAddress.toString(), updated);
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
  } else if (pendingJoinNetworkParams) {
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
    : pendingJoinNetworkParams
      ? GatewayStatus.PENDING
      : GatewayStatus.NOT_FOUND;

  return { gatewayInfo, gatewayStatus };
};
