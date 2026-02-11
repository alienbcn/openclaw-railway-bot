/**
 * Integración MCP Playwright para navegación autónoma
 * Permite al bot navegar por internet, extraer datos y realizar clics
 */

import { chromium, Browser, Page } from "playwright";
import axios from "axios";
import { config } from "../config.js";

export interface BrowserOptions {
  headless?: boolean;
  browser?: "chromium" | "firefox" | "webkit" | "brave";
}

export interface NavigationResult {
  success: boolean;
  url: string;
  title: string;
  content: string;
  timestamp: Date;
}

export class PlaywrightMCP {
  private options: BrowserOptions;
  private initialized: boolean = false;
  private browser: Browser | null = null;

  constructor(options: BrowserOptions = {}) {
    this.options = {
      headless: options.headless ?? config.mcp.playwright.headless,
      browser: (options.browser ?? config.mcp.playwright.browser) as any,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("🎭 Inicializando Playwright MCP...");

      // Configurar argumentos para Railway (contenedor Linux)
      const browserArgs = [
        "--no-sandbox", // Requerido para Railway/Docker
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Para evitar problemas de memoria en contenedores
        "--disable-gpu",
      ];

      this.browser = await chromium.launch({
        headless: this.options.headless ?? true,
        args: browserArgs,
      });

      this.initialized = true;
      console.log("✅ Playwright MCP inicializado");
    } catch (error) {
      console.error("Error inicializando Playwright:", error);
      throw error;
    }
  }

  async navigate(url: string): Promise<NavigationResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    let page: Page | null = null;
    try {
      console.log(`🌐 Navegando a: ${url}`);

      if (!this.browser) {
        throw new Error("Browser no inicializado");
      }

      page = await this.browser.newPage();

      // Navegar con timeout
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      const title = await page.title();
      const content = await page.content();

      return {
        success: true,
        url,
        title,
        content,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error navegando a ${url}:`, error);
      return {
        success: false,
        url,
        title: "Error",
        content: `Error al navegar: ${error}`,
        timestamp: new Date(),
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Extrae la noticia principal de El País
   */
  async scrapeElPais(): Promise<{
    success: boolean;
    headline: string;
    url: string;
    timestamp: string;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    let page: Page | null = null;
    try {
      if (!this.browser) {
        throw new Error("Browser no inicializado");
      }

      page = await this.browser.newPage();

      await page.goto("https://elpais.com", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Extrae el titular principal
      const headline = await page.evaluate(() => {
        // Busca el primer titular de noticia en el navegador
        const headlineEl =
          document.querySelector("h2") ||
          document.querySelector("h1") ||
          document.querySelector("[class*='headline']");
        return headlineEl?.textContent?.trim() || "No encontrado";
      }) as string;

      return {
        success: true,
        headline,
        url: "https://elpais.com",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error en El País scraping:", error);
      return {
        success: false,
        headline: `Error: ${error}`,
        url: "https://elpais.com",
        timestamp: new Date().toISOString(),
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Fallback HTTP: extrae titular sin navegador (para entornos sin browsers)
   */
  async scrapeElPaisViaHttp(): Promise<{
    success: boolean;
    headline: string;
    url: string;
    timestamp: string;
  }> {
    try {
      const url = "https://elpais.com";
      const response = await axios.get(url, { timeout: 15000 });
      const html = String(response.data || "");

      const headline = this.extractHeadlineFromHtml(html) || "No encontrado";

      return {
        success: Boolean(headline && headline !== "No encontrado"),
        headline,
        url,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        headline: `Error: ${error}`,
        url: "https://elpais.com",
        timestamp: new Date().toISOString(),
      };
    }
  }

  private extractHeadlineFromHtml(html: string): string | null {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const raw = h1Match?.[1] || h2Match?.[1];
    if (!raw) return null;

    return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  async extractText(url: string): Promise<string> {
    const result = await this.navigate(url);
    return result.content;
  }

  async click(
    url: string,
    selector: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    let page: Page | null = null;
    try {
      if (!this.browser) {
        throw new Error("Browser no inicializado");
      }

      page = await this.browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      await page.click(selector);

      console.log(`✅ Click ejecutado en ${selector}`);

      return {
        success: true,
        message: `Click ejecutado en ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al hacer click: ${error}`,
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async fillForm(
    url: string,
    fields: Record<string, string>
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    let page: Page | null = null;
    try {
      if (!this.browser) {
        throw new Error("Browser no inicializado");
      }

      page = await this.browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      for (const [selector, value] of Object.entries(fields)) {
        await page.fill(selector, value);
      }

      console.log("✅ Formulario completado");

      return {
        success: true,
        message: "Formulario completado",
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al completar formulario: ${error}`,
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log("🔒 Playwright cerrado");
    }
    this.initialized = false;
  }
}

export const playwrightMCP = new PlaywrightMCP();

