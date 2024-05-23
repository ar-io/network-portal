import { JoinNetworkParams, UpdateGatewaySettingsParams } from '@ar.io/sdk/web';

// KEYS FOR LOCAL STORAGE
export const KEY_WALLET_TYPE = 'walletType';

// CUSTOM PENDING DATA TYPES
export interface OperatorStakeUpdate {
  /** Arweave Transaction ID for update, to be checked for cache invalidation and eviction */
  txid: string;
  type: 'increase' | 'decrease';
  /** Amount in IO (matches argument data type to SDK write interaction) */
  qty: number;
}

export interface GatewaySettingsUpdate {
  /** Arweave Transaction ID for update, to be checked for cache invalidation and eviction */
  txid: string;
  params: UpdateGatewaySettingsParams;
}

// PENDING DATA CACHE
export interface PendingDataCache {
  pendingJoinNetworkParams?: JoinNetworkParams;
  pendingOperatorStakeUpdates?: OperatorStakeUpdate[]; 
  pendingGatewaySettingsUpdates?: GatewaySettingsUpdate[];
}

export const getPendingDataCache = (
  walletAddress: string | undefined,
): PendingDataCache => {
  if (!walletAddress) return {};
  const pendingDataCache = localStorage.getItem(walletAddress);
  return pendingDataCache ? JSON.parse(pendingDataCache) : {};
};

export const storePendingDataCache = (
  walletAddress: string,
  pendingDataCache: PendingDataCache,
) => {
  localStorage.setItem(walletAddress, JSON.stringify(pendingDataCache));
};

export const updatePendingDataCache = (
  walletAddress: string,
  pendingDataCache: PendingDataCache,
) => {
  const currentPendingDataCache = getPendingDataCache(walletAddress);
  storePendingDataCache(walletAddress, {
    ...currentPendingDataCache,
    ...pendingDataCache,
  });
};
