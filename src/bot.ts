import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { OpenRouterService } from './openrouter-service.js';
import { PlaywrightService } from './playwright-service.js';

export class TelegramBot {
  private bot: Telegraf;
  private openRouter: OpenRouterService;
  private playwright: PlaywrightService;
  private activeSessions: Map<number, boolean> = new Map();

  constructor() {
    this.bot = new Telegraf(CONFIG.telegram.botToken);
    this.openRouter = new OpenRouterService();
    this.playwright = new PlaywrightService();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Start command
    this.bot.start((ctx) => {
      logger.info({ userId: ctx.from.id, username: ctx.from.username }, 'User started bot');
      ctx.reply(
        '🤖 Welcome to OpenClaw Railway Bot!\n\n' +
          'I am an enterprise-grade AI assistant powered by Claude 3.5 Sonnet with autonomous web navigation capabilities.\n\n' +
          'Commands:\n' +
          '/start - Show this welcome message\n' +
          '/help - Show help information\n' +
          '/clear - Clear conversation history\n' +
          '/browse <url> - Navigate to a website\n' +
          '/screenshot - Take a screenshot of current page\n' +
          '/status - Show bot status\n\n' +
          'Just send me a message to start chatting!'
      );
    });

    // Help command
    this.bot.help((ctx) => {
      ctx.reply(
        '📖 Help\n\n' +
          'This bot can:\n' +
          '✅ Have intelligent conversations\n' +
          '✅ Navigate and interact with websites\n' +
          '✅ Extract information from web pages\n' +
          '✅ Maintain context across multiple messages\n\n' +
          'Commands:\n' +
          '/start - Welcome message\n' +
          '/help - This help message\n' +
          '/clear - Clear conversation history\n' +
          '/browse <url> - Navigate to a website\n' +
          '/screenshot - Take screenshot\n' +
          '/status - Bot status\n\n' +
          'Example:\n' +
          '/browse https://example.com\n' +
          'Then ask: "What is on this page?"'
      );
    });

    // Clear command
    this.bot.command('clear', (ctx) => {
      this.openRouter.clearConversation(ctx.chat.id);
      ctx.reply('✅ Conversation history cleared!');
    });

    // Browse command
    this.bot.command('browse', async (ctx) => {
      const args = ctx.message.text.split(' ').slice(1);
      if (args.length === 0) {
        ctx.reply('❌ Please provide a URL. Example: /browse https://example.com');
        return;
      }

      const url = args[0];
      await ctx.reply(`🌐 Navigating to ${url}...`);

      try {
        // Initialize Playwright if not already done
        if (!this.activeSessions.get(ctx.chat.id)) {
          await this.playwright.initialize();
          this.activeSessions.set(ctx.chat.id, true);
        }

        const result = await this.playwright.navigate(url);
        await ctx.reply(`✅ ${result}`);
      } catch (error) {
        logger.error({ error, url }, 'Browse failed');
        await ctx.reply(`❌ Failed to navigate: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Screenshot command
    this.bot.command('screenshot', async (ctx) => {
      if (!this.activeSessions.get(ctx.chat.id)) {
        await ctx.reply('❌ No active browser session. Use /browse <url> first.');
        return;
      }

      await ctx.reply('📸 Taking screenshot...');

      try {
        const screenshot = await this.playwright.screenshot();
        await ctx.replyWithPhoto({ source: screenshot }, { caption: 'Current page screenshot' });
      } catch (error) {
        logger.error({ error }, 'Screenshot failed');
        await ctx.reply(`❌ Failed to take screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Status command
    this.bot.command('status', (ctx) => {
      const conversationCount = this.openRouter.getConversationCount();
      const hasActiveBrowser = this.activeSessions.get(ctx.chat.id) || false;

      ctx.reply(
        '📊 Bot Status\n\n' +
          `✅ Bot is online and operational\n` +
          `💬 Active conversations: ${conversationCount}\n` +
          `🌐 Browser session: ${hasActiveBrowser ? 'Active' : 'Inactive'}\n` +
          `🤖 Model: ${CONFIG.openRouter.model}`
      );
    });

    // Message handler
    this.bot.on(message('text'), async (ctx) => {
      const userMessage = ctx.message.text;
      const chatId = ctx.chat.id;

      logger.info({ userId: ctx.from.id, chatId, message: userMessage }, 'Received message');

      // Show typing indicator
      await ctx.sendChatAction('typing');

      try {
        // Check if message is asking for web interaction
        const needsWebContext = this.activeSessions.get(chatId) && 
          (userMessage.toLowerCase().includes('page') || 
           userMessage.toLowerCase().includes('website') ||
           userMessage.toLowerCase().includes('what do you see'));

        let systemPrompt = undefined;
        if (needsWebContext) {
          try {
            const pageText = await this.playwright.getPageText();
            systemPrompt = `You are viewing a web page. Here is the current page content (first 2000 chars):\n\n${pageText}\n\nAnswer the user's question based on this page content.`;
          } catch (error) {
            logger.warn({ error }, 'Could not get page text');
          }
        }

        const response = await this.openRouter.chat(chatId, userMessage, systemPrompt);

        // Split long messages if needed (Telegram has a 4096 char limit)
        if (response.length > 4000) {
          const chunks = this.splitMessage(response, 4000);
          for (const chunk of chunks) {
            await ctx.reply(chunk);
          }
        } else {
          await ctx.reply(response);
        }
      } catch (error) {
        logger.error({ error, chatId }, 'Failed to process message');
        await ctx.reply('❌ Sorry, I encountered an error processing your message. Please try again.');
      }
    });

    // Error handler
    this.bot.catch((err, ctx) => {
      logger.error({ error: err, ctx }, 'Bot error occurred');
    });
  }

  private splitMessage(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const lines = text.split('\n');
    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        // If a single line is too long, split it
        if (line.length > maxLength) {
          for (let i = 0; i < line.length; i += maxLength) {
            chunks.push(line.slice(i, i + maxLength));
          }
        } else {
          currentChunk = line;
        }
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting Telegram bot...');
      await this.bot.launch();
      logger.info('Telegram bot started successfully');

      // Enable graceful stop
      process.once('SIGINT', () => this.stop('SIGINT'));
      process.once('SIGTERM', () => this.stop('SIGTERM'));
    } catch (error) {
      logger.error({ error }, 'Failed to start bot');
      throw error;
    }
  }

  async stop(signal?: string): Promise<void> {
    logger.info({ signal }, 'Stopping bot...');
    this.bot.stop(signal);
    await this.playwright.close();
    logger.info('Bot stopped');
  }
}
