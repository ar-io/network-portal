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
import pLimit from 'p-limit';
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

// Limit concurrent RPC requests to avoid 429 rate limiting.
// The SDK fans out many parallel calls internally (e.g. getEpoch makes
// 3 + N calls where N = number of observers), so without a limiter a
// single page load can fire 100+ simultaneous HTTP requests.
const rpcLimiter = pLimit(10);

/**
 * Wrap a Solana RPC instance so every `.send()` call goes through a
 * shared concurrency limiter.  This is transparent to the SDK — it
 * receives a normal `Rpc<SolanaRpcApi>` whose methods return pending
 * requests, but those requests queue behind the limiter when sent.
 */
const withConcurrencyLimit = (rpc: Rpc<SolanaRpcApi>): Rpc<SolanaRpcApi> =>
  new Proxy(rpc, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;

      return (...args: unknown[]) => {
        const pending = (value as (...a: unknown[]) => unknown).apply(
          target,
          args,
        );

        // RPC methods return a "pending request" object with a .send() method.
        // Wrap .send() so it goes through the limiter.
        if (
          pending &&
          typeof pending === 'object' &&
          'send' in pending &&
          typeof (pending as any).send === 'function'
        ) {
          const origSend = (pending as any).send;
          return new Proxy(pending as object, {
            get(t, p, r) {
              if (p === 'send') {
                return (...sendArgs: unknown[]) =>
                  rpcLimiter(() => origSend.apply(t, sendArgs));
              }
              return Reflect.get(t, p, r);
            },
          });
        }

        return pending;
      };
    },
  }) as Rpc<SolanaRpcApi>;

const makeRpc = (rpcUrl: string) =>
  withConcurrencyLimit(
    createCircuitBreakerRpc({
      primaryUrl: rpcUrl,
      fallbackUrl: defaultFallbackUrl(rpcUrl),
    }) as Rpc<SolanaRpcApi>,
  );

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
