/**
 * Punto de entrada principal - openclaw-railway-bot
 * 
 * Este archivo se puede usar para:
 * - Desarrollo local con flujo de polling
 * - Webhook en futuras expansiones
 * 
 * Para Railway (producción), se usa src/worker.ts
 */

import { validateConfig } from "./config.js";
import { telegramBot } from "./telegram/bot.js";
import { registerCommandHandlers } from "./telegram/handlers.js";

const log = {
  info: (msg: string) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg: string, err?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
    if (err) console.error(err);
  },
};

async function main() {
  try {
    log.info("🚀 Iniciando openclaw-railway-bot");
    log.info("📅 Fecha: " + new Date().toISOString());
    log.info("🌍 Entorno: " + (process.env.NODE_ENV || "development"));
    log.info("");

    // Validar configuración
    validateConfig();
    log.info("✅ Configuración validada");

    // Registrar handlers
    await registerCommandHandlers();
    log.info("✅ Handlers registrados");

    // Iniciar el bot
    await telegramBot.start();
    log.info("✅ Bot iniciado");

    log.info("🔄 Bot escuchando mensajes...");
  } catch (error) {
    log.error("Error fatal:", error as Error);
    process.exit(1);
  }
}

main();
