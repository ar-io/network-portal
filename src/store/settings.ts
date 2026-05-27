import {
  BRIDGE_BALANCE_ADDRESS,
  DEFAULT_ARWEAVE_GQL_ENDPOINT,
  SOLANA_ANT_PROGRAM_ID,
  SOLANA_ARNS_PROGRAM_ID,
  SOLANA_CORE_PROGRAM_ID,
  SOLANA_GAR_PROGRAM_ID,
  SOLANA_RPC_URL,
} from '@src/constants';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type Settings = {
  solanaRpcUrl: string;
  arweaveGqlUrl: string;
  sidebarOpen: boolean;
  solanaCoreProgramId: string;
  solanaGarProgramId: string;
  solanaArnsProgramId: string;
  solanaAntProgramId: string;
  bridgeBalanceAddress: string;
};

const DEFAULT_SETTINGS: Settings = {
  solanaRpcUrl: SOLANA_RPC_URL,
  arweaveGqlUrl: DEFAULT_ARWEAVE_GQL_ENDPOINT,
  sidebarOpen: true,
  solanaCoreProgramId: SOLANA_CORE_PROGRAM_ID ?? '',
  solanaGarProgramId: SOLANA_GAR_PROGRAM_ID ?? '',
  solanaArnsProgramId: SOLANA_ARNS_PROGRAM_ID ?? '',
  solanaAntProgramId: SOLANA_ANT_PROGRAM_ID ?? '',
  bridgeBalanceAddress: BRIDGE_BALANCE_ADDRESS,
};

const isLocalRpcUrl = (rpcUrl: string | undefined): boolean => {
  if (!rpcUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(rpcUrl);
    return /^(localhost|127\.0\.0\.1)$/.test(parsedUrl.hostname);
  } catch {
    return /(^|[:/?.#])(localhost|127\.0\.0\.1)(?=[:/?.#]|$)/.test(rpcUrl);
  }
};

export const useSettings = create<Settings>()(
  subscribeWithSelector(
    persist(() => DEFAULT_SETTINGS, {
      name: 'settings',
      merge: (persistedState, currentState) => {
        const mergedState = {
          ...currentState,
          ...(persistedState as Partial<Settings>),
        };

        // Keep app startup pinned to staging defaults regardless of stale
        // persisted values from previous environments.
        mergedState.solanaRpcUrl = SOLANA_RPC_URL;
        mergedState.solanaCoreProgramId = SOLANA_CORE_PROGRAM_ID ?? '';
        mergedState.solanaGarProgramId = SOLANA_GAR_PROGRAM_ID ?? '';
        mergedState.solanaArnsProgramId = SOLANA_ARNS_PROGRAM_ID ?? '';
        mergedState.solanaAntProgramId = SOLANA_ANT_PROGRAM_ID ?? '';

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
    }),
  ),
);

export const updateSettings = useSettings.setState;
