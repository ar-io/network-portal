import { BeaconError } from '@src/utils/errors';
import WalletClient from '@vela-ventures/ao-sync-sdk';
import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/node/lib/api';

import { NetworkPortalWalletConnector, WALLET_TYPES } from '../../types';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';

export const BEACON_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
  'SIGNATURE',
];

export class BeaconWalletConnector implements NetworkPortalWalletConnector {
  private _wallet: WalletClient;
  contractSigner: Window['arweaveWallet'];
  constructor() {
    this._wallet = new WalletClient();
    this._wallet.reconnect();
    this.contractSigner = window?.arweaveWallet;
  }

  async connect(): Promise<void> {
    localStorage.setItem('walletType', WALLET_TYPES.BEACON);

    await this._wallet
      .connect({ appInfo: { name: 'NETWORK PORTAL by ar.io' } })
      .catch((err) => {
        localStorage.removeItem('walletType');
        console.error(err);
        throw new BeaconError('User cancelled authentication.');
      });
  }

  async on(event: string, listener: (data: any) => void) {
    this._wallet.on(event, listener);
  }

  async off(event: string, listener: (data: any) => void) {
    this._wallet.off(event, listener);
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    return await this._wallet?.disconnect();
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    return await this._wallet
      ?.getActiveAddress()
      .then((res) => new ArweaveTransactionID(res));
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    const config = await this._wallet?.getArweaveConfig();
    return config as unknown as ApiConfig;
  }
}
