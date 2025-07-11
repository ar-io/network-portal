import { WalletNotInstalledError, WanderError } from '@src/utils/errors';
import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/web/lib/api';

import { ContractSigner } from '@ar.io/sdk/web';
import { log } from '@src/constants';
import { KEY_WALLET_TYPE } from '@src/store/persistent';
import { executeWithTimeout } from '@src/utils';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import { NetworkPortalWalletConnector, WALLET_TYPES } from '../../types';

export const WANDER_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
  'SIGNATURE',
];
export const WANDER_UNRESPONSIVE_ERROR =
  'There was an issue initializing Wander. Please reload the page to initialize.';

export class WanderWalletConnector implements NetworkPortalWalletConnector {
  private _wallet: Window['arweaveWallet'];
  contractSigner?: ContractSigner;

  constructor() {
    this._wallet = window?.arweaveWallet;
    this.contractSigner = this._wallet;
  }

  // The API has been shown to be unreliable, so we call each function with a timeout
  async safeWanderApiExecutor<T>(fn: () => T): Promise<T> {
    if (!this._wallet)
      throw new WalletNotInstalledError('Wander is not installed.');
    /**
     * This is here because occasionally wander injects but does not initialize internally properly,
     * allowing the api to be called but then hanging.
     * This is a workaround to check that and emit appropriate errors,
     * and to trigger the workaround workflow of reloading the page and re-initializing wander.
     */
    const res = await executeWithTimeout(() => fn(), 3000);

    if (res === 'timeout') {
      throw new Error(WANDER_UNRESPONSIVE_ERROR);
    }
    return res as T;
  }

  async connect(): Promise<void> {
    if (!window.arweaveWallet) {
      window.open('https://wander.app');

      return;
    }
    // confirm they have the extension installed
    localStorage.setItem(KEY_WALLET_TYPE, WALLET_TYPES.WANDER);
    const permissions = await this.safeWanderApiExecutor(
      this._wallet?.getPermissions,
    );
    if (
      permissions &&
      !WANDER_WALLET_PERMISSIONS.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      // disconnect due to missing permissions, then re-connect
      await this.safeWanderApiExecutor(this._wallet?.disconnect);
    } else if (permissions) {
      return;
    }

    await this._wallet
      .connect(
        WANDER_WALLET_PERMISSIONS,
        {
          name: 'NETWORK PORTAL by ar.io',
        },
        // TODO: add arweave configs here
      )
      .catch((err) => {
        localStorage.removeItem(KEY_WALLET_TYPE);
        log.error(err);
        throw new WanderError('User cancelled authentication.');
      });
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem(KEY_WALLET_TYPE);
    return this.safeWanderApiExecutor(this._wallet?.disconnect);
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    return this.safeWanderApiExecutor(() =>
      this._wallet
        ?.getActiveAddress()
        .then((res) => new ArweaveTransactionID(res)),
    );
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    const config = await this.safeWanderApiExecutor(
      this._wallet?.getArweaveConfig,
    );
    return config as unknown as ApiConfig;
  }
}
