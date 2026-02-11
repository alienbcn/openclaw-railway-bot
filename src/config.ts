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

  // Google Gemini (LLM principal)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    baseURL: "https://generativelanguage.googleapis.com",
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
    maxTokens: Number.parseInt(process.env.GEMINI_MAX_TOKENS || "2048", 10),
    temperature: Number.parseFloat(process.env.GEMINI_TEMPERATURE || "0.7"),
    topP: Number.parseFloat(process.env.GEMINI_TOP_P || "0.95"),
  },

  // OpenRouter (fallback, opcional)
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
  if (!config.gemini.apiKey && !config.openrouter.apiKey) {
    console.warn("Ni GEMINI_API_KEY ni OPENROUTER_API_KEY están configurados - LLM deshabilitado");
  } else if (config.gemini.apiKey) {
    console.log("✅ Gemini API configurada correctamente");
  } else if (config.openrouter.apiKey) {
    console.log("✅ OpenRouter API configurada (fallback)");
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
