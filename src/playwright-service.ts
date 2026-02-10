import { chromium, Browser, Page } from 'playwright';
import { CONFIG } from './config.js';
import { logger } from './logger.js';

export class PlaywrightService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Playwright browser...');
      this.browser = await chromium.launch({
        headless: CONFIG.playwright.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.page = await this.browser.newPage();
      this.page.setDefaultTimeout(CONFIG.playwright.timeout);
      logger.info('Playwright browser initialized successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize Playwright');
      throw error;
    }
  }

  async navigate(url: string): Promise<string> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    try {
      logger.info({ url }, 'Navigating to URL');
      await this.page.goto(url, { waitUntil: 'networkidle' });
      const title = await this.page.title();
      logger.info({ title }, 'Navigation successful');
      return `Page Title: ${title}\n\nPage loaded successfully. Ready for further actions.`;
    } catch (error) {
      logger.error({ error, url }, 'Navigation failed');
      throw error;
    }
  }

  async screenshot(): Promise<Buffer> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    try {
      logger.info('Taking screenshot');
      const screenshot = await this.page.screenshot({ type: 'png', fullPage: true });
      return screenshot;
    } catch (error) {
      logger.error({ error }, 'Screenshot failed');
      throw error;
    }
  }

  async click(selector: string): Promise<string> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    try {
      logger.info({ selector }, 'Clicking element');
      await this.page.click(selector);
      return `Clicked on element: ${selector}`;
    } catch (error) {
      logger.error({ error, selector }, 'Click failed');
      throw error;
    }
  }

  async fill(selector: string, value: string): Promise<string> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    try {
      logger.info({ selector }, 'Filling input');
      await this.page.fill(selector, value);
      return `Filled input ${selector} with value`;
    } catch (error) {
      logger.error({ error, selector }, 'Fill failed');
      throw error;
    }
  }

  async getPageText(): Promise<string> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    try {
      const text = await this.page.innerText('body');
      return text.slice(0, 2000); // Limit to first 2000 chars
    } catch (error) {
      logger.error({ error }, 'Get page text failed');
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      logger.info('Playwright browser closed');
    } catch (error) {
      logger.error({ error }, 'Failed to close Playwright');
    }
  }
}
