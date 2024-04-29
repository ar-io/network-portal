import { ArIO, ArIOReadable, EpochDistributionData } from '@ar.io/sdk/web';
import { THEME_TYPES } from '@src/constants';
import { ArweaveWalletConnector } from '@src/types';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import Arweave from 'arweave/web';
import { create } from 'zustand';

export type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES];

export type GlobalState = {
  theme: ThemeType;
  arweave: Arweave;
  arIOReadSDK: ArIOReadable;
  blockHeight?: number;
  currentEpoch?: EpochDistributionData;
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
  balances: {
    ar: number;
    io: number;
  };
  walletStateInitialized: boolean;
};

export type GlobalStateActions = {
  setTheme: (theme: ThemeType) => void;
  setBlockHeight: (blockHeight: number) => void;
  setCurrentEpoch: (currentEpoch: EpochDistributionData) => void;
  updateWallet: (
    walletAddress?: ArweaveTransactionID,
    wallet?: ArweaveWalletConnector,
  ) => void;
  setBalances(ar: number, io: number): void;
  setWalletStateInitialized: (initialized: boolean) => void;
  reset: () => void;
};

export const initialGlobalState: GlobalState = {
  theme: THEME_TYPES.DARK,
  arweave: Arweave.init({}),
  arIOReadSDK: ArIO.init(),
  balances: {
    ar: 0,
    io: 0,
  },
  walletStateInitialized: false,
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

  updateWallet = (walletAddress?: ArweaveTransactionID, wallet?: ArweaveWalletConnector) => {
    this.set({ walletAddress, wallet });
  };

  setBalances = (ar: number, io: number) => {
    this.set ({ balances: { ar, io } });
  };

  setWalletStateInitialized = (initialized: boolean) => {
    this.set({ walletStateInitialized: initialized });
  };

  reset = () => {
    this.set({ ...this.initialGlobalState }, true);
  };
}

export interface GlobalStateInterface extends GlobalState, GlobalStateActions {}
export const useGlobalState = create<GlobalStateInterface>()((set) => ({
  ...initialGlobalState,
  ...new GlobalStateActionBase(set, initialGlobalState),
}));
