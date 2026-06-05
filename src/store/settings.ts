import {
  BRIDGE_BALANCE_ADDRESS,
  DEFAULT_ARWEAVE_GQL_ENDPOINT,
  DEVNET_SOLANA_ANT_PROGRAM_ID,
  DEVNET_SOLANA_ARNS_PROGRAM_ID,
  DEVNET_SOLANA_CORE_PROGRAM_ID,
  DEVNET_SOLANA_GAR_PROGRAM_ID,
  MAINNET_SOLANA_ANT_PROGRAM_ID,
  MAINNET_SOLANA_ARNS_PROGRAM_ID,
  MAINNET_SOLANA_CORE_PROGRAM_ID,
  MAINNET_SOLANA_GAR_PROGRAM_ID,
  SOLANA_MAINNET_RPC_URL,
  SOLANA_RPC_URL,
} from '@src/constants';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type SolanaAddressSettings = {
  solanaCoreProgramId: string;
  solanaGarProgramId: string;
  solanaArnsProgramId: string;
  solanaAntProgramId: string;
  bridgeBalanceAddress: string;
};

type SolanaNetworkTier = 'localnet' | 'mainnet' | 'devnet' | 'testnet';

type Settings = {
  solanaRpcUrl: string;
  arweaveGqlUrl: string;
  sidebarOpen: boolean;
  solanaAddressSettingsByNetwork: Record<
    string,
    Partial<SolanaAddressSettings>
  >;
} & SolanaAddressSettings;

const SOLANA_ADDRESS_SETTING_KEYS: Array<keyof SolanaAddressSettings> = [
  'solanaCoreProgramId',
  'solanaGarProgramId',
  'solanaArnsProgramId',
  'solanaAntProgramId',
  'bridgeBalanceAddress',
];

