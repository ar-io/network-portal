import { DEFAULT_ARWEAVE_GQL_ENDPOINT, SOLANA_RPC_URL } from '@src/constants';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type Settings = {
  solanaRpcUrl: string;
  arweaveGqlUrl: string;
  sidebarOpen: boolean;
};

const isLocalRpcUrl = (rpcUrl: string | undefined): boolean => {
  if (!rpcUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(rpcUrl);
    return (
      parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === 'localhost'
    );
  } catch {
    return rpcUrl.includes('127.0.0.1') || rpcUrl.includes('localhost');
  }
};

export const useSettings = create<Settings>()(
  subscribeWithSelector(
    persist(
      () => ({
        solanaRpcUrl: SOLANA_RPC_URL,
        arweaveGqlUrl: DEFAULT_ARWEAVE_GQL_ENDPOINT,
        sidebarOpen: true as boolean,
      }),
      {
        name: 'settings',
        merge: (persistedState, currentState) => {
          const mergedState = {
            ...currentState,
            ...(persistedState as Partial<Settings>),
          };

          // If a stale localhost RPC was persisted from prior localnet sessions,
          // prefer the env-provided RPC (devnet/mainnet) on next boot.
          if (
            isLocalRpcUrl(mergedState.solanaRpcUrl) &&
            !isLocalRpcUrl(SOLANA_RPC_URL)
          ) {
            mergedState.solanaRpcUrl = SOLANA_RPC_URL;
          }

          return mergedState;
        },
      },
    ),
  ),
);

export const updateSettings = useSettings.setState;
