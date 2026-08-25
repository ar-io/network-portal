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
  PORTAL_DEVNET_API_URL,
  PORTAL_MAINNET_API_URL,
  SOLANA_MAINNET_RPC_URL,
  SOLANA_RPC_URL,
} from '@src/constants';
import { updateSettings, useSettings } from '@src/store';
import { isValidSolanaAddress } from '@src/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import BaseModal from './BaseModal';

const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/** Empty is a valid choice: it turns the snapshot reads off entirely. */
const isValidPortalApiUrl = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' || isValidHttpUrl(trimmed);
};

type SolanaAddressSettings = {
  solanaCoreProgramId: string;
  solanaGarProgramId: string;
  solanaArnsProgramId: string;
  solanaAntProgramId: string;
  bridgeBalanceAddress: string;
};

type SolanaNetworkTier = 'localnet' | 'mainnet' | 'devnet' | 'testnet';

const isValidOptionalSolanaAddress = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed === '' || isValidSolanaAddress(trimmed);
};

const isValidRequiredSolanaAddress = (value: string): boolean => {
  return isValidSolanaAddress(value.trim());
};

const isValidRequiredText = (value: string): boolean => {
  return value.trim().length > 0;
};

const SOLANA_ADDRESS_FIELDS: Array<{
  key: keyof SolanaAddressSettings;
  label: string;
  defaultValue: string;
  validation: 'solanaOptional' | 'solanaRequired' | 'textRequired';
}> = [
  {
    key: 'solanaCoreProgramId',
    label: 'Solana Core Program ID',
    defaultValue: DEVNET_SOLANA_CORE_PROGRAM_ID ?? '',
    validation: 'solanaOptional',
  },
  {
    key: 'solanaGarProgramId',
    label: 'Solana GAR Program ID',
    defaultValue: DEVNET_SOLANA_GAR_PROGRAM_ID ?? '',
    validation: 'solanaOptional',
  },
  {
    key: 'solanaArnsProgramId',
    label: 'Solana ARNS Program ID',
    defaultValue: DEVNET_SOLANA_ARNS_PROGRAM_ID ?? '',
    validation: 'solanaOptional',
  },
  {
    key: 'solanaAntProgramId',
    label: 'Solana ANT Program ID',
    defaultValue: DEVNET_SOLANA_ANT_PROGRAM_ID ?? '',
    validation: 'solanaOptional',
  },
  {
    key: 'bridgeBalanceAddress',
    label: 'Bridge Balance Address',
    defaultValue: BRIDGE_BALANCE_ADDRESS,
    validation: 'textRequired',
  },
];

const getDevnetSolanaAddressSettings = (): SolanaAddressSettings => ({
  solanaCoreProgramId: DEVNET_SOLANA_CORE_PROGRAM_ID ?? '',
  solanaGarProgramId: DEVNET_SOLANA_GAR_PROGRAM_ID ?? '',
  solanaArnsProgramId: DEVNET_SOLANA_ARNS_PROGRAM_ID ?? '',
  solanaAntProgramId: DEVNET_SOLANA_ANT_PROGRAM_ID ?? '',
  bridgeBalanceAddress: BRIDGE_BALANCE_ADDRESS,
});

const getMainnetSolanaAddressSettings = (): SolanaAddressSettings => ({
  solanaCoreProgramId: MAINNET_SOLANA_CORE_PROGRAM_ID,
  solanaGarProgramId: MAINNET_SOLANA_GAR_PROGRAM_ID,
  solanaArnsProgramId: MAINNET_SOLANA_ARNS_PROGRAM_ID,
  solanaAntProgramId: MAINNET_SOLANA_ANT_PROGRAM_ID,
  bridgeBalanceAddress: BRIDGE_BALANCE_ADDRESS,
});

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

