import {
  AoARIORead,
  AoARIOWrite,
  AoEpochData,
  AOProcess,
  ARIO,
  ContractSigner,
} from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import {
  AO_CU_URL,
  ARIO_PROCESS_ID,
  DEFAULT_ARWEAVE_GQL_ENDPOINT,
  DEFAULT_ARWEAVE_HOST,
  DEFAULT_ARWEAVE_PORT,
  DEFAULT_ARWEAVE_PROTOCOL,
  THEME_TYPES,
} from '@src/constants';
import { AoAddress, NetworkPortalWalletConnector } from '@src/types';
import Arweave from 'arweave/web';
import { create } from 'zustand';
import { createDb, NetworkPortalDB } from './db';

export type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES];

export type GlobalState = {
  theme: ThemeType;
  arweave: Arweave;
  arIOReadSDK: AoARIORead;
  arIOWriteableSDK?: AoARIOWrite;
  blockHeight?: number;
  currentEpoch?: AoEpochData;
  walletAddress?: AoAddress;
  wallet?: NetworkPortalWalletConnector;
  walletStateInitialized: boolean;
  ticker: string;
  aoCongested: boolean;
  arioProcessId: string;
  contractSigner?: ContractSigner;
  networkPortalDB: NetworkPortalDB;
  aoCuUrl: string;
  arweaveGqlUrl: string;
};

export type GlobalStateActions = {
  setTheme: (theme: ThemeType) => void;
  setBlockHeight: (blockHeight: number) => void;
  setCurrentEpoch: (currentEpoch: AoEpochData) => void;
  updateWallet: (
    walletAddress?: AoAddress,
    wallet?: NetworkPortalWalletConnector,
  ) => void;
  setContractSigner: (signer?: ContractSigner) => void;
  setWalletStateInitialized: (initialized: boolean) => void;
  setTicker: (ticker: string) => void;
  setAoCongested: (congested: boolean) => void;
  setArioProcessId: (processId: string) => void;
  setAoCuUrl: (cuUrl: string) => void;
  setArweaveGqlUrl: (url: string) => void;
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
  arioProcessId: ARIO_PROCESS_ID.toString(),
  networkPortalDB: createDb(ARIO_PROCESS_ID.toString()),
  aoCuUrl: AO_CU_URL,
  arweaveGqlUrl: DEFAULT_ARWEAVE_GQL_ENDPOINT,
};
export class GlobalStateActionBase implements GlobalStateActions {
  constructor(
    private set: (props: any, replace?: boolean) => void,
    private get: () => GlobalStateInterface,
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
    walletAddress?: AoAddress,
    wallet?: NetworkPortalWalletConnector,
  ) => {
    this.set({ walletAddress, wallet });
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

  setArioProcessId = (processId: string) => {
    this.get().networkPortalDB.close();

    this.set({
      arioProcessId: processId,
      currentEpoch: undefined,
      arIOReadSDK: ARIO.init({
        process: new AOProcess({
          processId: processId,
          ao: connect({
            CU_URL: this.get().aoCuUrl,
          }),
        }),
      }),
      networkPortalDB: createDb(processId),
    });
    this.setContractSigner(this.get().contractSigner);
  };

  setContractSigner = (signer?: ContractSigner) => {
    this.set({
      contractSigner: signer,
      arIOWriteableSDK: signer
        ? ARIO.init({
            signer,
            process: new AOProcess({
              processId: this.get().arioProcessId,
              ao: connect({
                CU_URL: this.get().aoCuUrl,
              }),
            }),
          })
        : undefined,
    });
  };

  setAoCuUrl = (aoCuUrl: string) => {
    const signer = this.get().contractSigner;

    this.set({
      aoCuUrl: aoCuUrl,
      arIoReadSDK: ARIO.init({
        process: new AOProcess({
          processId: this.get().arioProcessId,
          ao: connect({
            CU_URL: aoCuUrl,
          }),
        }),
      }),
      arIoWriteableSDK: signer
        ? ARIO.init({
            signer,
            process: new AOProcess({
              processId: this.get().arioProcessId,
              ao: connect({
                CU_URL: aoCuUrl,
              }),
            }),
          })
        : undefined,
    });
  };

  setArweaveGqlUrl = (url: string) => {
    this.set({ arweaveGqlUrl: url });
  };
}

export interface GlobalStateInterface extends GlobalState, GlobalStateActions {}
export const useGlobalState = create<GlobalStateInterface>()((set, get) => ({
  ...initialGlobalState,
  ...new GlobalStateActionBase(set, get, initialGlobalState),
}));
