import {
  AOProcess,
  AoEpochData,
  AoARIORead,
  AoARIOWrite,
  ARIO,
} from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import {
  AO_CU_URL,
  DEFAULT_ARWEAVE_HOST,
  DEFAULT_ARWEAVE_PORT,
  DEFAULT_ARWEAVE_PROTOCOL,
  ARIO_PROCESS_ID as ARIO_PROCESS_ID,
  THEME_TYPES,
} from '@src/constants';
import { ArweaveWalletConnector } from '@src/types';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import Arweave from 'arweave/web';
import { create } from 'zustand';

export type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES];

export type GlobalState = {
  theme: ThemeType;
  arweave: Arweave;
  arIOReadSDK: AoARIORead;
  arIOWriteableSDK?: AoARIOWrite;
  blockHeight?: number;
  currentEpoch?: AoEpochData;
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
  walletStateInitialized: boolean;
  ticker: string;
  aoCongested: boolean;
};

export type GlobalStateActions = {
  setTheme: (theme: ThemeType) => void;
  setBlockHeight: (blockHeight: number) => void;
  setCurrentEpoch: (currentEpoch: AoEpochData) => void;
  updateWallet: (
    walletAddress?: ArweaveTransactionID,
    wallet?: ArweaveWalletConnector,
  ) => void;
  setArIOWriteableSDK: (arIOWriteableSDK?: AoARIOWrite) => void;
  setWalletStateInitialized: (initialized: boolean) => void;
  setTicker: (ticker: string) => void;
  setAoCongested: (congested: boolean) => void;
};

export const initialGlobalState: GlobalState = {
  theme: THEME_TYPES.DARK,
  arweave: Arweave.init({
    host: DEFAULT_ARWEAVE_HOST,
    protocol: DEFAULT_ARWEAVE_PROTOCOL,
    port: DEFAULT_ARWEAVE_PORT,
  }),
  arIOReadSDK: ARIO.init({
    process: new AOProcess({
      processId: ARIO_PROCESS_ID.toString(),
      ao: connect({
        CU_URL: AO_CU_URL,
      }),
    }),
  }),
  walletStateInitialized: false,
  ticker: '',
  aoCongested: false,
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

  setCurrentEpoch = (currentEpoch: AoEpochData) => {
    this.set({ currentEpoch });
  };

  updateWallet = (
    walletAddress?: ArweaveTransactionID,
    wallet?: ArweaveWalletConnector,
  ) => {
    this.set({ walletAddress, wallet });
  };

  setArIOWriteableSDK = (arIOWriteableSDK?: AoARIOWrite) => {
    this.set({ arIOWriteableSDK });
  };

  setWalletStateInitialized = (initialized: boolean) => {
    this.set({ walletStateInitialized: initialized });
  };

  setTicker = (ticker: string) => {
    this.set({ ticker });
  };

  setAoCongested = (congested: boolean) => {
    this.set({ aoCongested: congested });
  };
}

export interface GlobalStateInterface extends GlobalState, GlobalStateActions {}
export const useGlobalState = create<GlobalStateInterface>()((set) => ({
  ...initialGlobalState,
  ...new GlobalStateActionBase(set, initialGlobalState),
}));
