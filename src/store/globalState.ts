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
  DEFAULT_ARWEAVE_HOST,
  DEFAULT_ARWEAVE_PORT,
  DEFAULT_ARWEAVE_PROTOCOL,
  THEME_TYPES,
} from '@src/constants';
import { AoAddress, NetworkPortalWalletConnector } from '@src/types';
import Arweave from 'arweave/web';
import { create } from 'zustand';
import { createDb, NetworkPortalDB } from './db';
import { useSettings } from './settings';

type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES];

type GlobalState = {
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
  contractSigner?: ContractSigner;
  networkPortalDB: NetworkPortalDB;
};

type GlobalStateActions = {
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
};

const initialGlobalState: GlobalState = {
  theme: THEME_TYPES.DARK,
  arweave: Arweave.init({
    host: DEFAULT_ARWEAVE_HOST,
    protocol: DEFAULT_ARWEAVE_PROTOCOL,
    port: DEFAULT_ARWEAVE_PORT,
  }),
  arIOReadSDK: ARIO.init({
    process: new AOProcess({
      processId: useSettings.getState().arioProcessId,
      ao: connect({
        CU_URL: useSettings.getState().aoCuUrl,
      }),
    }),
  }),
  walletStateInitialized: false,
  ticker: '',
  aoCongested: false,
  networkPortalDB: createDb(useSettings.getState().arioProcessId),
};

const makeArIOReadSDK = ({
  aoCuUrl,
  arioProcessId,
}: {
  aoCuUrl: string;
  arioProcessId: string;
}) => {
  return ARIO.init({
    process: new AOProcess({
      processId: arioProcessId,
      ao: connect({
        CU_URL: aoCuUrl,
      }),
    }),
  });
};

const makeArIOWriteSDK = ({
  aoCuUrl,
  arioProcessId,
  contractSigner,
}: {
  aoCuUrl: string;
  arioProcessId: string;
  contractSigner?: ContractSigner;
}) => {
  if (!contractSigner) return undefined;
  return ARIO.init({
    signer: contractSigner,
    process: new AOProcess({
      processId: arioProcessId,
      ao: connect({
        CU_URL: aoCuUrl,
      }),
    }),
  });
};

class GlobalStateActionBase implements GlobalStateActions {
  constructor(
    private set: (props: Partial<GlobalState>, replace?: boolean) => void,
    get: () => GlobalStateInterface,
  ) {
    /* Subscribe to changes in the Settings store.
     * If/When: The user changes the AO CU URL or the AR.IO Process in the SettingsModal,
     * Then: Reinstantiate the AR.IO read and write SDKs.
     */
    useSettings.subscribe(
      ({ aoCuUrl, arioProcessId }) => ({ aoCuUrl, arioProcessId }),
      ({ aoCuUrl, arioProcessId }) => {
        const { contractSigner } = get();
        const arIOReadSDK = makeArIOReadSDK({ aoCuUrl, arioProcessId });
        const arIOWriteableSDK = makeArIOWriteSDK({
          aoCuUrl,
          arioProcessId,
          contractSigner,
        });
        set({ arIOReadSDK, arIOWriteableSDK });
      },
    );
    /* Subscribe to changes in the Settings store.
     * If/When: The user changes the AR.IO Process in the SettingsModal,
     * Then: Close and re-open the Dexie (IndexedDB) database.
     */
    useSettings.subscribe(
      ({ arioProcessId }) => arioProcessId,
      (arioProcessId) => {
        const currentEpoch = undefined;
        let { networkPortalDB } = get();
        networkPortalDB.close();
        networkPortalDB = createDb(arioProcessId);
        set({ currentEpoch, networkPortalDB });
      },
    );
  }

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

  setContractSigner = (contractSigner?: ContractSigner) => {
    const { aoCuUrl, arioProcessId } = useSettings.getState();
    const arIOWriteableSDK = makeArIOWriteSDK({
      aoCuUrl,
      arioProcessId,
      contractSigner,
    });
    this.set({ contractSigner, arIOWriteableSDK });
  };
}

interface GlobalStateInterface extends GlobalState, GlobalStateActions {}
export const useGlobalState = create<GlobalStateInterface>()((set, get) => ({
  ...initialGlobalState,
  ...new GlobalStateActionBase(set, get),
}));
