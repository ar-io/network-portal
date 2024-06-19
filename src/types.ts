import { ArconnectSigner } from "@ar.io/sdk/web";
import { ArweaveTransactionID } from "./utils/ArweaveTransactionId";

export interface Equatable<T> {
  equals(other: T): boolean;
}

export interface ArweaveWalletConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getWalletAddress(): Promise<ArweaveTransactionID>;
  // getGatewayConfig(): Promise<ApiConfig>;
  signer?: ArconnectSigner;
}

export enum WALLET_TYPES {
  ARCONNECT = 'ArConnect',
  ARWEAVE_APP = 'ArweaveApp',
}

