import { createLogger, format, transports } from 'winston';


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