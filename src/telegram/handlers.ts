import { Context } from "grammy";
import { geminiClient } from "../llm/gemini.js";
import { openRouterClient } from "../llm/openrouter.js";
import { telegramBot } from "./bot.js";
import serperService from "../llm/serper.js";
import { config } from "../config.js";
import { runOpenClawAgent } from "../openclaw/client.js";
// Playwright se importa solo cuando sea necesario (lazy loading)

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const conversationContexts: Map<number, ConversationMessage[]> = new Map();

// Deduplicación: almacena los últimos 100 update_ids procesados
const processedUpdateIds = new Set<number>();
const MAX_UPDATES_TO_TRACK = 100;

const SYSTEM_PROMPT = `Eres un asistente amable y útil. Responde de manera concisa y clara. 
Eres capaz de navegar por internet, analizar información y ayudar al usuario con sus preguntas.`;

const BOT_VERSION = "2026-02-11.1";

async function replyInChunks(ctx: Context, text: string): Promise<void> {
  const chunks = text.match(/[\s\S]{1,4096}/g) || [text];
  for (const chunk of chunks) {
    await ctx.reply(chunk, { parse_mode: "HTML" });
  }
}

function isDateQuery(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("fecha") ||
    normalized.includes("dia") ||
    normalized.includes("día")
  ) && normalized.includes("hoy");
}

function isHeadlineQuery(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("titular") ||
    normalized.includes("periodico") ||
    normalized.includes("periódico") ||
    normalized.includes("elpais") ||
    normalized.includes("el pais")
  );
}

