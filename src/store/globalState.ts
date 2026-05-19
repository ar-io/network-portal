import type { SolanaARIOWriteable } from '@ar.io/sdk/solana';
import { ARIO, AoARIORead, AoEpochData } from '@ar.io/sdk/web';
import { address, createSolanaRpc } from '@solana/kit';
import type { Rpc, SolanaRpcApi } from '@solana/kit';
import { THEME_TYPES } from '@src/constants';
import { AoAddress } from '@src/types';
import { getOptionalSolanaAddress } from '@src/utils/solanaAddress';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { NetworkPortalDB, createDb } from './db';
import { useSettings } from './settings';

type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES];

type GlobalState = {
  theme: ThemeType;
  rpc: Rpc<SolanaRpcApi>;
  solanaRpcUrl: string;
  arIOReadSDK: AoARIORead;
  arIOWriteableSDK?: SolanaARIOWriteable;
  solanaSlot?: number;
  currentEpoch?: AoEpochData;
  walletAddress?: AoAddress;
  walletStateInitialized: boolean;
  ticker: string;
  networkPortalDB: NetworkPortalDB;
  isMobile: boolean;
};

type GlobalStateActions = {
  setTheme: (theme: ThemeType) => void;
  setSolanaSlot: (slot: number) => void;
  setCurrentEpoch: (currentEpoch: AoEpochData) => void;
  updateWallet: (walletAddress?: AoAddress) => void;
  setWalletStateInitialized: (initialized: boolean) => void;
  setTicker: (ticker: string) => void;
  setIsMobile: (isMobile: boolean) => void;
  setWriteSDK: (sdk?: SolanaARIOWriteable) => void;
};

const makeRpc = (rpcUrl: string) => createSolanaRpc(rpcUrl);

const makeArIOReadSDK = (rpc: Rpc<SolanaRpcApi>): AoARIORead => {
  const settings = useSettings.getState();
  const coreProgramId = getOptionalSolanaAddress(settings.solanaCoreProgramId);
  const garProgramId = getOptionalSolanaAddress(settings.solanaGarProgramId);
  const arnsProgramId = getOptionalSolanaAddress(settings.solanaArnsProgramId);

  return ARIO.init({
    backend: 'solana',
    rpc,
    ...(coreProgramId ? { coreProgramId: address(coreProgramId) } : {}),
    ...(garProgramId ? { garProgramId: address(garProgramId) } : {}),
    ...(arnsProgramId ? { arnsProgramId: address(arnsProgramId) } : {}),
  });
};

const initialSolanaRpcUrl = useSettings.getState().solanaRpcUrl;
const initialRpc = makeRpc(initialSolanaRpcUrl);

const initialGlobalState: GlobalState = {
  theme: THEME_TYPES.DARK,
  rpc: initialRpc,
  solanaRpcUrl: initialSolanaRpcUrl,
  arIOReadSDK: makeArIOReadSDK(initialRpc),
  walletStateInitialized: false,
  ticker: '',
  networkPortalDB: createDb('solana-mainnet'),
  isMobile: window.innerWidth < 1024,
};

class GlobalStateActionBase implements GlobalStateActions {
  constructor(
    private set: (props: Partial<GlobalState>, replace?: boolean) => void,
    _get: () => GlobalStateInterface,
  ) {
    useSettings.subscribe(
      (state) => ({
        solanaRpcUrl: state.solanaRpcUrl,
        solanaCoreProgramId: state.solanaCoreProgramId,
        solanaGarProgramId: state.solanaGarProgramId,
        solanaArnsProgramId: state.solanaArnsProgramId,
      }),
      ({ solanaRpcUrl }) => {
        const rpc = makeRpc(solanaRpcUrl);
        const arIOReadSDK = makeArIOReadSDK(rpc);
        set({ rpc, solanaRpcUrl, arIOReadSDK, arIOWriteableSDK: undefined });
      },
      { equalityFn: shallow },
    );
  }

  setTheme = (theme: ThemeType) => {
    this.set({ theme });
  };

  setSolanaSlot = (solanaSlot: number) => {
    this.set({ solanaSlot });
  };

  setCurrentEpoch = (currentEpoch: AoEpochData) => {
    this.set({ currentEpoch });
  };

  updateWallet = (walletAddress?: AoAddress) => {
    this.set({ walletAddress });
  };

  setWalletStateInitialized = (initialized: boolean) => {
    this.set({ walletStateInitialized: initialized });
  };

  setTicker = (ticker: string) => {
    this.set({ ticker });
  };

  setIsMobile = (isMobile: boolean) => {
    this.set({ isMobile });
  };

  setWriteSDK = (arIOWriteableSDK?: SolanaARIOWriteable) => {
    this.set({ arIOWriteableSDK });
  };
}

interface GlobalStateInterface extends GlobalState, GlobalStateActions {}
export const useGlobalState = create<GlobalStateInterface>()((set, get) => ({
  ...initialGlobalState,
  ...new GlobalStateActionBase(set, get),
}));
