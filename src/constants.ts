import { DEVNET_PROGRAM_IDS } from '@ar.io/sdk/solana';
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

export const SOLANA_RPC_URL =
  'https://still-stylish-diagram.solana-devnet.quiknode.pro/7bb783112e4f06d72eeb7ca7125bbce97009438f/';
export const SOLANA_EXPLORER_URL = 'https://explorer.solana.com';

export const SOLANA_CORE_PROGRAM_ID = String(DEVNET_PROGRAM_IDS.core);
export const SOLANA_GAR_PROGRAM_ID = String(DEVNET_PROGRAM_IDS.gar);
export const SOLANA_ARNS_PROGRAM_ID = String(DEVNET_PROGRAM_IDS.arns);
export const SOLANA_ANT_PROGRAM_ID = String(DEVNET_PROGRAM_IDS.ant);

export const DEFAULT_ARWEAVE_PROTOCOL =
  import.meta.env.VITE_GATEWAY_PROTOCOL ?? 'https';
export const DEFAULT_ARWEAVE_HOST =
  import.meta.env.VITE_GATEWAY_HOST ?? 'arweave.net';

export const DEFAULT_ARWEAVE_GQL_ENDPOINT =
  import.meta.env.VITE_ARWEAVE_GQL_ENDPOINT ?? 'https://arweave.net/graphql';
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
  import.meta.env.VITE_REFERENCE_GATEWAY_FQDN ?? 'ar-io.net';

export const REDELEGATION_FEE_TOOLTIP_TEXT =
  'Redelegation fees are assessed at 10% per redelegation performed since the last fee reset, up to 60%. Fees are reset when no redelegations are performed in the last 7 days.';

export const BRIDGE_BALANCE_ADDRESS =
  'mFRKcHsO6Tlv2E2wZcrcbv3mmzxzD7vYPbyybI3KCVA';
