import type { SolanaARIOWriteable, SolanaRpc } from '@ar.io/sdk/solana';
import {
  ARIO,
  ARIORead,
  EpochData,
  createCircuitBreakerRpc,
  defaultFallbackUrl,
} from '@ar.io/sdk/web';
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
  arIOReadSDK: ARIORead;
  arIOWriteableSDK?: SolanaARIOWriteable;
  solanaSlot?: number;
  currentEpoch?: EpochData;
  walletAddress?: AoAddress;
  walletStateInitialized: boolean;
  ticker: string;
  networkPortalDB: NetworkPortalDB;
  isMobile: boolean;
};

type GlobalStateActions = {
  setTheme: (theme: ThemeType) => void;
  setSolanaSlot: (slot: number) => void;
  setCurrentEpoch: (currentEpoch: EpochData) => void;
  updateWallet: (walletAddress?: AoAddress) => void;
  setWalletStateInitialized: (initialized: boolean) => void;
  setTicker: (ticker: string) => void;
  setIsMobile: (isMobile: boolean) => void;
  setWriteSDK: (sdk?: SolanaARIOWriteable) => void;
};

/** Memoised kit RPC client with circuit breaker, rebuilt when the RPC URL changes. */
let _rpc: any | null = null;
let _rpcUrl: string | null = null;
export function getSolanaRpc(rpcUrl: string) {
  if (!_rpc || _rpcUrl !== rpcUrl) {
    _rpc = createCircuitBreakerRpc({
      primaryUrl: rpcUrl,
      fallbackUrl: defaultFallbackUrl(rpcUrl),
    });
    _rpcUrl = rpcUrl;
  }
  return _rpc;
}

const makeRpc = (rpcUrl: string) => getSolanaRpc(rpcUrl);

const getNetworkTierFromRpcUrl = (
  rpcUrl: string,
): 'localnet' | 'mainnet' | 'devnet' | 'testnet' => {
  const inferFromText = (value: string) => {
    const lowerValue = value.toLowerCase();

    if (lowerValue.includes('localhost') || lowerValue.includes('127.0.0.1')) {
      return 'localnet';
    }

    if (lowerValue.includes('devnet')) {
      return 'devnet';
    }

    if (lowerValue.includes('testnet')) {
      return 'testnet';
    }

    return 'mainnet';
  };

  try {
    const parsedUrl = new URL(rpcUrl);
    return inferFromText(`${parsedUrl.hostname}${parsedUrl.pathname}`);
  } catch {
    return inferFromText(rpcUrl);
  }
};

const getDbNameFromRpcUrl = (rpcUrl: string) =>
  `solana-${getNetworkTierFromRpcUrl(rpcUrl)}`;

const makeArIOReadSDK = (rpc: Rpc<SolanaRpcApi>): ARIORead => {
  const settings = useSettings.getState();
  const coreProgramId = getOptionalSolanaAddress(settings.solanaCoreProgramId);
  const garProgramId = getOptionalSolanaAddress(settings.solanaGarProgramId);
  const arnsProgramId = getOptionalSolanaAddress(settings.solanaArnsProgramId);

  return ARIO.init({
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
  networkPortalDB: createDb(getDbNameFromRpcUrl(initialSolanaRpcUrl)),
  isMobile: window.innerWidth < 1024,
};

class GlobalStateActionBase implements GlobalStateActions {
  constructor(
    private set: (props: Partial<GlobalState>, replace?: boolean) => void,
    get: () => GlobalStateInterface,
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
        const currentDb = get().networkPortalDB;
        const nextDbName = getDbNameFromRpcUrl(solanaRpcUrl);
        const nextDb =
          currentDb.name === nextDbName ? currentDb : createDb(nextDbName);

        if (nextDb !== currentDb) {
          currentDb.close();
        }

        set({
          rpc,
          solanaRpcUrl,
          arIOReadSDK,
          arIOWriteableSDK: undefined,
          networkPortalDB: nextDb,
        });
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

  setCurrentEpoch = (currentEpoch: EpochData) => {
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
