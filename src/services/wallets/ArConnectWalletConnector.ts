import { ArconnectError, WalletNotInstalledError } from '@src/utils/errors';
import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/web/lib/api';

import { ArconnectSigner } from '@ar.io/sdk/web';
import { executeWithTimeout } from '@src/utils';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import { ArweaveWalletConnector, WALLET_TYPES } from '../../types';

export const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
  'SIGNATURE',
];
export const ARCONNECT_UNRESPONSIVE_ERROR =
  'There was an issue initializing ArConnect. Please reload the page to initialize.';

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: Window['arweaveWallet'];
  signer?: ArconnectSigner;

  constructor() {
    this._wallet = window?.arweaveWallet;
    this.signer = new ArconnectSigner(this._wallet, null as any);

    // {
    //   signer: async (transaction: Transaction) => {
    //     const signedTransaction = await this._wallet.sign(transaction);
    //     Object.assign(transaction, signedTransaction);
    //   },
    //   // type: 'arweave' as SignatureType,
    // };
  }

  // The API has been shown to be unreliable, so we call each function with a timeout
  async safeArconnectApiExecutor<T>(fn: () => T): Promise<T> {
    if (!this._wallet)
      throw new WalletNotInstalledError('Arconnect is not installed.');
    /**
     * This is here because occasionally arconnect injects but does not initialize internally properly,
     * allowing the api to be called but then hanging.
     * This is a workaround to check that and emit appropriate errors,
     * and to trigger the workaround workflow of reloading the page and re-initializing arconnect.
     */
    const res = await executeWithTimeout(() => fn(), 3000);

    if (res === 'timeout') {
      throw new Error(ARCONNECT_UNRESPONSIVE_ERROR);
    }
    return res as T;
  }

  async connect(): Promise<void> {
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');

      return;
    }
    // confirm they have the extension installed
    localStorage.setItem('walletType', WALLET_TYPES.ARCONNECT);
    const permissions = await this.safeArconnectApiExecutor(
      this._wallet?.getPermissions,
    );
    if (
      permissions &&
      !ARCONNECT_WALLET_PERMISSIONS.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      // disconnect due to missing permissions, then re-connect
      await this.safeArconnectApiExecutor(this._wallet?.disconnect);
    } else if (permissions) {
      return;
    }

    await this._wallet
      .connect(
        ARCONNECT_WALLET_PERMISSIONS,
        {
          name: 'NETWORK PORTAL by ar.io',
        },
        // TODO: add arweave configs here
      )
      .catch((err) => {
        localStorage.removeItem('walletType');
        console.error(err);
        throw new ArconnectError('User cancelled authentication.');
      });
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    return this.safeArconnectApiExecutor(this._wallet?.disconnect);
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    return this.safeArconnectApiExecutor(() =>
      this._wallet
        ?.getActiveAddress()
        .then((res) => new ArweaveTransactionID(res)),
    );
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    const config = await this.safeArconnectApiExecutor(
      this._wallet?.getArweaveConfig,
    );
    return config as unknown as ApiConfig;
  }
}
