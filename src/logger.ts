import pino from 'pino';
import { CONFIG } from './config.js';

export const logger = pino({
  level: CONFIG.logging.level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});
