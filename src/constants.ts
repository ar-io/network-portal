// import { createLogger, format, transports } from 'winston';
import { ARNS_TESTNET_REGISTRY_TX } from '@ar.io/sdk/web';



import { ArweaveTransactionID } from './utils/ArweaveTransactionId';


export const ARIO_DOCS_URL = 'https://docs.ar.io';
export const ARNS_REGISTRY_ADDRESS = new ArweaveTransactionID(
  process.env.VITE_ARNS_REGISTRY_ADDRESS ?? ARNS_TESTNET_REGISTRY_TX,
);
export const GATEWAY_CONTRACT_URL =
  `https://viewblock.io/arweave/contract/${ARNS_REGISTRY_ADDRESS.toString()}`;

export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// export const defaultLogger = createLogger({
//   level: 'info',
//   silent: false,
//   format: format.simple(),
//   transports: [new transports.Console()],
// });
