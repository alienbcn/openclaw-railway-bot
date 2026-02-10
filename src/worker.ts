/**
 * Worker Process para Railway
 * Ejecuta el bot de Telegram como un proceso de worker (no web)
 * Esto asegura disponibilidad 24/7 sin timeouts HTTP
 */

import { validateConfig } from "./config.js";
import { telegramBot } from "./telegram/bot.js";
import { registerCommandHandlers } from "./telegram/handlers.js";

// Logger
const log = {
  info: (msg: string) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg: string, err?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
    if (err) console.error(err);
  },
  warn: (msg: string) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
};

let isRunning = true;

// Graceful shutdown
process.on("SIGTERM", async () => {
  log.info("Señal SIGTERM recibida, iniciando shutdown graceful...");
  isRunning = false;
  process.exit(0);
});

process.on("SIGINT", async () => {
  log.info("Señal SIGINT recibida, iniciando shutdown graceful...");
  isRunning = false;
  process.exit(0);
});

// Manejo de errores no capturados
process.on("uncaughtException", (error) => {
  log.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  log.error(`Unhandled Rejection at ${promise}:`, reason as Error);
  process.exit(1);
});

async function main() {
  try {
    log.info("🚀 Iniciando openclaw-railway-bot worker...");

    // Validar configuración
    validateConfig();
    log.info("✅ Configuración validada");

    // Registrar handlers de comandos
    await registerCommandHandlers();
    log.info("✅ Handlers de comandos registrados");

    // Iniciar bot
    await telegramBot.start();
    log.info("✅ Bot de Telegram iniciado correctamente");

    // Keep alive: el bot se mantiene corriendo indefinidamente
    log.info("🔄 Bot 24/7 activado. Escuchando mensajes...");

    // Ping cada 5 minutos para verificar que sigue vivo
    setInterval(() => {
      if (isRunning) {
        log.info("✅ Bot activo y escuchando");
      }
    }, 5 * 60 * 1000);
  } catch (error) {
    log.error("Error fatal al iniciar bot:", error as Error);
    process.exit(1);
  }
}

// Ejecutar
main();
