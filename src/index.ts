import { validateConfig } from './config.js';
import { logger } from './logger.js';
import { TelegramBot } from './bot.js';
import http from 'http';
import { CONFIG } from './config.js';

async function main() {
  try {
    logger.info('Starting OpenClaw Railway Bot...');

    // Validate configuration
    validateConfig();
    logger.info('Configuration validated');

    // Create health check server for Railway
    const server = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(CONFIG.port, () => {
      logger.info({ port: CONFIG.port }, 'Health check server started');
    });

    // Initialize and start the bot
    const bot = new TelegramBot();
    await bot.start();

    logger.info('✅ OpenClaw Railway Bot is now running 24/7');
  } catch (error) {
    logger.error({ error }, 'Failed to start application');
    process.exit(1);
  }
}

main();
