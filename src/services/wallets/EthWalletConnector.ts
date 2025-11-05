import { AoSigner, ContractSigner } from '@ar.io/sdk/web';
import { InjectedEthereumSigner, createData } from '@dha-team/arbundles';
import { MetamaskError } from '@src/utils/errors';
import { ApiConfig } from 'arweave/node/lib/api';
import {
  SwitchChainError,
  UserRejectedRequestError,
  hashMessage,
  recoverPublicKey,
  toBytes,
} from 'viem';
import { Config, Connector } from 'wagmi';
import { connect, disconnect, getAccount, signMessage } from 'wagmi/actions';

import {
  DEFAULT_ARWEAVE_HOST,
  DEFAULT_ARWEAVE_PORT,
  DEFAULT_ARWEAVE_PROTOCOL,
} from '@src/constants';
import {
  AoAddress,
  NetworkPortalWalletConnector,
  WALLET_TYPES,
} from '../../types';

export class EthWalletConnector implements NetworkPortalWalletConnector {
  contractSigner?: ContractSigner;
  connector: Connector;
  config: Config;

  constructor(config: Config) {
    const connector = config.connectors.find((c) => c.name === 'MetaMask');

    if (!connector) {
      throw new MetamaskError('MetaMask connector not found.');
    }

    this.connector = connector;

    const provider = {
      getSigner: () => ({
        signMessage: async (message: any) => {
          const arg = message instanceof String ? message : { raw: message };

          const ethAccount = getAccount(config);

          return await signMessage(config, {
            message: arg as any,
            account: ethAccount.address,
            connector: this.connector,
          });
        },
      }),
    };
    const signer = new InjectedEthereumSigner(provider as any);
    signer.setPublicKey = async () => {
      const message = 'Sign this message to connect to Network Portal';
      const ethAccount = getAccount(config);

      const signature = await signMessage(config, {
        message: message,
        account: ethAccount.address,
        connector: this.connector,
      });
      const hash = await hashMessage(message);
      const recoveredKey = await recoverPublicKey({
        hash,
        signature,
      });
      signer.publicKey = Buffer.from(toBytes(recoveredKey));
    };

    const aoSigner: AoSigner = async ({ data, tags, target }) => {
      const ethAccount = getAccount(config);

      if (!signer.publicKey) {
        await signer.setPublicKey();
      }

      const ETHEREUM_MAINNET_CHAIN_ID = 1;

      if (ethAccount.chainId !== ETHEREUM_MAINNET_CHAIN_ID) {
        try {
          await this.connector.switchChain?.({
            chainId: ETHEREUM_MAINNET_CHAIN_ID,
          });
        } catch (error) {
          // Handle different switch errors
          if (error instanceof UserRejectedRequestError) {
            throw new Error('User rejected network switch');
          } else if (error instanceof SwitchChainError) {
            throw new Error('Unable to switch to Ethereum Mainnet');
          } else {
            throw new Error('Unexpected error switching networks');
          }
        }
      }

      const dataToSign = typeof data === 'string' ? data : new Uint8Array(data);
      const dataItem = createData(dataToSign, signer, {
        tags,
        target,
        anchor: Math.round(Date.now() / 1000)
          .toString()
          .padStart(32, Math.floor(Math.random() * 10).toString()),
      });

      const res = await dataItem.sign(signer).then(async () => ({
        id: dataItem.id,
        raw: dataItem.getRaw(),
      }));
      return res;
    };

    this.config = config;
    this.contractSigner = aoSigner;
  }

  async connect(): Promise<void> {
    try {
      localStorage.setItem('walletType', WALLET_TYPES.ETHEREUM);

      await connect(this.config, { connector: this.connector });
    } catch (_error) {
      localStorage.removeItem('walletType');
      throw new MetamaskError('User cancelled authentication.');
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    await disconnect(this.config, { connector: this.connector });
  }

  async getWalletAddress(): Promise<AoAddress> {
    const address = getAccount(this.config).address;
    if (!address) {
      throw new MetamaskError('No address found');
    }
    return address;
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    return {
      host: DEFAULT_ARWEAVE_HOST,
      port: DEFAULT_ARWEAVE_PORT,
      protocol: DEFAULT_ARWEAVE_PROTOCOL,
    };
  }
}
