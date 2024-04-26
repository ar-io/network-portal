import { THEME_TYPES } from '@src/constants';
import { ArweaveWalletConnector } from '@src/types';
import { create } from 'zustand';

export type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES];

export type GlobalState = {
  theme: ThemeType;
  walletAddress?: string;
  wallet?: ArweaveWalletConnector;
  balances: {
    ar: number;
    [x: string]: number;
  };
  walletStateInitialized: boolean;
};

export type GlobalStateActions = {
  setTheme: (theme: ThemeType) => void;
  updateWallet: (walletAddress?: string, wallet?: ArweaveWalletConnector) => void;
  setWalletStateInitialized: (initialized: boolean) => void;
  reset: () => void;
};

export const initialGlobalState: GlobalState = {
  theme: THEME_TYPES.DARK,
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

  updateWallet = (walletAddress?: string, wallet?: ArweaveWalletConnector) => {
    this.set({ walletAddress, wallet });
  };

  setWalletStateInitialized = (initialized:boolean) => {
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
