import { JoinNetworkParams } from '@ar.io/sdk/web';

// KEYS FOR LOCAL STORAGE
export const KEY_WALLET_TYPE = 'walletType';

// PENDING DATA CACHE
export interface PendingDataCache {
  pendingJoinNetworkParams?: JoinNetworkParams;
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
