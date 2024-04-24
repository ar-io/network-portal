import { createLogger, format, transports } from 'winston';


export const ARIO_DOCS_URL = 'https://docs.ar.io';
export const GATEWAY_CONTRACT_URL =
  'https://viewblock.io/arweave/contract/bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U';

export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const defaultLogger = createLogger({
      level: 'info',
      silent: false,
      format: format.simple(),
      transports: [new transports.Console()],
    })