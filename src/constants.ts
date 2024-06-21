import { ARNS_DEVNET_REGISTRY_TX, ioDevnetProcessId } from '@ar.io/sdk/web';
import * as loglevel from 'loglevel';

import { ArweaveTransactionID } from './utils/ArweaveTransactionId';

export const APP_NAME = 'AR-IO-Network-Portal-App';
export const APP_VERSION = '1.0.0';
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
export const ARNS_REGISTRY_ADDRESS = new ArweaveTransactionID(
  process.env.VITE_ARNS_REGISTRY_ADDRESS ?? ARNS_DEVNET_REGISTRY_TX,
);
export const IO_PROCESS_ID = new ArweaveTransactionID(
  process.env.VITE_IO_PROCESS_ID ?? ioDevnetProcessId,
);

export const IO_PROCESS_INFO_URL = `https://www.ao.link/#/entity/${IO_PROCESS_ID.toString()}`;

export const DEFAULT_ARWEAVE_PROTOCOL =
  process.env.VITE_GATEWAY_PROTOCOL ?? 'https';
export const DEFAULT_ARWEAVE_HOST =
  process.env.VITE_GATEWAY_HOST ?? 'ar-io.dev';
export const DEFAULT_ARWEAVE_PORT =
  Number(process.env.VITE_GATEWAY_PORT) ?? 443;

export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Unicode non-breaking space that renders where &nbsp; does not in React code
export const NBSP = '\u00A0';

export const FQDN_REGEX = new RegExp(
  '^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{1,63}$',
);

loglevel.setLevel('info');
export const log = loglevel;

export const EAY_TOOLTIP_TEXT =
  'EAY = Estimated yield ratio determined by projecting the current nominal reward conditions over the course of a year. Does NOT include potential observation rewards.';

export const IO_LABEL = 'tIO';
