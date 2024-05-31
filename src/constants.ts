// import { createLogger, format, transports } from 'winston';
import { ARNS_DEVNET_REGISTRY_TX } from '@ar.io/sdk/web';

import { ArweaveTransactionID } from './utils/ArweaveTransactionId';

export const ARIO_DOCS_URL = 'https://docs.ar.io';
export const ARNS_REGISTRY_ADDRESS = new ArweaveTransactionID(
  process.env.VITE_ARNS_REGISTRY_ADDRESS ?? ARNS_DEVNET_REGISTRY_TX,
);
export const IO_PROCESS_ID = new ArweaveTransactionID(
    'GaQrvEMKBpkjofgnBi_B3IgIDmY_XYelVLB6GcRGrHc',
);
export const GATEWAY_CONTRACT_URL = `https://viewblock.io/arweave/contract/${ARNS_REGISTRY_ADDRESS.toString()}`;

export const DEFAULT_ARWEAVE_PROTOCOL = process.env.VITE_GATEWAY_PROTOCOL ?? 'https';
export const DEFAULT_ARWEAVE_HOST = process.env.VITE_GATEWAY_HOST ?? 'ar-io.dev';
export const DEFAULT_ARWEAVE_PORT = Number(process.env.VITE_GATEWAY_PORT) ?? 443;

export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Unicode non-breaking space that renders where &nbsp; does not in React code
export const NBSP = '\u00A0';

export const FQDN_REGEX = new RegExp(
  '^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{1,63}$',
);

// export const defaultLogger = createLogger({
//   level: 'info',
//   silent: false,
//   format: format.simple(),
//   transports: [new transports.Console()],
// });
