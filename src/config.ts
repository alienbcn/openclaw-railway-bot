// Configuración principal del bot
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

export const config = {
  // Telegram
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    apiUrl: "https://api.telegram.org",
  },

  // OpenRouter & LLM
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseURL: "https://openrouter.ai/api/v1",
    model: "anthropic/claude-3-haiku",
    maxTokens: 1024,
  },

  // Railway
  railway: {
    staticUrl: process.env.RAILWAY_STATIC_URL || "",
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // Serper API - Search Engine
  serper: {
    apiKey: process.env.SERPER_API_KEY || "",
    baseURL: "https://google.serper.dev",
    searchEndpoint: "/search",
  },

  // MCP & Integrations
  mcp: {
    playwright: {
      headless: true,
      browser: "chromium", // o "brave" si está disponible
    },
  },

  // OpenClaw (MCP Tools)
  openclaw: {
    enabled: process.env.OPENCLAW_ENABLED === "true",
    configPath: process.env.OPENCLAW_CONFIG_PATH || "openclaw.json",
    binPath: process.env.OPENCLAW_BIN || "node_modules/.bin/openclaw",
    agentId: process.env.OPENCLAW_AGENT_ID || "",
    thinking: process.env.OPENCLAW_THINKING || "minimal",
    timeoutSeconds: Number.parseInt(
      process.env.OPENCLAW_TIMEOUT_SECONDS || "120",
      10
    ),
  },

  // Bot behavior
  bot: {
    logLevel: process.env.LOG_LEVEL || "info",
    timeout: 30000, // 30s
    retryAttempts: 3,
    retryDelay: 1000, // ms
  },
};

// Validar config
export function validateConfig(): void {
  if (!config.telegram.token) {
    throw new Error("TELEGRAM_BOT_TOKEN no está configurado");
  }
  if (!config.openrouter.apiKey) {
    console.warn("OPENROUTER_API_KEY no está configurado - LLM deshabilitado");
  }
  if (!config.serper.apiKey) {
    console.warn("SERPER_API_KEY no está configurado - búsqueda deshabilitada");
  }
  if (config.openclaw.enabled) {
    const configPath = path.isAbsolute(config.openclaw.configPath)
      ? config.openclaw.configPath
      : path.resolve(process.cwd(), config.openclaw.configPath);
    if (!fs.existsSync(configPath)) {
      console.warn(
        `OPENCLAW_CONFIG_PATH no encontrado: ${configPath} (OpenClaw puede fallar)`
      );
    }
  }
}