const getDefaultSolanaAddressSettingsForRpcUrl = (
  rpcUrl: string,
): SolanaAddressSettings => {
  const networkTier = getNetworkTierFromRpcUrl(rpcUrl);
  return networkTier === 'mainnet'
    ? getMainnetSolanaAddressSettings()
    : getDevnetSolanaAddressSettings();
};

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const solanaRpcUrl = useSettings((state) => state.solanaRpcUrl);
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const arweaveGqlUrl = useSettings((state) => state.arweaveGqlUrl);
  const solanaCoreProgramId = useSettings((state) => state.solanaCoreProgramId);
  const solanaGarProgramId = useSettings((state) => state.solanaGarProgramId);
  const solanaArnsProgramId = useSettings((state) => state.solanaArnsProgramId);
  const solanaAntProgramId = useSettings((state) => state.solanaAntProgramId);
  const bridgeBalanceAddress = useSettings(
    (state) => state.bridgeBalanceAddress,
  );

  const [localRpcUrl, setLocalRpcUrl] = useState(solanaRpcUrl);
  const [localPortalApiUrl, setLocalPortalApiUrl] = useState(portalApiUrl);
  const [localGqlUrl, setLocalGqlUrl] = useState(arweaveGqlUrl);
  const [localSolanaAddressSettings, setLocalSolanaAddressSettings] =
    useState<SolanaAddressSettings>({
      solanaCoreProgramId,
      solanaGarProgramId,
      solanaArnsProgramId,
      solanaAntProgramId,
      bridgeBalanceAddress,
    });

  const currentSolanaAddressSettings: SolanaAddressSettings = {
    solanaCoreProgramId,
    solanaGarProgramId,
    solanaArnsProgramId,
    solanaAntProgramId,
    bridgeBalanceAddress,
  };

  const hasChangedSolanaAddressSettings = SOLANA_ADDRESS_FIELDS.some(
    ({ key }) =>
      localSolanaAddressSettings[key] !== currentSolanaAddressSettings[key],
  );
  const hasInvalidSolanaAddressSettings = SOLANA_ADDRESS_FIELDS.some(
    ({ key, validation }) => {
      const value = localSolanaAddressSettings[key];
      if (validation === 'solanaRequired') {
        return !isValidRequiredSolanaAddress(value);
      }
      if (validation === 'textRequired') {
        return !isValidRequiredText(value);
      }
      return !isValidOptionalSolanaAddress(value);
    },
  );

  const activeNetworkTier = getNetworkTierFromRpcUrl(solanaRpcUrl);

  const trimmedPortalApiUrl = portalApiUrl.trim();
  const activePortalPreset =
    trimmedPortalApiUrl.length === 0
      ? 'off'
      : trimmedPortalApiUrl === PORTAL_MAINNET_API_URL
        ? 'mainnet'
        : trimmedPortalApiUrl === PORTAL_DEVNET_API_URL
          ? 'devnet'
          : 'custom';

  const PORTAL_PRESET_LABEL: Record<string, string> = {
    off: 'Off — reading from RPC',
    mainnet: 'Mainnet',
    devnet: 'Devnet',
    custom: 'Custom',
  };

  const switchNetwork = (network: 'devnet' | 'mainnet') => {
    const nextRpcUrl =
      network === 'mainnet' ? SOLANA_MAINNET_RPC_URL : SOLANA_RPC_URL;
    const nextAddressSettings =
      getDefaultSolanaAddressSettingsForRpcUrl(nextRpcUrl);

    // Follow the network with the endpoint, but only if one is actually in
    // use. An empty value means the user (or the build) has the snapshot reads
    // switched off, and switching networks is not a request to turn them on.
    const nextPortalApiUrl =
      portalApiUrl.trim().length === 0
        ? portalApiUrl
        : network === 'mainnet'
          ? PORTAL_MAINNET_API_URL
          : PORTAL_DEVNET_API_URL;

    updateSettings({
      solanaRpcUrl: nextRpcUrl,
      portalApiUrl: nextPortalApiUrl,
      ...nextAddressSettings,
    });

    setLocalRpcUrl(nextRpcUrl);
    setLocalPortalApiUrl(nextPortalApiUrl);
    setLocalSolanaAddressSettings(nextAddressSettings);
  };

  /**
   * Saving a new endpoint has to invalidate the cache by hand. Unlike the RPC
   * URL, which is part of every query key and so changes them, the endpoint is
   * read inside the fetch — nothing about the keys changes, and without this
   * the switch appears to do nothing until a reload.
   */
  const applyPortalApiUrl = (nextUrl: string) => {
    updateSettings({ portalApiUrl: nextUrl });
    setLocalPortalApiUrl(nextUrl);
    queryClient.invalidateQueries();
  };

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="h-[42rem] w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]">
        <div className="flex h-full w-full flex-col px-8 pb-4 pt-6">
          <div className="text-lg text-high">Settings</div>

          <div className="mt-4 flex grow flex-col gap-6 overflow-y-auto pr-1 text-sm text-mid scrollbar">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="grow">Network</div>
                <div className="text-xs text-low">
                  Active:{' '}
                  {activeNetworkTier === 'mainnet' ? 'Mainnet' : 'Devnet'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    switchNetwork('mainnet');
                  }}
                  disabled={activeNetworkTier === 'mainnet'}
                >
                  Switch to Mainnet
                </button>
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    switchNetwork('devnet');
                  }}
                  disabled={activeNetworkTier === 'devnet'}
                >
                  Switch to Devnet
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="grow">Solana RPC URL</div>
              </div>
              <div className="flex items-center">
                <input
                  className="w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none"
                  value={localRpcUrl}
                  onChange={(e) => {
                    setLocalRpcUrl(e.target.value);
                  }}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    updateSettings({ solanaRpcUrl: localRpcUrl });
                  }}
                  disabled={
                    localRpcUrl === solanaRpcUrl || !isValidHttpUrl(localRpcUrl)
                  }
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="grow">Network Services URL</div>
                <div className="text-xs text-low">
                  Active: {PORTAL_PRESET_LABEL[activePortalPreset]}
                </div>
              </div>
              <div className="text-xs text-low">
                Serves gateways, balances and other network-wide data as
                published snapshots. When off, or whenever it is unreachable or
                stale, these are read directly from RPC.
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    applyPortalApiUrl(PORTAL_MAINNET_API_URL);
                  }}
                  disabled={activePortalPreset === 'mainnet'}
                >
                  Mainnet
                </button>
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    applyPortalApiUrl(PORTAL_DEVNET_API_URL);
                  }}
                  disabled={activePortalPreset === 'devnet'}
                >
                  Devnet
                </button>
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    applyPortalApiUrl('');
                  }}
                  disabled={activePortalPreset === 'off'}
                >
                  Turn Off
                </button>
              </div>

              <div className="flex items-center">
                <input
                  className="w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none"
                  value={localPortalApiUrl}
                  placeholder="https://network.services.ar.io"
                  onChange={(e) => {
                    setLocalPortalApiUrl(e.target.value);
                  }}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    applyPortalApiUrl(localPortalApiUrl.trim());
                  }}
                  disabled={
                    localPortalApiUrl.trim() === trimmedPortalApiUrl ||
                    !isValidPortalApiUrl(localPortalApiUrl)
                  }
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <div className="grow">Solana Program/Token Addresses</div>

                <button
                  className="rounded border border-grey-500 bg-streak-up px-4 py-2 text-xs text-containerL0"
                  onClick={() => {
                    switchNetwork('mainnet');
                  }}
                >
                  Reset to Defaults
                </button>
              </div>

              {SOLANA_ADDRESS_FIELDS.map(
                ({ key, label, defaultValue, validation }) => {
                  const value = localSolanaAddressSettings[key];
                  const isValid =
                    validation === 'solanaRequired'
                      ? isValidRequiredSolanaAddress(value)
                      : validation === 'textRequired'
                        ? isValidRequiredText(value)
                        : isValidOptionalSolanaAddress(value);

                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-xs text-low">{label}</label>
                      <input
                        className={`w-full rounded border bg-containerL0 px-4 py-2 text-mid focus:outline-none ${
                          isValid ? 'border-grey-500' : 'border-red-500'
                        }`}
                        placeholder={
                          validation === 'solanaRequired' ||
                          validation === 'textRequired'
                            ? defaultValue
                            : defaultValue || 'Leave empty to use SDK default'
                        }
                        value={value}
                        onChange={(e) => {
                          setLocalSolanaAddressSettings((current) => ({
                            ...current,
                            [key]: e.target.value,
                          }));
                        }}
                      />
                      {!isValid ? (
                        <div className="text-xs text-red-400">
                          {validation === 'textRequired'
                            ? 'A value is required.'
                            : validation === 'solanaRequired'
                              ? 'A valid Solana address is required.'
                              : 'Must be a valid Solana address or left empty.'}
                        </div>
                      ) : null}
                    </div>
                  );
                },
              )}

              <div className="flex justify-end">
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    updateSettings(localSolanaAddressSettings);
                  }}
                  disabled={
                    !hasChangedSolanaAddressSettings ||
                    hasInvalidSolanaAddressSettings
                  }
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="grow">Arweave GQL URL</div>

                <button
                  className="rounded border border-grey-500 bg-streak-up px-4 py-2 text-xs text-containerL0"
                  onClick={() => {
                    setLocalGqlUrl(DEFAULT_ARWEAVE_GQL_ENDPOINT);
                  }}
                >
                  Reset to Default
                </button>
              </div>
              <div className="flex items-center">
                <input
                  className="w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none"
                  value={localGqlUrl}
                  onChange={(e) => {
                    setLocalGqlUrl(e.target.value);
                  }}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low"
                  onClick={() => {
                    updateSettings({ arweaveGqlUrl: localGqlUrl });
                  }}
                  disabled={
                    localGqlUrl === arweaveGqlUrl ||
                    !isValidHttpUrl(localGqlUrl)
                  }
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default SettingsModal;
