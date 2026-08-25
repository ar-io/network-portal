import { DEVNET_PROGRAM_IDS, MAINNET_PROGRAM_IDS } from '@ar.io/sdk/solana';
import * as loglevel from 'loglevel';

export const APP_NAME = 'AR-IO-Network-Portal-App';

export const APP_VERSION = __NPM_PACKAGE_VERSION__ || '1.0.0';
export const WRITE_OPTIONS = {
  tags: [
    {
      name: 'App-Name',
      value: APP_NAME,
    },
    { name: 'App-Version', value: APP_VERSION },
  ],
};
export const ARIO_DOCS_URL = 'https://docs.ar.io';

// The SDK's `getInfo()` returns this as a hardcoded literal (see
// `solana/io-readable.js`, `Ticker: 'ARIO'`) but spends two account reads —
// ArioConfig and EpochSettings — getting there. The portal only ever wanted the
// ticker, so it reads the constant and skips the round trip. If the SDK ever
// makes Ticker network-derived, this is the line to revert.
export const ARIO_TICKER = 'ARIO';

// RPC endpoints come from the environment. A provider URL carries an auth
// token, so it must never be committed — see .env.example.
//
// The fallbacks below are NOT equivalent, and only one of them works:
//
// - `api.devnet.solana.com` answers a browser normally. Heavily rate-limited,
//   but the app boots and a user can supply their own endpoint in Settings.
// - `api.mainnet-beta.solana.com` answers `403 Access forbidden` to ANY request
//   carrying an `Origin` header, which every browser request has. Measured: the
//   identical call returns 200 from curl (no Origin) and 403 with one. So an
//   unset mainnet secret does not degrade the app — it stops it loading at all,
//   because the current epoch can never be read.
//
// This is what the production `verify-secrets` gate is really protecting
// against; treat the mainnet fallback as a placeholder that keeps the module
// well-typed, not as a usable endpoint.
export const SOLANA_RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
export const SOLANA_MAINNET_RPC_URL =
  import.meta.env.VITE_SOLANA_MAINNET_RPC_URL ??
  'https://api.mainnet-beta.solana.com';

// Optional second endpoint for failover. Intentionally has no default: the SDK's
// `defaultFallbackUrl()` resolved to the public Solana RPC, and once the circuit
// opened the app pushed 100% of its traffic — whole-program scans included —
// there at a flat 10 req/s that no amount of 429s slowed down. Failing over is
// only safe to an endpoint we are entitled to hammer, so it must be opted into.
export const SOLANA_FALLBACK_RPC_URL =
  import.meta.env.VITE_SOLANA_FALLBACK_RPC_URL ?? '';
export const SOLANA_EXPLORER_URL = 'https://explorer.solana.com';

/**
 * Base URL of the portal snapshot API, e.g. https://network.services.ar.io
 *
 * Unset disables it entirely and every read goes straight to RPC — which is
 * how this shipped before, and remains the fallback whenever the API is
 * unreachable or its data is stale. It is a static JSON host, not a secret.
 */
export const PORTAL_API_URL = import.meta.env.VITE_PORTAL_API_URL ?? '';

/**
 * The two published network-services endpoints, offered as presets in Settings
 * so a user can flip between them the same way they flip the Solana RPC, or
 * type a custom one.
 *
 * Hardcoded fallbacks rather than required env: these host public JSON, carry
 * no credential, and the switcher should work on any build. They are only ever
 * *applied* by an explicit user action or by an existing selection following a
 * network switch — an unset `VITE_PORTAL_API_URL` still means the feature
 * starts off, which is what keeps removing the variable a real rollback.
 */
export const PORTAL_MAINNET_API_URL =
  import.meta.env.VITE_PORTAL_MAINNET_API_URL ??
  'https://network.services.ar.io';
export const PORTAL_DEVNET_API_URL =
  import.meta.env.VITE_PORTAL_DEVNET_API_URL ??
  'https://network.services.ar-io.dev';

export const DEVNET_SOLANA_CORE_PROGRAM_ID =
  import.meta.env.VITE_ARIO_CORE_PROGRAM_ID ?? String(DEVNET_PROGRAM_IDS.core);
export const DEVNET_SOLANA_GAR_PROGRAM_ID =
  import.meta.env.VITE_ARIO_GAR_PROGRAM_ID ?? String(DEVNET_PROGRAM_IDS.gar);
export const DEVNET_SOLANA_ARNS_PROGRAM_ID =
  import.meta.env.VITE_ARIO_ARNS_PROGRAM_ID ?? String(DEVNET_PROGRAM_IDS.arns);
export const DEVNET_SOLANA_ANT_PROGRAM_ID =
  import.meta.env.VITE_ARIO_ANT_PROGRAM_ID ?? String(DEVNET_PROGRAM_IDS.ant);

export const MAINNET_SOLANA_CORE_PROGRAM_ID = String(MAINNET_PROGRAM_IDS.core);
export const MAINNET_SOLANA_GAR_PROGRAM_ID = String(MAINNET_PROGRAM_IDS.gar);
export const MAINNET_SOLANA_ARNS_PROGRAM_ID = String(MAINNET_PROGRAM_IDS.arns);
export const MAINNET_SOLANA_ANT_PROGRAM_ID = String(MAINNET_PROGRAM_IDS.ant);

export const DEFAULT_ARWEAVE_PROTOCOL =
  import.meta.env.VITE_GATEWAY_PROTOCOL ?? 'https';
export const DEFAULT_ARWEAVE_HOST =
  import.meta.env.VITE_GATEWAY_HOST ?? 'turbo-gateway.com';

export const DEFAULT_ARWEAVE_GQL_ENDPOINT =
  import.meta.env.VITE_ARWEAVE_GQL_ENDPOINT ??
  'https://arweave-search.goldsky.com/graphql';
export const DEFAULT_ARWEAVE_PORT =
  Number(import.meta.env.VITE_GATEWAY_PORT) ?? 443;

export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Unicode non-breaking space that renders where &nbsp; does not in React code
export const NBSP = '\u00A0';

export const FQDN_REGEX = new RegExp(
  '^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{1,63}$',
);

export const ARNS_TX_ID_REGEX = new RegExp('^[a-zA-Z0-9\\-_s+]{43}$');

loglevel.setLevel('info');
export const log = loglevel;

export const EAY_TOOLTIP_TEXT =
  'EAY = Estimated yield ratio determined by projecting the current nominal reward conditions over the course of a year. Does NOT include potential observation rewards.';
export const EAY_TOOLTIP_FORMULA =
  '\\(EAY = \\frac{RewardsSharedPerEpoch}{TotalDelegatedStake} * EpochsPerYear\\)';

export const OPERATOR_EAY_TOOLTIP_FORMULA =
  '\\(EAY = \\frac{OperatorRewardsPerEpoch}{OperatorStake} * EpochsPerYear\\)';

// OBSERVATION ASSESSMENT CONSTANTS
export const NAME_PASS_THRESHOLD = 0.8;
export const REFERENCE_GATEWAY_FQDN =
  import.meta.env.VITE_REFERENCE_GATEWAY_FQDN ?? 'turbo-gateway.com';

export const REDELEGATION_FEE_TOOLTIP_TEXT =
  'Redelegation fees are assessed at 10% per redelegation performed since the last fee reset, up to 60%. Fees are reset when no redelegations are performed in the last 7 days.';

export const BRIDGE_BALANCE_ADDRESS =
  'mFRKcHsO6Tlv2E2wZcrcbv3mmzxzD7vYPbyybI3KCVA';