const getNetworkTierFromRpcUrl = (rpcUrl: string): SolanaNetworkTier => {
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

const getDefaultSolanaAddressSettings = (
  networkTier: SolanaNetworkTier,
): SolanaAddressSettings => {
  if (networkTier === 'mainnet') {
    return {
      solanaCoreProgramId: MAINNET_SOLANA_CORE_PROGRAM_ID,
      solanaGarProgramId: MAINNET_SOLANA_GAR_PROGRAM_ID,
      solanaArnsProgramId: MAINNET_SOLANA_ARNS_PROGRAM_ID,
      solanaAntProgramId: MAINNET_SOLANA_ANT_PROGRAM_ID,
      bridgeBalanceAddress: BRIDGE_BALANCE_ADDRESS,
    };
  }

  return {
    solanaCoreProgramId: DEVNET_SOLANA_CORE_PROGRAM_ID ?? '',
    solanaGarProgramId: DEVNET_SOLANA_GAR_PROGRAM_ID ?? '',
    solanaArnsProgramId: DEVNET_SOLANA_ARNS_PROGRAM_ID ?? '',
    solanaAntProgramId: DEVNET_SOLANA_ANT_PROGRAM_ID ?? '',
    bridgeBalanceAddress: BRIDGE_BALANCE_ADDRESS,
  };
};

const getSolanaSettingsNetworkKey = (rpcUrl: string): string => {
  const normalizedRpcUrl = rpcUrl.trim();
  try {
    const parsedUrl = new URL(normalizedRpcUrl);
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`.toLowerCase();
  } catch {
    return normalizedRpcUrl.toLowerCase();
  }
};

const getSolanaAddressSettingsForNetwork = (
  state: Partial<Settings>,
  networkKey: string,
  rpcUrl: string,
  includeTopLevelFallback = false,
): SolanaAddressSettings => {
  const defaults = getDefaultSolanaAddressSettings(
    getNetworkTierFromRpcUrl(rpcUrl),
  );
  const networkSettings =
    state.solanaAddressSettingsByNetwork?.[networkKey] ?? {};

  return SOLANA_ADDRESS_SETTING_KEYS.reduce<SolanaAddressSettings>(
    (settings, key) => ({
      ...settings,
      [key]:
        networkSettings[key] ??
        (includeTopLevelFallback && Object.hasOwn(state, key)
          ? state[key]
          : undefined) ??
        defaults[key],
    }),
    defaults,
  );
};

const getSolanaAddressSettingsPatch = (
  settings: Partial<Settings>,
): Partial<SolanaAddressSettings> => {
  return SOLANA_ADDRESS_SETTING_KEYS.reduce<Partial<SolanaAddressSettings>>(
    (patch, key) => {
      if (Object.hasOwn(settings, key)) {
        return {
          ...patch,
          [key]: settings[key],
        };
      }

      return patch;
    },
    {},
  );
};

const DEFAULT_SETTINGS: Settings = {
  solanaRpcUrl: SOLANA_MAINNET_RPC_URL,
  arweaveGqlUrl: DEFAULT_ARWEAVE_GQL_ENDPOINT,
  sidebarOpen: true,
  solanaAddressSettingsByNetwork: {},
  ...getDefaultSolanaAddressSettings(
    getNetworkTierFromRpcUrl(SOLANA_MAINNET_RPC_URL),
  ),
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
        const persistedSettings = (persistedState ?? {}) as Partial<Settings>;
        const mergedState = {
          ...currentState,
          ...persistedSettings,
          solanaAddressSettingsByNetwork: {
            ...currentState.solanaAddressSettingsByNetwork,
            ...persistedSettings.solanaAddressSettingsByNetwork,
          },
        };

        const previousSolanaRpcUrl = mergedState.solanaRpcUrl;
        const networkTierChanged =
          isLocalRpcUrl(previousSolanaRpcUrl) !== isLocalRpcUrl(SOLANA_RPC_URL);

        if (networkTierChanged) {
          mergedState.solanaRpcUrl = SOLANA_RPC_URL;
        }

        const networkKey = getSolanaSettingsNetworkKey(
          mergedState.solanaRpcUrl,
        );
        const solanaAddressSettings = networkTierChanged
          ? getDefaultSolanaAddressSettings(
              getNetworkTierFromRpcUrl(SOLANA_RPC_URL),
            )
          : getSolanaAddressSettingsForNetwork(
              persistedSettings,
              networkKey,
              mergedState.solanaRpcUrl,
              true,
            );

        return {
          ...mergedState,
          solanaAddressSettingsByNetwork: {
            ...mergedState.solanaAddressSettingsByNetwork,
            [networkKey]: solanaAddressSettings,
          },
          ...solanaAddressSettings,
        };
      },
    }),
  ),
);

export const updateSettings = (settings: Partial<Settings>) => {
  const solanaAddressSettingsPatch = getSolanaAddressSettingsPatch(settings);
  const hasSolanaAddressSettingsPatch =
    Object.keys(solanaAddressSettingsPatch).length > 0;

  useSettings.setState((currentState) => {
    const nextSolanaRpcUrl = settings.solanaRpcUrl ?? currentState.solanaRpcUrl;
    const nextNetworkKey = getSolanaSettingsNetworkKey(nextSolanaRpcUrl);
    const nextNetworkSolanaAddressSettings = hasSolanaAddressSettingsPatch
      ? {
          ...currentState.solanaAddressSettingsByNetwork[nextNetworkKey],
          ...solanaAddressSettingsPatch,
        }
      : currentState.solanaAddressSettingsByNetwork[nextNetworkKey];

    return {
      ...(settings.solanaRpcUrl
        ? getSolanaAddressSettingsForNetwork(
            currentState,
            nextNetworkKey,
            nextSolanaRpcUrl,
          )
        : {}),
      ...settings,
      solanaAddressSettingsByNetwork: {
        ...currentState.solanaAddressSettingsByNetwork,
        ...(nextNetworkSolanaAddressSettings
          ? { [nextNetworkKey]: nextNetworkSolanaAddressSettings }
          : {}),
      },
    };
  });
};