function formatToday(): string {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function handleNewsRequest(ctx: Context): Promise<void> {
  await ctx.reply("⏳ Extrayendo noticias de El País...");

  const { playwrightMCP } = await import("../mcp/playwright.js");

  let newsData;
  try {
    newsData = await playwrightMCP.scrapeElPais();
    const headline = newsData.headline?.trim();
    if (!newsData.success || !headline || headline === "No encontrado") {
      newsData = await playwrightMCP.scrapeElPaisViaHttp();
    }
  } catch (error) {
    console.warn("Playwright no disponible, usando fallback HTTP:", error);
    newsData = await playwrightMCP.scrapeElPaisViaHttp();
  }

  if (newsData.success) {
    const message =
      `📰 <b>Noticia Principal - El País</b>\n\n` +
      `${newsData.headline}\n\n` +
      `🔗 <a href="${newsData.url}">Leer más</a>\n` +
      `⏰ ${new Date(newsData.timestamp).toLocaleString("es-ES")}`;

    await ctx.reply(message, { parse_mode: "HTML" });
  } else {
    await ctx.reply(
      `❌ No pude extraer titulares. Error: ${newsData.headline}`
    );
  }
}

export async function registerCommandHandlers(): Promise<void> {
  const bot = telegramBot.getBot();

  // Middleware para deduplicación y logging de todos los updates
  bot.use(async (ctx, next) => {
    const updateId = ctx.update.update_id;
    
    // Verificar si ya procesamos este update
    if (processedUpdateIds.has(updateId)) {
      console.log(`[DEDUP] Update ${updateId} ya procesado, ignorando...`);
      return; // No llamar a next(), simplemente ignorar
    }
    
    // Marcar como procesado
    processedUpdateIds.add(updateId);
    
    // Mantener solo los últimos MAX_UPDATES_TO_TRACK
    if (processedUpdateIds.size > MAX_UPDATES_TO_TRACK) {
      const firstId = processedUpdateIds.values().next().value;
      if (firstId !== undefined) {
        processedUpdateIds.delete(firstId);
      }
    }
    
    const updateType = ctx.update.message?.text ? "text" : 
                       ctx.update.message?.photo ? "photo" : 
                       ctx.update.callback_query ? "callback" : "other";
    console.log(`[UPDATE] ID: ${updateId}, Tipo: ${updateType}, De: ${ctx.from?.id}, Username: @${ctx.from?.username || "unknown"}`);
    await next();
  });

  // /start
  bot.command("start", async (ctx) => {
    console.log(`[COMMAND] /start recibido de ${ctx.from?.id}`);
    conversationContexts.set(ctx.from?.id || 0, []);
    await ctx.reply(
      "¡Hola! 👋 Soy un bot de Telegram inteligente.\n\n" +
      "Puedo:\n" +
      "- 💬 Mantener conversaciones\n" +
      "- 🌐 Navegar por internet\n" +
      "- 📊 Analizar información\n\n" +
      "¿En qué puedo ayudarte?"
    );
  });

  // /help
  bot.command("help", async (ctx) => {
    const llmEnabled = Boolean(config.gemini.apiKey || config.openrouter.apiKey);
    const serperEnabled = Boolean(config.serper.apiKey);
    const openclawEnabled = config.openclaw.enabled;

    const llmLine = openclawEnabled
      ? "- 🦞 OpenClaw (tools web: Brave + fetch)\n"
      : llmEnabled
        ? "- 💬 Conversacion inteligente (Gemini)\n"
        : "- 💬 Conversacion inteligente (deshabilitada)\n";
    const bitcoinLine = serperEnabled
      ? "- /bitcoin - Obtener precio actual de Bitcoin\n"
      : "- /bitcoin - Obtener precio actual de Bitcoin (deshabilitado)\n";

    await ctx.reply(
      "📚 Comandos disponibles:\n\n" +
      "/start - Iniciar conversación\n" +
      "/help - Ver esta ayuda\n" +
      "/clear - Limpiar historial de conversación\n" +
      "/status - Ver estado del bot\n" +
      bitcoinLine +
      "/news - Obtener noticias principales de El País\n\n" +
      llmLine +
      "También puedes escribir mensajes normales para conversar."
    );
  });

  // /clear
  bot.command("clear", async (ctx) => {
    conversationContexts.set(ctx.from?.id || 0, []);
    await ctx.reply("✨ Historial de conversación limpiado.");
  });

  // /status
  bot.command("status", async (ctx) => {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const mode = config.openclaw.enabled 
      ? "OpenClaw" 
      : config.gemini.apiKey 
        ? "Gemini" 
        : config.openrouter.apiKey 
          ? "OpenRouter" 
          : "Sin LLM";

    await ctx.reply(
      `✅ Bot activo\n\n` +
      `⏱️ Uptime: ${uptimeHours}h ${uptimeMinutes}m\n` +
      `🤖 Version: ${BOT_VERSION}\n` +
      `🧠 Modo: ${mode}\n` +
      `🚀 Despliegue: Railway`
    );
  });

  // /bitcoin - Obtener precio actual de Bitcoin usando Serper
  bot.command("bitcoin", async (ctx) => {
    if (!config.serper.apiKey) {
      await ctx.reply(
        "⚠️ Comando deshabilitado. Configura SERPER_API_KEY para activar /bitcoin."
      );
      return;
    }

    try {
      await ctx.reply("⏳ Buscando precio de Bitcoin...");

      const bitcoinData = await serperService.getBitcoinPrice();

      const message =
        `💰 <b>Precio de Bitcoin</b>\n\n` +
        `${bitcoinData.price}\n\n` +
        `🔗 <a href="${bitcoinData.source}">Fuente</a>\n` +
        `⏰ ${new Date(bitcoinData.timestamp).toLocaleString("es-ES")}`;

      await ctx.reply(message, { parse_mode: "HTML" });
    } catch (error) {
      console.error("Error obteniendo precio de Bitcoin:", error);
      await ctx.reply(
        "❌ Error obteniendo el precio de Bitcoin. Asegúrate de que SERPER_API_KEY esté configurada."
      );
    }
  });

  // /news - Obtener noticias principales de El País usando Playwright
  bot.command("news", async (ctx) => {
    try {
      await handleNewsRequest(ctx);
    } catch (error) {
      console.error("Error obteniendo noticias:", error);
      await ctx.reply(
        "❌ Error extrayendo noticias. Verifica los logs para más detalles."
      );
    }
  });

  // Manejar mensajes de texto
  bot.on("message:text", async (ctx) => {
    try {
      console.log(`[HANDLER] Mensaje de texto recibido de ${ctx.from?.id}: ${ctx.message.text}`);
      const userId = ctx.from?.id || 0;
      const userMessage = ctx.message.text;

      if (isDateQuery(userMessage)) {
        await ctx.reply(`📅 Hoy es ${formatToday()}`);
        return;
      }

      if (isHeadlineQuery(userMessage)) {
        await handleNewsRequest(ctx);
        return;
      }

      if (config.openclaw.enabled) {
        try {
          const sessionId = `telegram:${userId}`;
          const result = await runOpenClawAgent(userMessage, sessionId);

          if (!result.text) {
            await ctx.reply("⚠️ OpenClaw no devolvio respuesta.");
            return;
          }

          await replyInChunks(ctx, result.text);
          return;
        } catch (error) {
          console.error("Error OpenClaw:", error);
          if (!config.gemini.apiKey && !config.openrouter.apiKey) {
            await ctx.reply(
              "❌ OpenClaw fallo y no hay LLM configurado. Configura GEMINI_API_KEY."
            );
            return;
          }
        }
      }

      if (!config.gemini.apiKey && !config.openrouter.apiKey) {
        await ctx.reply(
          "⚠️ Conversacion inteligente deshabilitada. Configura GEMINI_API_KEY para activarla."
        );
        return;
      }

      // Obtener o crear contexto de conversación
      let messages = conversationContexts.get(userId) || [];

      // Agregar mensaje del usuario
      messages.push({
        role: "user",
        content: userMessage,
      });

      // Generar respuesta con Gemini (o OpenRouter como fallback)
      let response: string;
      if (config.gemini.apiKey) {
        response = await geminiClient.generateResponseWithRetry(
          messages.slice(-10), // Últimos 10 mensajes para contexto
          SYSTEM_PROMPT
        );
      } else {
        response = await openRouterClient.generateResponseWithRetry(
          messages.slice(-10),
          SYSTEM_PROMPT
        );
      }

      if (!response || !response.trim()) {
        await ctx.reply(
          "⚠️ No pude generar una respuesta. Prueba /news o pregunta otra cosa."
        );
        return;
      }

      // Agregar respuesta al historial
      messages.push({
        role: "assistant",
        content: response,
      });

      // Guardar contexto actualizado (máximo 50 mensajes)
      conversationContexts.set(userId, messages.slice(-50));

      // Dividir respuesta en bloques si es muy larga
      await replyInChunks(ctx, response);
      console.log(`[HANDLER] Respuesta enviada exitosamente a ${userId}`);
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      await ctx.reply(
        "❌ Disculpa, hubo un error procesando tu mensaje. Por favor intenta de nuevo."
      );
    }
  });

  console.log("[HANDLERS] Todos los handlers registrados correctamente");
}
