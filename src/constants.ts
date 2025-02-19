import * as loglevel from 'loglevel';

import Ar from 'arweave/web/ar';
import { ArweaveTransactionID } from './utils/ArweaveTransactionId';

export const APP_NAME = 'AR-IO-Network-Portal-App';
export const APP_VERSION = process.env.npm_package_version || '1.0.0';
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
export const ARIO_PROCESS_ID = new ArweaveTransactionID(
  process.env.VITE_ARIO_PROCESS_ID ??
    // epoch not started yet ebLLp8uxMHv8l5_TiADYwmibh4FKZ0BzFJjIoBOpRho
    '7NWaybuVxRsLGEBORpS8FosmhLVcAyTLovWIM6NknjE',
  // epoch started 7NWaybuVxRsLGEBORpS8FosmhLVcAyTLovWIM6NknjE
);
export const AO_CU_URL = 'https://cu.ar-io.dev';
export const DEFAULT_ARWEAVE_PROTOCOL =
  process.env.VITE_GATEWAY_PROTOCOL ?? 'https';
export const DEFAULT_ARWEAVE_HOST =
  // process.env.VITE_GATEWAY_HOST ?? 'ar-io.dev';
  process.env.VITE_GATEWAY_HOST ?? 'arweave.net';
export const DEFAULT_ARWEAVE_PORT =
  Number(process.env.VITE_GATEWAY_PORT) ?? 443;

export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const AR = new Ar();

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
  process.env.VITE_REFERENCE_GATEWAY_FQDN ?? 'arweave.net';

export const GATEWAY_OPERATOR_STAKE_MINIMUM_ARIO = 10000;

export const REDELEGATION_FEE_TOOLTIP_TEXT =
  'Redelegation fees are assessed at 10% per redelegation performed since the last fee reset, up to 60%. Fees are reset when no redelegations are performed in the last 7 days.';
