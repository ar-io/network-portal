import { JoinNetworkParams } from '@ar.io/sdk/web';
import {
  OperatorStakeUpdate,
  PendingDataCache,
  getPendingDataCache,
  storePendingDataCache,
  updatePendingDataCache,
} from '@src/store/persistent';

describe('persistent.ts', () => {
  const mockWalletAddress = 'test-wallet-address';
  const mockWalletAddress2 = 'test-wallet-address2';
  const mockData: PendingDataCache = {
    pendingJoinNetworkParams: {
      allowDelegatedStaking: true,
      autoStake: true,
      delegateRewardShareRatio: 50,
      fqdn: 'example.com',
      label: 'example',
      minDelegatedStake: 100,
      note: 'example',
      port: 443,
      properties: 'example',
      protocol: 'https',
      qty: 10000,
      observerAddress: mockWalletAddress,
    },
    pendingOperatorStakeUpdates: [{ txid: 'tx123', type: 'increase', qty: 100 }],
    pendingGatewaySettingsUpdates: [
      { txid: 'tx456', params: { fqdn: 'example2.com' } },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('getPendingDataCache', () => {
    it('should return an empty object if walletAddress is undefined', () => {
      expect(getPendingDataCache(undefined)).toEqual({});
    });

    it('should return an empty object if no data is stored for the walletAddress', () => {
      expect(getPendingDataCache(mockWalletAddress)).toEqual({});
    });

    it('should return stored data for the walletAddress', () => {
      localStorage.setItem(mockWalletAddress, JSON.stringify(mockData));
      expect(getPendingDataCache(mockWalletAddress)).toEqual(mockData);
    });
  });

  describe('storePendingDataCache', () => {
    it('should store data in localStorage for the given walletAddress', () => {
      storePendingDataCache(mockWalletAddress, mockData);
      expect(localStorage.getItem(mockWalletAddress)).toEqual(
        JSON.stringify(mockData),
      );
    });
  });

  describe('updatePendingDataCache', () => {
    it('should update the existing cache with new data', () => {
      const joinNetworkParams: JoinNetworkParams = {
        allowDelegatedStaking: true,
        autoStake: true,
        delegateRewardShareRatio: 100,
        fqdn: 'example2.com',
        label: 'example2',
        minDelegatedStake: 1000,
        note: 'example2',
        port: 443,
        properties: 'example2',
        protocol: 'https',
        qty: 20000,
        observerAddress: mockWalletAddress2,
      };
      localStorage.setItem(mockWalletAddress, JSON.stringify(mockData));
      updatePendingDataCache(mockWalletAddress, {
        pendingJoinNetworkParams: joinNetworkParams,
      });
      expect(
        JSON.parse(localStorage.getItem(mockWalletAddress) || '{}'),
      ).toEqual({
        ...mockData,
        pendingJoinNetworkParams: joinNetworkParams,
      });
    });
  });

  it('should update the existing cache with new operator stake update', () => {
    const operatorStakeUpdate: OperatorStakeUpdate = {
      type: 'decrease',
      txid: 'txid',
      qty: 100,
    };
    localStorage.setItem(mockWalletAddress, JSON.stringify(mockData));
    updatePendingDataCache(mockWalletAddress, {
      pendingOperatorStakeUpdates: [operatorStakeUpdate],
    });
    const pendingDataCache = getPendingDataCache(mockWalletAddress);
    expect(pendingDataCache.pendingOperatorStakeUpdates).toEqual([
      operatorStakeUpdate,
    ]);
    expect(pendingDataCache.pendingJoinNetworkParams).toEqual(
      mockData.pendingJoinNetworkParams,
    );
    expect(pendingDataCache.pendingGatewaySettingsUpdates).toEqual(
      mockData.pendingGatewaySettingsUpdates,
    );
  });
});
