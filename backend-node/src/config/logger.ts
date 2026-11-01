import pino from 'pino';
import { env } from './env';

export const loggerConfig = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
          },
        }
      : undefined,
};

export const logger = pino(loggerConfig);
