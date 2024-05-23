import {
  ArIO,
  ArIOReadable,
  ArIOWritable,
  EpochDistributionData,
  Gateway,
} from '@ar.io/sdk/web';
import {
  ARNS_REGISTRY_ADDRESS,
  DEFAULT_ARWEAVE_HOST,
  DEFAULT_ARWEAVE_PORT,
  DEFAULT_ARWEAVE_PROTOCOL,
  THEME_TYPES,
} from '@src/constants';
import { ArweaveWalletConnector } from '@src/types';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import Arweave from 'arweave/web';
import { create } from 'zustand';
import { GatewaySettingsUpdate, OperatorStakeUpdate } from './persistent';

export type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES];

export type PendingGatewayUpdates = {
  gatewaySettingsUpdates: GatewaySettingsUpdate[];
  operatorStakeUpdates: OperatorStakeUpdate[];
};

export type GlobalState = {
  theme: ThemeType;
  arweave: Arweave;
  arIOReadSDK: ArIOReadable;
  arIOWriteableSDK?: ArIOWritable;
  blockHeight?: number;
  currentEpoch?: EpochDistributionData;
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
  gateway?: Gateway;
  balances: {
    ar: number;
    io: number;
  };
  walletStateInitialized: boolean;
  pendingGatewayUpdates: PendingGatewayUpdates; 
};

export type GlobalStateActions = {
  setTheme: (theme: ThemeType) => void;
  setBlockHeight: (blockHeight: number) => void;
  setCurrentEpoch: (currentEpoch: EpochDistributionData) => void;
  updateWallet: (
    walletAddress?: ArweaveTransactionID,
    wallet?: ArweaveWalletConnector,
  ) => void;
  setGateway: (gateway?: Gateway) => void;
  setArIOWriteableSDK: (arIOWriteableSDK?: ArIOWritable) => void;
  setBalances(ar: number, io: number): void;
  setWalletStateInitialized: (initialized: boolean) => void;
  reset: () => void;
  setPendingGatewayUpdates: (pendingGatewayUpdates: PendingGatewayUpdates) => void;
};

export const initialGlobalState: GlobalState = {
  theme: THEME_TYPES.DARK,
  arweave: Arweave.init({
    host: DEFAULT_ARWEAVE_HOST,
    protocol: DEFAULT_ARWEAVE_PROTOCOL,
    port: DEFAULT_ARWEAVE_PORT,
  }),
  arIOReadSDK: ArIO.init({ contractTxId: ARNS_REGISTRY_ADDRESS.toString() }),
  balances: {
    ar: 0,
    io: 0,
  },
  walletStateInitialized: false,
  pendingGatewayUpdates: {
    gatewaySettingsUpdates: [],
    operatorStakeUpdates: [],
  },
};
export class GlobalStateActionBase implements GlobalStateActions {
  constructor(
    private set: (props: any, replace?: boolean) => void,
    private initialGlobalState: GlobalState,
  ) {}
  setTheme = (theme: ThemeType) => {
    this.set({ theme });
    // disabling as this should not be done in the store
    // applyThemePreference(theme);
  };

  setBlockHeight = (blockHeight: number) => {
    this.set({ blockHeight });
  };

  setCurrentEpoch = (currentEpoch: EpochDistributionData) => {
    this.set({ currentEpoch });
  };

  updateWallet = (
    walletAddress?: ArweaveTransactionID,
    wallet?: ArweaveWalletConnector,
  ) => {
    this.set({ walletAddress, wallet });
  };

  setGateway = (gateway?: Gateway) => {
    this.set({ gateway });
  };

  setArIOWriteableSDK = (arIOWriteableSDK?: ArIOWritable) => {
    this.set({ arIOWriteableSDK });
  };

  setBalances = (ar: number, io: number) => {
    this.set({ balances: { ar, io } });
  };

  setWalletStateInitialized = (initialized: boolean) => {
    this.set({ walletStateInitialized: initialized });
  };

  reset = () => {
    this.set({ ...this.initialGlobalState }, true);
  };

  setPendingGatewayUpdates = (pendingGatewayUpdates: PendingGatewayUpdates) => {
    this.set({ pendingGatewayUpdates });
  };
}

export interface GlobalStateInterface extends GlobalState, GlobalStateActions {}
export const useGlobalState = create<GlobalStateInterface>()((set) => ({
  ...initialGlobalState,
  ...new GlobalStateActionBase(set, initialGlobalState),
}));
