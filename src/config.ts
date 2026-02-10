import { config } from 'dotenv';

config();

export const CONFIG = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
    baseURL: 'https://openrouter.ai/api/v1',
  },
  playwright: {
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  port: parseInt(process.env.PORT || '3000', 10),
};

export function validateConfig(): void {
  const errors: string[] = [];

  if (!CONFIG.telegram.botToken) {
    errors.push('TELEGRAM_BOT_TOKEN is required');
  }

  if (!CONFIG.openRouter.apiKey) {
    errors.push('OPENROUTER_API_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
