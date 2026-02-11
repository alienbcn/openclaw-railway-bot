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
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
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
  console.log("\n🔍 Validando configuración...");
  console.log("=".repeat(60));
  
  // Telegram Bot Token
  if (!config.telegram.token) {
    throw new Error("TELEGRAM_BOT_TOKEN no está configurado");
  }
  console.log("✅ TELEGRAM_BOT_TOKEN: Configurado (longitud: " + config.telegram.token.length + ")");
  
  // Gemini API Key
  if (config.gemini.apiKey) {
    console.log("✅ GEMINI_API_KEY: Configurado (longitud: " + config.gemini.apiKey.length + ")");
  } else {
    console.log("❌ GEMINI_API_KEY: NO configurado");
  }
  
  // OpenRouter API Key
  if (config.openrouter.apiKey) {
    console.log("✅ OPENROUTER_API_KEY: Configurado (longitud: " + config.openrouter.apiKey.length + ")");
  } else {
    console.log("⚠️  OPENROUTER_API_KEY: NO configurado (fallback deshabilitado)");
  }
  
  // Serper API Key
  if (config.serper.apiKey) {
    console.log("✅ SERPER_API_KEY: Configurado (longitud: " + config.serper.apiKey.length + ")");
  } else {
    console.log("⚠️  SERPER_API_KEY: NO configurado (búsqueda deshabilitada)");
  }
  
  // Validación de LLM
  if (!config.gemini.apiKey && !config.openrouter.apiKey) {
    console.log("=".repeat(60));
    console.error("\n❌ ERROR CRÍTICO: No hay ningún LLM configurado!");
    console.error("   Configura al menos una de estas variables:");
    console.error("   - GEMINI_API_KEY (recomendado)");
    console.error("   - OPENROUTER_API_KEY (fallback)\n");
    console.log("=".repeat(60));
  }
  
  console.log("=".repeat(60));
  console.log("");
  
  if (!config.serper.apiKey) {
    console.warn("⚠️  Nota: Sin SERPER_API_KEY, la búsqueda web estará limitada");
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
