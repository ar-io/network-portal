import { ArweaveTransactionID } from './utils/ArweaveTransactionId';

export interface Equatable<T> {
  equals(other: T): boolean;
}

export interface ArweaveWalletConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getWalletAddress(): Promise<ArweaveTransactionID>;
  // getGatewayConfig(): Promise<ApiConfig>;
  signer?: Window['arweaveWallet'];
}

export enum WALLET_TYPES {
  ARCONNECT = 'ArConnect',
  ARWEAVE_APP = 'ArweaveApp',
}

export interface ReportData {
  epochEndTimestamp: number;
  epochIndex: number;
  epochStartHeight: number;
  epochStartTimestamp: number;
  formatVersion: number;
  gatewayAssessments: Record<string, Assessment>;
  generatedAt: number;
  observerAddress: string;
}

export interface Assessment {
  arnsAssessments: {
    chosenNames: Record<string, ArNSAssessment>;
    pass: boolean;
    prescribedNames: Record<string, ArNSAssessment>;
  };
  ownershipAssessment: OwnershipAssessment;
  pass: boolean;
}

export interface OwnershipAssessment {
  expectedWallets: string[];
  observedWallet?: string;
  pass: boolean;
}

export interface ArNSAssessmentTimings
  extends Record<string, number | undefined> {
  dns: number | undefined;
  download: number | undefined;
  firstByte: number | undefined;
  request: number | undefined;
  tcp: number | undefined;
  tls: number | undefined;
  total: number | undefined;
  wait: number | undefined;
}

export interface ArNSAssessment {
  assesedAt: number;
  expectedDataHash: string;
  expectedId: string;
  expectedStatusCode: number;
  pass: boolean;
  failureReason?: string;
  resolvedDataHash: string;
  resolvedId: string;
  resolvedStatusCode: number;
  timings?: ArNSAssessmentTimings;
}

export type WithdrawalType = 'standard' | 'expedited';
